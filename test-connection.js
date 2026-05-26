const mongoose = require('mongoose');
require('dotenv').config({ path: 'mongo.env' });

const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://admin:TmevANlO8EJjFNva@cluster0.he8l0ni.mongodb.net/mcq_platform?retryWrites=true&w=majority';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connection successful!');
    
    // Test if we can create a teacher
    const Teacher = mongoose.model('Teacher', new mongoose.Schema({
      email: String,
      password: String,
      name: String
    }));
    
    const teacherCount = await Teacher.countDocuments();
    console.log(`📊 Teachers in database: ${teacherCount}`);
    
    await mongoose.connection.close();
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('💡 Troubleshooting tips:');
    console.log('1. Check your internet connection');
    console.log('2. Verify the MongoDB connection string');
    console.log('3. Ensure MongoDB Atlas whitelists your IP address');
    console.log('4. Check if the database user has proper permissions');
  }
}

testConnection();