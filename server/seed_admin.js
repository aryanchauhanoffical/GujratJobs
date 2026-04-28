const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    await User.deleteOne({ email: 'admin@gujaratjobs.in' });

    await User.create({
      name: 'System Admin',
      email: 'admin@gujaratjobs.in',
      password: 'admin123',
      phone: '9876543210',
      location: { city: 'Ahmedabad', state: 'Gujarat' },
      role: 'admin',
      isVerified: true,
    });
    console.log('Admin recreated. Login: admin@gujaratjobs.in / admin123');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
