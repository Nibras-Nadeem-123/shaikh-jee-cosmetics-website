import express from 'express';
import 'dotenv/config';

const app = express();

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Test API' });
});

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Healthy' });
});

app.get('/api/products/:slug', (req, res) => {
  res.json({ 
    success: true, 
    cached: false,
    product: {
      _id: "test123",
      name: "Test Product",
      slug: req.params.slug,
      price: 999
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Minimal test server running on port ${PORT}`);
  
  // Exit after 5 seconds
  setTimeout(() => {
    console.log('✅ Test passed');
    process.exit(0);
  }, 5000);
});
