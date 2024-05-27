import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';
import db from '../models/index.js';

const userController = {
    register: async (req, res) => {
        try {
            const { email, password } = req.body;
            const profilePhoto = req.file.path;
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await db.User.create({ email, password: hashedPassword, profilePhoto });
            res.status(201).json({ message: 'User registered successfully', user });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Error registering user', error });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await db.User.findOne({ where: { email } });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ message: 'Login successful', token, user: { email: user.email, profilePhoto: user.profilePhoto } });
        } catch (error) {
            res.status(500).json({ message: 'Error logging in', error });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await db.User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
            const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Password Reset',
                text: `Click here to reset your password: ${resetLink}`,
            });

            res.json({ message: 'Password reset link sent to your email' });
        } catch (error) {
            res.status(500).json({ message: 'Error sending reset link', error });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { token, newPassword } = req.body;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await db.User.findByPk(decoded.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();
            res.json({ message: 'Password reset successful' });
        } catch (error) {
            res.status(500).json({ message: 'Error resetting password', error });
        }
    },
};

export default userController;
