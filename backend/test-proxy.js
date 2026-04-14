import db, { dbStorage } from './db.js';

const masterDb = dbStorage.getStore(); // Wait, I can't get it outside a .run

const test = async () => {
    try {
        // Find masterDb in the module
        // We can't access it directly, but we know db default is dbProxy

        console.log('Testing dbProxy outside run:');
        const [r1] = await db.promise().query("SELECT 1");
        console.log('Result 1:', r1);

        console.log('\nTesting dbProxy inside run:');
        // We need the actual masterDb to pass to run, but it's not exported.
        // Wait, db.js exports getTenantDb. getTenantDb() with no args returns masterDb?
        // Let's check db.js
        /*
        export const getTenantDb = (dbName) => {
          if (!dbName) return masterDb;
        */

        const { getTenantDb } = await import('./db.js');
        const m = getTenantDb();

        await dbStorage.run(m, async () => {
            const [r2] = await db.promise().query("SELECT 1");
            console.log('Result 2:', r2);
        });

    } catch (err) {
        console.error('TEST ERROR:', err);
    } finally {
        process.exit(0);
    }
};

test();
