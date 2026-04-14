import db from './db.js';
import bcrypt from 'bcryptjs';

const test = async () => {
    const username = 'super';
    const password = 'admin';

    try {
        console.log('--- Testing Super Admin Login ---');
        const [superData] = await db.promise().query("SELECT * FROM super_admins WHERE username=?", [username]);
        console.log('Super Admin data found:', superData.length);
        if (superData.length > 0) {
            const user = superData[0];
            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Password match:', isMatch);
        }

        console.log('\n--- Testing Tenant Branding (super) ---');
        const [clientData] = await db.promise().query("SELECT business_name, logo_url FROM clients WHERE username = ?", [username]);
        console.log('Client branding found:', clientData.length);

        console.log('\n--- Testing Client Login (if applicable) ---');
        // Just checking if query works
        await db.promise().query("SELECT * FROM clients LIMIT 1");
        console.log('Clients query worked');

    } catch (err) {
        console.error('ERROR DURING TEST:', err);
    } finally {
        process.exit(0);
    }
};

test();
