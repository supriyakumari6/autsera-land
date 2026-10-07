
require('dotenv').config({ path: '../backend/.env' });
const mongoose = require('mongoose');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/autsera_land');
    console.log('✅ Connected to MongoDB');

    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name).join(', ') || 'none yet (will be created on first use)');
    console.log('');
    console.log('Database is ready! Start the backend server and the frontend to play.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
