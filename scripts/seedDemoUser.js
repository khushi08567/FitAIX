import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../server/models/User.js';

dotenv.config();

const email = 'demo@example.com';
const initialPassword = 'DemoPassword@123';

try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auth-system');
  const password = await bcrypt.hash(initialPassword, 12);
  await User.findOneAndUpdate(
    { email },
    { firstName: 'Demo', lastName: 'User', email, password },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Demo account is ready: ${email}`);
  console.log(`Initial password: ${initialPassword}`);
  console.log('Use this email in the browser, then replace its password through the reset screen.');
} catch (error) {
  console.error(`Unable to create the demo account: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
