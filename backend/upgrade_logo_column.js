import db from './db.js';

const migrate = async () => {
    try {
        await db.promise().query("ALTER TABLE clients MODIFY COLUMN logo_url LONGTEXT NULL");
        console.log("✅ Updated logo_url column to LONGTEXT");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    }
};

migrate();
