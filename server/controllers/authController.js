const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const signToken = (user) =>
    jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password_hash, name });
        const token = signToken(user);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: { user: { id: user._id, email: user.email, name: user.name }, token }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = signToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: { user: { id: user._id, email: user.email, name: user.name }, token }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

module.exports = { register, login };
