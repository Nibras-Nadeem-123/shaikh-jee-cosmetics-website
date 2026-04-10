import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
const TEST_ROUTE = '/reviews'; // Replace with a protected route
const VALID_TOKEN = '<your_valid_jwt_token>'; // Replace with a valid token
const INVALID_TOKEN = 'invalid_token';

const testMiddleware = async () => {
  try {
    console.log('Testing without token...');
    await axios.get(`${BASE_URL}${TEST_ROUTE}`);
  } catch (error) {
    console.error('No Token Response:', error.response?.data);
  }

  try {
    console.log('Testing with invalid token...');
    await axios.get(`${BASE_URL}${TEST_ROUTE}`, {
      headers: { Authorization: `Bearer ${INVALID_TOKEN}` },
    });
  } catch (error) {
    console.error('Invalid Token Response:', error.response?.data);
  }

  try {
    console.log('Testing with valid token...');
    await axios.get(`${BASE_URL}${TEST_ROUTE}`, {
      headers: { Authorization: `Bearer ${VALID_TOKEN}` },
    });
  } catch (error) {
    console.error('Valid Token Response:', error.response?.data);
  }
};

testMiddleware();