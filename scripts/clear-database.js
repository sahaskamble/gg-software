const mongoose = require('mongoose');
require('dotenv').config();

async function clearDatabase() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected successfully');

        // Get all collections
        const collections = await mongoose.connection.db.collections();

        // Drop each collection
        for (const collection of collections) {
            try {
                console.log(`Dropping collection: ${collection.collectionName}`);
                await collection.drop();
                console.log(`Successfully dropped ${collection.collectionName}`);
            } catch (error) {
                console.error(`Error dropping ${collection.collectionName}:`, error.message);
            }
        }

        console.log('All collections have been dropped');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
}

clearDatabase();
