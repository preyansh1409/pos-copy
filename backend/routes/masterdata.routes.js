
import express from 'express';
import { addProduct, getCategories, getAllProducts, getAllColors, getColorsForCategory, getSizesForCategory, getNextBarcode, getProductByBarcode, getGstForCategory, setGstForCategory, getAllGstConfig, getLatestPrice, getItemsByCategory, getExistingVariants, modifyProduct } from '../controllers/masterdata.controller.js';

const router = express.Router();

router.get('/next-barcode', getNextBarcode);
router.get('/product-by-barcode', getProductByBarcode);
router.get('/latest-price', getLatestPrice);
router.get('/colors-for-category', getColorsForCategory);
router.get('/sizes-for-category', getSizesForCategory);
router.get('/colors', getAllColors);
router.post('/add-product', addProduct);
router.get('/categories', getCategories);
router.get('/all-products', getAllProducts);

// New Modification Routes
router.get('/items-by-category', getItemsByCategory);
router.get('/existing-variants', getExistingVariants);
router.post('/modify-product', modifyProduct);

// New route: Get all barcodes (from masterdata to get size/color)
router.get('/all-barcodes', (req, res) => {
	import('../db.js').then(({ default: db }) => {
		const sizeOrder = "'XS','S','M','L','XL','XXL','3XL','4XL','26','28','30','32','34','36','38','40','42','44','46'";
		const sql = `
			SELECT barcode, size, color, item as item_name, category, product_code 
			FROM masterdata 
			ORDER BY product_code ASC, FIELD(size, ${sizeOrder}) ASC, color ASC
		`;
		db.query(sql, (err, results) => {
			if (err) return res.status(500).json({ message: 'DB error', error: err });
			res.json({ barcodes: results });
		});
	});
});
router.get('/gst-for-category', getGstForCategory);
router.post('/set-gst', setGstForCategory);
router.get('/all-gst-config', getAllGstConfig);

export default router;
