import db, { templateDb } from '../db.js';

// Table names that should be created in every TENANT database
const TENANT_TABLE_LIST = [
  'barcodes',
  'cash_refunds',
  'category_gst',
  'credit_notes',
  'dayout_reports',
  'edit_logs',
  'item_replacements',
  'login_logs',
  'masterdata',
  'password_resets',
  'purchase_edit_logs',
  'purchases',
  'replacements',
  'sales_items',
  'sales_users',
  'shop_config',
  'stock_adjustments',
  'suppliers',
  'system_stock',
  'users'
];

/**
 * Creates a new database for a tenant and clones all tables from the master DB
 * @param {string} dbName - e.g. gar_db_patel
 */
export const setupTenantDatabase = async (dbName) => {
  let setupConn = null;
  try {
    console.log(`🔨 [Multitenancy] Creating database: ${dbName}`);

    // 1. Create the database
    await db.promise().query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);

    // 2. Get a connection and use the new database
    setupConn = await db.promise().getConnection();
    await setupConn.query(`USE \`${dbName}\``);

    // 3. Clone each table's schema
    let clonedCount = 0;
    for (const tableName of TENANT_TABLE_LIST) {
      try {
        console.log(`📋 Cloning table: ${tableName} -> ${dbName}`);

        // Get the CREATE TABLE statement from the template database (garment_db)
        const [schemaResult] = await templateDb.promise().query(`SHOW CREATE TABLE \`${tableName}\``);
        if (!schemaResult || schemaResult.length === 0) {
          console.warn(`⚠️ Table ${tableName} missing in template database. Skipping.`);
          continue;
        }

        let createSql = schemaResult[0]['Create Table'];

        // Remove AUTO_INCREMENT value to start fresh
        createSql = createSql.replace(/AUTO_INCREMENT=\d+/g, '');

        // Create the table in the tenant database
        await setupConn.query(createSql);
        clonedCount++;
      } catch (tableErr) {
        console.warn(`⚠️ Error cloning table ${tableName}: ${tableErr.message}. Skipping.`);
      }
    }

    console.log(`✅ Tenant database ${dbName} initialized. ${clonedCount}/${TENANT_TABLE_LIST.length} tables cloned.`);
    return true;
  } catch (err) {
    console.error(`❌ [Multitenancy] Error setting up database ${dbName}:`, err);
    throw err;
  } finally {
    if (setupConn) {
      try {
        // CRITICAL: Reset the connection to the master database before releasing it back to the pool
        await setupConn.query(`USE \`${process.env.DB_NAME}\``);
      } catch (e) {
        console.error("⚠️ Error resetting connection to master DB:", e.message);
      }
      setupConn.release();
    }
  }
};
