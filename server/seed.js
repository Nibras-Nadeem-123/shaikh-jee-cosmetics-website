import mongoose from 'mongoose';
import 'dotenv/config'; // Import dotenv configuration for ES Modules
import Product from './models/Product.js';
import User from './models/User.js';

const products = [
  {
    name: 'Velvet Matte Lipstick',
    slug: 'velvet-matte-lipstick',
    category: 'Lips',
    subcategory: 'Lipstick',
    price: 899,
    description: 'Long-lasting velvet matte lipstick that delivers intense color payoff with a comfortable, non-drying formula.',
    images: ['https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?q=80&w=1080'],
    rating: 4.8,
    reviewCount: 234,
    shades: [
      { id: 's1', name: 'Nude Rose', color: '#D4A6A6', stock: 100 },
      { id: 's2', name: 'Berry Kiss', color: '#A83B62', stock: 50 }
    ],
    inStock: true,
    isBestSeller: true
  },
  {
    name: 'Radiant Glow Serum',
    slug: 'radiant-glow-serum',
    category: 'Skincare',
    subcategory: 'Serum',
    price: 1499,
    description: 'Intensive hydrating serum with hyaluronic acid and vitamin C that brightens and plumps skin.',
    images: ['https://images.unsplash.com/photo-1643379850623-7eb6442cd262?q=80&w=1080'],
    rating: 4.9,
    reviewCount: 567,
    inStock: true,
    isNew: true
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Atlas for seeding...');

    // 1. Create a default admin user to own the products
    const adminEmail = 'admin@shaikhjee.com';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        name: 'Shaikh Jee Admin',
        email: adminEmail,
        password: 'password123',
        role: 'admin'
      });
      console.log('Admin user created (password: password123)');
    }

    // 2. Clear existing products
    await Product.deleteMany();
    console.log('Existing products cleared');

    // 3. Add products with admin ID
    const productsWithAdmin = products.map(p => ({ ...p, user: admin._id }));
    await Product.insertMany(productsWithAdmin);

    console.log('Luxe products seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedProducts();
