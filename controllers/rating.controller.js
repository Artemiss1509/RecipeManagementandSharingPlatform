import Rating from '../models/rating.model.js';
import Recipe from '../models/recipes.model.js';
import sequelize from '../utils/DB.connection.js';

// Rate a Recipe
export const rateRecipe = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { recipeId } = req.params;
        const { rating } = req.body;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const recipe = await Recipe.findByPk(recipeId);
        if (!recipe) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if user already rated
        let existingRating = await Rating.findOne({
            where: { userId: req.user.id, recipeId }
        });

        if (existingRating) {
            // Update existing rating
            await existingRating.update({ rating }, { transaction });
        } else {
            // Create new rating
            existingRating = await Rating.create({
                userId: req.user.id,
                recipeId,
                rating
            }, { transaction });
        }

        // Recalculate average rating
        const ratings = await Rating.findAll({
            where: { recipeId },
            attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'], [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings']]
        });

        const avgRating = parseFloat(ratings[0].dataValues.avgRating);
        const totalRatings = parseInt(ratings[0].dataValues.totalRatings);

        await recipe.update({
            averageRating:  avgRating,
            totalRatings: totalRatings
        }, { transaction });

        await transaction.commit();

        res.status(200).json({ 
            message: 'Recipe rated successfully', 
            rating: existingRating,
            averageRating: avgRating,
            totalRatings: totalRatings
        });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ 
            message: 'Failed to rate recipe', 
            error: error.message 
        });
    }
};

// Get User's Rating for a Recipe
export const getUserRating = async (req, res) => {
    try {
        const { recipeId } = req.params;

        const rating = await Rating.findOne({
            where: { userId: req.user.id, recipeId }
        });

        if (!rating) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        res.status(200).json({ rating });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch rating', 
            error: error.message 
        });
    }
};

// Delete Rating
export const deleteRating = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { recipeId } = req.params;

        const rating = await Rating.findOne({
            where: { userId: req.user.id, recipeId }
        });

        if (!rating) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Rating not found' });
        }

        await rating.destroy({ transaction });

        // Recalculate average rating
        const recipe = await Recipe.findByPk(recipeId);
        const ratings = await Rating.findAll({
            where: { recipeId },
            attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'], [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings']]
        });

        const avgRating = ratings[0].dataValues.totalRatings > 0 ? parseFloat(ratings[0].dataValues.avgRating) : 0;
        const totalRatings = parseInt(ratings[0].dataValues.totalRatings);

        await recipe.update({
            averageRating: avgRating,
            totalRatings:  totalRatings
        }, { transaction });

        await transaction.commit();

        res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ 
            message: 'Failed to delete rating', 
            error: error.message 
        });
    }
};