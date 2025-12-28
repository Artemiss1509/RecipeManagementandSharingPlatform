import Review from '../models/review.model.js';
import Recipe from '../models/recipes.model.js';
import User from '../models/user.model.js';

// Create Review
export const createReview = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { comment, tips } = req.body;

        const recipe = await Recipe.findByPk(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if user already reviewed
        const existingReview = await Review.findOne({
            where: { userId: req.user.id, recipeId }
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this recipe' });
        }

        const review = await Review.create({
            userId: req.user.id,
            recipeId,
            comment,
            tips
        });

        const reviewWithUser = await Review.findByPk(review.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'profileImage']
            }]
        });

        res.status(201).json({ 
            message: 'Review created successfully', 
            review:  reviewWithUser 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to create review', 
            error: error.message 
        });
    }
};

// Get Recipe Reviews
export const getRecipeReviews = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: reviews } = await Review.findAndCountAll({
            where: { recipeId },
            include:  [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'profileImage']
            }],
            limit:  parseInt(limit),
            offset:  parseInt(offset),
            order:  [['createdAt', 'DESC']]
        });

        res.status(200).json({
            reviews,
            pagination:  {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch reviews', 
            error: error.message 
        });
    }
};

// Update Review
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, tips } = req.body;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.userId !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this review' });
        }

        await review.update({
            comment: comment || review.comment,
            tips: tips || review.tips
        });

        const updatedReview = await Review.findByPk(id, {
            include: [{
                model: User,
                as:  'user',
                attributes:  ['id', 'username', 'profileImage']
            }]
        });

        res.status(200).json({ 
            message: 'Review updated successfully', 
            review: updatedReview 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to update review', 
            error:  error.message 
        });
    }
};

// Delete Review
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.userId !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this review' });
        }

        await review.destroy();

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to delete review', 
            error: error.message 
        });
    }
};

// Get User Reviews
export const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: reviews } = await Review.findAndCountAll({
            where: { userId },
            include: [
                {
                    model:  Recipe,
                    as: 'recipe',
                    attributes: ['id', 'title', 'imageUrl']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'profileImage']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            reviews,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch user reviews', 
            error: error.message 
        });
    }
};