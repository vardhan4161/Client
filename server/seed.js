/**
 * Seed script — creates 2 demo recruiter accounts if they don't already exist.
 * Run: node seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Ensure DB connects before seeding
require('./db/connection');

const { User } = require('./models');
const mongoose = require('mongoose');

const DEMO_ACCOUNTS = [
    {
        name: 'Sravan',
        email: 'sravan@talentsetu.ai',
        password: 'Demo@1234',
    },
    {
        name: 'Vardhan',
        email: 'vardhan@talentsetu.ai',
        password: 'Demo@5678',
    },
    {
        name: 'Example',
        email: 'example@talentsetu.ai',
        password: 'Demo@9012',
    },
];

async function seed() {
    // Wait for Mongoose connection
    await new Promise((resolve) => {
        if (mongoose.connection.readyState === 1) return resolve();
        mongoose.connection.once('open', resolve);
        // Timeout after 10s
        setTimeout(() => { console.error('DB connection timed out'); process.exit(1); }, 10000);
    });

    console.log('\n🌱 Seeding demo accounts...\n');

    for (const account of DEMO_ACCOUNTS) {
        const existing = await User.findOne({ email: account.email });
        if (existing) {
            console.log(`  ⏭  ${account.email} already exists — skipping`);
            continue;
        }

        const password_hash = await bcrypt.hash(account.password, 10);
        await User.create({ name: account.name, email: account.email, password_hash });
        console.log(`  ✅ Created: ${account.email} / ${account.password}`);
    }

    console.log('\n✅ Seeding complete.\n');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
});
