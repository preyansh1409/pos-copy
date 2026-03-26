import db from "../db.js";

/* ================= DASHBOARD SUMMARY ================= */
export const getDashboardSummary = (req, res) => {
  const { month } = req.query;
  let salesMonthFilter = '';
  let purchaseMonthFilter = '';
  if (month) {
    salesMonthFilter = `AND DATE_FORMAT(sale_date, '%Y-%m') = '${month}'`;
    purchaseMonthFilter = `AND DATE_FORMAT(purchase_date, '%Y-%m') = '${month}'`;
  }
  const salesQuery = `
    SELECT
      COUNT(*) AS totalSalesBills,
      IFNULL(SUM(grand_total), 0) AS totalSalesAmount,
      IFNULL(SUM(CASE WHEN payment_mode = 'Cash' THEN grand_total ELSE 0 END), 0) AS cashSales,
      IFNULL(SUM(CASE WHEN payment_mode = 'Online' THEN grand_total ELSE 0 END), 0) AS onlineSales
    FROM (
      SELECT
        invoice_no,
        MAX(grand_total) AS grand_total,
        MAX(payment_mode) AS payment_mode
      FROM sales_items
      WHERE invoice_no IS NOT NULL AND invoice_no != ''
        ${salesMonthFilter}
      GROUP BY invoice_no
    ) sales_invoice;
  `;

  /* ================= PURCHASE QUERY (INVOICE LEVEL) ================= */
  const purchaseQuery = `
    SELECT
      COUNT(*) AS totalPurchaseBills,
      IFNULL(SUM(total_amount), 0) AS totalPurchaseAmount,
      IFNULL(SUM(CASE WHEN payment_mode = 'Cash' THEN total_amount ELSE 0 END), 0) AS cashPurchase,
      IFNULL(SUM(CASE WHEN payment_mode = 'Online' THEN total_amount ELSE 0 END), 0) AS onlinePurchase,
      IFNULL(SUM(CASE WHEN payment_mode = 'Cheque' THEN total_amount ELSE 0 END), 0) AS chequePurchase,
      IFNULL(SUM(CASE WHEN payment_mode = 'Credit' THEN total_amount ELSE 0 END), 0) AS creditPurchase
    FROM (
      SELECT
        invoice_no,
        SUM(amount) AS total_amount,
        (SELECT payment_mode FROM purchases p2 WHERE p2.invoice_no = p1.invoice_no ORDER BY p2.id ASC LIMIT 1) AS payment_mode
      FROM purchases p1
      WHERE invoice_no IS NOT NULL AND invoice_no != ''
        ${purchaseMonthFilter}
      GROUP BY invoice_no
    ) invoice_summary;
  `;

  /* ================= EXECUTE SALES ================= */
  db.query(salesQuery, (err, salesResult) => {
    if (err) {
      console.error("❌ SALES QUERY ERROR:", err);
      return res.status(500).json({ message: "Sales query failed" });
    }

    /* ================= EXECUTE PURCHASE ================= */
    db.query(purchaseQuery, (err2, purchaseResult) => {
      if (err2) {
        console.error("❌ PURCHASE QUERY ERROR:", err2);
        return res.status(500).json({ message: "Purchase query failed" });
      }

      const sales = salesResult[0];
      const purchase = purchaseResult[0];

      /* ================= RESPONSE ================= */
      res.json({
        sales: {
          totalBills: Number(sales.totalSalesBills),
          totalAmount: Number(sales.totalSalesAmount),
          cashAmount: Number(sales.cashSales),
          onlineAmount: Number(sales.onlineSales),
        },
        purchase: {
          totalBills: Number(purchase.totalPurchaseBills),
          totalAmount: Number(purchase.totalPurchaseAmount),
          cashAmount: Number(purchase.cashPurchase),
          onlineAmount: Number(purchase.onlinePurchase),
          chequeCount: Number(purchase.chequePurchase),
          creditCount: Number(purchase.creditPurchase),
        },
        profit:
          Number(sales.totalSalesAmount) -
          Number(purchase.totalPurchaseAmount),
      });
    });
  });
};
