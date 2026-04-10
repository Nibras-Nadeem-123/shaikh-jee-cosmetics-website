import express from 'express';
import 'dotenv/config';

const app = express();

app.get('/', (req, res) => {
  res.send('Test server works!');
});

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`✅ Environment loaded: MONGO_URI=${process.env.MONGO_URI ? 'YES' : 'NO'}`);
  console.log(`✅ JWT_SECRET loaded: ${process.env.JWT_SECRET ? 'YES' : 'NO'}`);
  
  // Exit after 2 seconds
  setTimeout(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  }, 2000);
});
