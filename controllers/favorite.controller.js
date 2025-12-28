import Favorite from '../models/favorite.model.js';
import Recipe from '../models/recipes.model.js';
import User from '../models/user.model.js';

export const addFavorite = async (req, res) => {
    try {
        const { recipeId } = req.params;

        const recipe = await Recipe.findByPk(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const existingFavorite = await Favorite.findOne({
            where: { userId: req.user.id, recipeId }
        });

        if (existingFavorite) {
            return res.status(400).json({ message: 'Recipe already in favorites' });
        }

        const favorite = await Favorite.create({
            userId: req.user.id,
            recipeId
        });

        res.status(201).json({ 
            message: 'Recipe added to favorites', 
            favorite 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to add favorite', 
            error: error.message 
        });
    }
};

export const removeFavorite = async (req, res) => {
    try {
        const { recipeId } = req.params;

        const favorite = await Favorite.findOne({
            where: { userId: req.user.id, recipeId }
        });

        if (!favorite) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        await favorite.destroy();

        res.status(200).json({ message: 'Recipe removed from favorites' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to remove favorite', 
            error: error.message 
        });
    }
};

export const getUserFavorites = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: favorites } = await Favorite.findAndCountAll({
            where: { userId:  req.user.id },
            include: [{
                model: Recipe,
                as: 'recipe',
                include: [{
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'profileImage']
                }]
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            favorites:  favorites.map(fav => fav.recipe),
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch favorites', 
            error: error.message 
        });
    }
};

export const checkFavorite = async (req, res) => {
    try {
        const { recipeId } = req.params;

        const favorite = await Favorite.findOne({
            where: { userId: req.user.id, recipeId }
        });

        res.status(200).json({ 
            isFavorited: !!favorite 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to check favorite status', 
            error: error.message 
        });
    }
};