
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerAdmin = async (req, res) => {
    const { username, password } = req.body;
    try {
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) return res.status(400).json({ message: 'Admin already exists' });

    // استخدم salt قوي
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const admin = new Admin({ username, password: hashedPassword });

    await admin.save();

    // إصدار توكن JWT
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('adminToken', token, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const loginAdmin = async (req, res) => {
    const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // إصدار توكن JWT
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('adminToken', token, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const verifyAdmin = (req, res, next) => {
  const token = req.cookies.adminToken;
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded.username;
    next();
  } catch (err) {
      return res.status(401).json({ message: 'Token is not valid or expired' });
  }
};

export const refreshAdminToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token, authorization denied' });
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const newToken = jwt.sign({ username: decoded.username }, JWT_SECRET, { expiresIn: '15m' });
    res.cookie('adminToken', newToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 15 * 60 * 1000 });
    return res.status(200).json({ message: 'Token refreshed' });
} catch (err) {
    return res.status(401).json({ message: 'Refresh token is not valid or expired' });
  }
};

export const logoutAdmin = (req, res) => {
  res.clearCookie('adminToken', { httpOnly: true, sameSite: 'None', secure: true });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'None', secure: true });
  return res.status(200).json({ message: 'Logged out successfully' });
};