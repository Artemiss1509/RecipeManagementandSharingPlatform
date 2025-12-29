import User from '../models/user.model.js';
import Recipe from '../models/recipes.model.js';
import Review from '../models/review.model.js';
import { deleteFromS3 } from '../utils/AWS-S3.js';
import { Op } from 'sequelize';


export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (search) {
            where[Op.or] = [
                { username: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (status) {
            where.isActive = status === 'active';
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            users,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch users', 
            error: error.message 
        });
    }
};


export const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({ message: 'You cannot ban yourself' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot ban admin users' });
        }

        await user.update({ isActive: ! user.isActive });

        res.status(200).json({ 
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user: { id: user.id, username: user.username, isActive: user.isActive }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to update user status', 
            error:  error.message 
        });
    }
};


export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete yourself' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin users' });
        }

        if (user.profileImage) {
            await deleteFromS3(user.profileImage);
        }

        const recipes = await Recipe.findAll({ where: { userId } });
        for (const recipe of recipes) {
            if (recipe.imageUrl) {
                await deleteFromS3(recipe.imageUrl);
            }
        }

        await user.destroy();

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to delete user', 
            error: error.message 
        });
    }
};

export const deleteRecipeAdmin = async (req, res) => {
    try {
        const { recipeId } = req.params;

        const recipe = await Recipe.findByPk(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        if (recipe.imageUrl) {
            await deleteFromS3(recipe.imageUrl);
        }

        await recipe.destroy();

        res.status(200).json({ 
            message: 'Recipe deleted successfully', 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to delete recipe', 
            error: error.message 
        });
    }
};

export const deleteReviewAdmin = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        await review.destroy();

        res.status(200).json({ 
            message: 'Review deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to delete review', 
            error: error.message 
        });
    }
};

export const getPlatformStatistics = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { isActive: true } });
        const totalRecipes = await Recipe.count();
        const totalReviews = await Review.count();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentRecipes = await Recipe.count({
            where: {
                createdAt: { [Op.gte]: thirtyDaysAgo }
            }
        });

        const recentUsers = await User.count({
            where: {
                createdAt: { [Op.gte]: thirtyDaysAgo }
            }
        });

        res.status(200).json({
            statistics: {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                totalRecipes,
                totalReviews,
                recentRecipes,
                recentUsers
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch statistics', 
            error: error.message 
        });
    }
};

export const makeAdmin = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'User is already an admin' });
        }

        await user.update({ role: 'admin' });

        res.status(200).json({ 
            message: 'User promoted to admin successfully',
            user:  { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to make user admin', 
            error:  error.message 
        });
    }
};