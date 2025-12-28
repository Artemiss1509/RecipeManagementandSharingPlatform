import User from '../models/user.model.js';
import Recipe from '../models/recipes.model.js';
import Follow from '../models/follow.model.js';
import { uploadToS3, deleteFromS3 } from '../utils/AWS-S3.js';
import bcrypt from 'bcryptjs';

export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const recipeCount = await Recipe.count({ where: { userId } });
        const followerCount = await Follow.count({ where: { followingId: userId } });
        const followingCount = await Follow.count({ where: { followerId: userId } });

        res.status(200).json({
            user,
            statistics: {
                recipes: recipeCount,
                followers: followerCount,
                following: followingCount
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch user profile', 
            error: error.message 
        });
    }
};

export const getCurrentUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        const recipeCount = await Recipe.count({ where: { userId: req.user.id } });
        const followerCount = await Follow.count({ where: { followingId: req.user.id } });
        const followingCount = await Follow.count({ where: { followerId:  req.user.id } });

        res.status(200).json({
            user,
            statistics: {
                recipes: recipeCount,
                followers: followerCount,
                following: followingCount
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch profile', 
            error: error.message 
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { username, email, bio } = req.body;
        const user = await User.findByPk(req.user.id);

        if (username && username !== user.username) {
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already taken' });
            }
        }

        let profileImage = user.profileImage;
        if (req.file) {
            if (user.profileImage) {
                await deleteFromS3(user.profileImage);
            }
            profileImage = await uploadToS3(req.file);
        }

        await user.update({
            username: username || user.username,
            email: email || user.email,
            bio: bio !== undefined ? bio : user.bio,
            profileImage
        });

        const updatedUser = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({ 
            message: 'Profile updated successfully', 
            user: updatedUser 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to update profile', 
            error: error.message 
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new password' });
        }

        const user = await User.findByPk(req.user.id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await user.update({ password: hashedPassword });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to change password', 
            error: error.message 
        });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;

        const user = await User.findByPk(req.user.id);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        if (user.profileImage) {
            await deleteFromS3(user.profileImage);
        }

        const recipes = await Recipe.findAll({ where: { userId: req.user.id } });
        for (const recipe of recipes) {
            if (recipe.imageUrl) {
                await deleteFromS3(recipe.imageUrl);
            }
        }

        await user.destroy();

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to delete account', 
            error: error.message 
        });
    }
};