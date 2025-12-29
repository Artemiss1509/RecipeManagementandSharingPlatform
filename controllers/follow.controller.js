import Follow from '../models/follow.model.js';
import User from '../models/user.model.js';
import Recipe from '../models/recipes.model.js';
import Review from '../models/review.model.js';
import { Op } from 'sequelize';

export const followUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const userToFollow = await User.findByPk(userId);
        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingFollow = await Follow.findOne({
            where: { followerId: req.user.id, followingId: userId }
        });

        if (existingFollow) {
            return res.status(400).json({ message: 'You are already following this user' });
        }

        const follow = await Follow.create({
            followerId: req.user.id,
            followingId: userId
        });

        res.status(201).json({ 
            message: 'Successfully followed user', 
            follow 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to follow user', 
            error: error.message 
        });
    }
};

export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const follow = await Follow.findOne({
            where: { followerId: req.user.id, followingId: userId }
        });

        if (!follow) {
            return res.status(404).json({ message: 'You are not following this user' });
        }

        await follow.destroy();

        res.status(200).json({ message: 'Successfully unfollowed user' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to unfollow user', 
            error: error.message 
        });
    }
};

export const getFollowers = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: follows } = await Follow.findAndCountAll({
            where: { followingId: userId },
            include:  [{
                model: User,
                as: 'Follower',
                attributes: ['id', 'username', 'profileImage', 'bio']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        const followers = await User.findAll({
            include: [{
                model: Follow,
                as: 'Following',
                where: { followingId: userId },
                attributes: []
            }],
            attributes: ['id', 'username', 'profileImage', 'bio'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            subQuery: false
        });

        res.status(200).json({
            followers,
            pagination: {
                total: count,
                page:  parseInt(page),
                pages:  Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch followers', 
            error: error.message 
        });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: follows } = await Follow.findAndCountAll({
            where: { followerId: userId },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        const following = await User.findAll({
            include: [{
                model: Follow,
                as: 'Followers',
                where: { followerId: userId },
                attributes: []
            }],
            attributes:  ['id', 'username', 'profileImage', 'bio'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            subQuery: false
        });

        res.status(200).json({
            following,
            pagination: {
                total:  count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch following', 
            error: error.message 
        });
    }
};


export const getActivityFeed = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const following = await Follow.findAll({
            where: { followerId: req.user.id },
            attributes: ['followingId']
        });

        const followingIds = following.map(f => f.followingId);

        if (followingIds.length === 0) {
            return res.status(200).json({
                activities: [],
                pagination: { total: 0, page: 1, pages: 0 }
            });
        }

        const recipes = await Recipe.findAll({
            where: { userId: { [Op.in]: followingIds } },
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'profileImage']
            }],
            limit: 10,
            order: [['createdAt', 'DESC']]
        });

        const reviews = await Review.findAll({
            where: { userId: { [Op.in]: followingIds } },
            include: [
                {
                    model:  User,
                    as: 'user',
                    attributes: ['id', 'username', 'profileImage']
                },
                {
                    model:  Recipe,
                    as: 'recipe',
                    attributes:  ['id', 'title', 'imageUrl']
                }
            ],
            limit: 10,
            order: [['createdAt', 'DESC']]
        });

        const activities = [
            ...recipes.map(recipe => ({
                type: 'recipe',
                data: recipe,
                createdAt: recipe.createdAt
            })),
            ...reviews.map(review => ({
                type: 'review',
                data: review,
                createdAt: review.createdAt
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
         .slice(offset, offset + parseInt(limit));

        res.status(200).json({
            activities,
            pagination: {
                total: recipes.length + reviews.length,
                page: parseInt(page),
                pages:  Math.ceil((recipes.length + reviews.length) / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch activity feed', 
            error: error.message 
        });
    }
};