import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("MongoDB is already connected.");
    return;
  }

  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shaikhjee';
  console.log(`Attempting to connect to MongoDB at URI: ${mongoURI}`);

  try {
    await mongoose.connect(mongoURI); // Removed deprecated options
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error(`Failed to connect to MongoDB at URI: ${mongoURI}`);
    throw new Error('Failed to connect to MongoDB'); // Throw error for better debugging
  }
};

export default connectDB;