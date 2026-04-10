/**
 * Admin User Creation Script
 * 
 * Usage: node create-admin.js <name> <email> <password>
 * Example: node create-admin.js "Admin User" "admin@shaikhjee.com" "Admin@123"
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const args = process.argv.slice(2);

if (args.length !== 3) {
  console.error('❌ Usage: node create-admin.js <name> <email> <password>');
  console.error('Example: node create-admin.js "Admin User" "admin@shaikhjee.com" "Admin@123"');
  process.exit(1);
}

const [name, email, password] = args;

// Email validation regex
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// Password validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

if (!emailRegex.test(email)) {
  console.error('❌ Invalid email format');
  process.exit(1);
}

if (!passwordRegex.test(password)) {
  console.error('❌ Password must contain:');
  console.error('  - At least 8 characters');
  console.error('  - One uppercase letter');
  console.error('  - One lowercase letter');
  console.error('  - One number');
  console.error('  - One special character');
  process.exit(1);
}

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.error('❌ User with this email already exists');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('📋 User Details:');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin._id}\n`);
    console.log('🔐 You can now login with these credentials at /login\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createAdmin();
