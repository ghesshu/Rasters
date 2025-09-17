// Run this script to fix the email index issue
require('dotenv').config();
const mongoose = require('mongoose');

async function fixEmailIndex() {
    try {
        // Use the same DB_URI as your main application
        const DB_URI = process.env.DB_URI || "mongodb://localhost:27017/rasters_db";
        
        // Connect to your database
        await mongoose.connect(DB_URI);
        console.log(`Connected to database: ${DB_URI}`);
        
        const db = mongoose.connection.db;
        const collection = db.collection('users');
        
        // Drop the existing email index
        try {
            await collection.dropIndex('email_1');
            console.log('✅ Dropped existing email index');
        } catch (error) {
            console.log('ℹ️  Email index may not exist or already dropped:', error.message);
        }
        
        // Create a new sparse unique index for email
        await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
        console.log('✅ Created sparse unique index for email');
        
        console.log('🎉 Email index migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

fixEmailIndex();