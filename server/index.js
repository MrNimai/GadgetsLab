const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001; // Changed to 3001

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Successfully connected to MongoDB Atlas!');
})
.catch((error) => {
  console.error('Error connecting to MongoDB Atlas:', error);
});

// A simple test route
app.get('/', (req, res) => {
  res.send('Hello from the GadgetLab Plus Server!');
});

const jwt = require('jsonwebtoken');

// Signup Route
app.post('/api/signup', async (req, res) => {
  console.log("--- /api/signup route was hit! ---");
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    res.status(201).json({ message: 'User created successfully!', userId: savedUser._id });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

const auth = require('./middleware/auth');
const crypto = require('crypto');

// Login Route
app.post('/api/login', async (req, res) => {
  console.log("--- /api/login route was hit! ---");
  try {
    const { email, password } = req.body;

    // Find the user by email using a case-insensitive regex
    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. Please check your email and password.' });
    }

    // Compare the provided password with the stored hashed password
    console.log('--- DEBUG: Comparing Passwords ---');
    console.log('Plain Password from user:', password);
    console.log('Hashed Password from DB:', user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('bcrypt.compare result (isMatch):', isMatch);
    console.log('--- END DEBUG ---');

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Please check your email and password.' });
    }

    // If credentials are correct, create a JSON Web Token (JWT)
    const payload = {
      user: {
        id: user.id,
        name: user.name
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({
          message: 'Logged in successfully!',
          token: token
        });
      }
    );

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Forgot Password Route
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    // Find the user by email using a case-insensitive regex
    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (!user) {
      return res.status(404).json({ message: 'No user with that email found.' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to user
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // In a real app, you would send an email. Here, we'll log the link.
    const resetUrl = `http://127.0.0.1:5500/pages/reset-password.html?token=${resetToken}`;
    console.log('====================================');
    console.log('PASSWORD RESET LINK (for development):');
    console.log(resetUrl);
    console.log('====================================');

    res.json({ message: 'A password reset link has been generated. Check the server console.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Reset Password Route
app.post('/api/reset-password/:token', async (req, res) => {
  try {
    // Get hashed token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Set the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Protected Profile Route
app.get('/api/profile', auth, async (req, res) => {
  try {
    // auth middleware has already put the user's data in req.user
    // We can fetch more details from the database if needed
    const user = await User.findById(req.user.id).select('-password'); // -password means do not select the password field
    res.json({
      message: 'Welcome to your profile!',
      user: user
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});