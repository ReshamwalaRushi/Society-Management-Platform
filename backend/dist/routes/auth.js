"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('phone').notEmpty().withMessage('Phone is required')
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
        const { name, email, password, phone, role, societyId } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        const user = await User_1.default.create({
            name, email, password, phone,
            role: role || 'resident',
            societyId: societyId || 'default'
        });
        const token = user.getSignedJwtToken();
        res.status(201).json({
            success: true, token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        user.lastLogin = new Date();
        await user.save();
        const token = user.getSignedJwtToken();
        res.json({
            success: true, token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, unit: user.unit }
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.get('/me', auth_1.protect, async (req, res) => {
    res.json({ success: true, user: req.user });
});
router.put('/profile', auth_1.protect, async (req, res) => {
    try {
        const { name, phone, avatar } = req.body;
        const user = await User_1.default.findByIdAndUpdate(req.user.id, { name, phone, avatar }, { new: true });
        res.json({ success: true, user });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
