
require('dotenv').config();
const fs       = require('fs');
const path     = require('path');
const crypto   = require('crypto');
const mongoose = require('mongoose');
const app      = require('./app');

const PORT     = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, '.data');

function die(lines) {
  console.error('\n❌ ' + lines.join('\n   ') + '\n');
  process.exit(1);
}

async function resolveDatabase() {
  
  if (process.env.MONGO_URI) {
    if (!process.env.JWT_SECRET)
      die(['JWT_SECRET is missing.', 'Set it next to MONGO_URI (a long random string).']);
    return { uri: process.env.MONGO_URI, mode: 'your MongoDB (MONGO_URI)' };
  }

  
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!process.env.JWT_SECRET) {                          
    const f = path.join(DATA_DIR, 'jwt-secret');
    if (!fs.existsSync(f)) fs.writeFileSync(f, crypto.randomBytes(48).toString('hex'));
    process.env.JWT_SECRET = fs.readFileSync(f, 'utf8').trim();
  }

  let MongoMemoryServer;
  try { ({ MongoMemoryServer } = require('mongodb-memory-server')); }
  catch {
    die(['No database configured.',
         'Either run "npm install" in the backend folder (adds the built-in local database),',
         'or set MONGO_URI to a MongoDB Atlas connection string (see DEPLOYMENT.md).']);
  }

  console.log('⏳ Starting local database (the first run downloads MongoDB once — please wait)…');
  try {
    const dbPath = path.join(DATA_DIR, 'db');
    fs.mkdirSync(dbPath, { recursive: true });
    const mongod = await MongoMemoryServer.create({ instance: { dbPath, storageEngine: 'wiredTiger' } });
    return { uri: mongod.getUri('autsera_land'), mode: 'built-in local database (saved in backend/.data)' };
  } catch (err) {
    die(['Could not start the built-in local database: ' + err.message.split('\n')[0],
         'It needs internet once to download MongoDB.',
         'Alternative: create a free MongoDB Atlas database and set MONGO_URI (see DEPLOYMENT.md).']);
  }
}

async function main() {
  const { uri, mode } = await resolveDatabase();
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  } catch (err) {
    die(['Database connection failed: ' + err.message,
         'Check the MONGO_URI password, and in Atlas allow network access from 0.0.0.0/0.']);
  }

  const server = app.listen(PORT, () => {
    console.log('\n✅ Database connected → ' + mode);
    console.log('🚀 Autsera Land is running!\n');
    console.log('   👉 Open the game:  http://localhost:' + PORT);
    console.log('   (Live Server on port 5500 also works while this window stays open.)\n');
  });
  server.on('error', err => {
    if (err.code === 'EADDRINUSE')
      die([`Port ${PORT} is already in use.`, 'Close the other server window (or set PORT in .env) and try again.']);
    die([err.message]);
  });
}

main();
