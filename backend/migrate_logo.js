import db from './db.js';

const migrate = async () => {
    try {
        await db.promise().query("ALTER TABLE clients ADD COLUMN logo_url TEXT NULL AFTER business_name");
        console.log("✅ Added logo_url column to clients table");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    }
};

migrate();
