import express from 'express';
import multer from 'multer';
import userController from '../controllers/userController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/register', upload.single('profilePhoto'), userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Example of a protected route
router.get('/profile', auth, (req, res) => {
    res.json({ email: req.user.email, profilePhoto: req.user.profilePhoto });
});

export default router;
