import Recipe from '../models/recipes.model.js';
import User from '../models/user.model.js';
import { uploadToS3, deleteFromS3 } from '../utils/AWS-S3.js';
import { Op } from 'sequelize';

export const createRecipe = async (req, res) => {
    try {
        const { title, description, ingredients, instructions, prepTime, cookTime, servings, difficulty, category, dietaryPreferences } = req.body;
        
        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadToS3(req.file);
        }

        const recipe = await Recipe.create({
            userId: req.user.id,
            title,
            description,
            ingredients:  JSON.parse(ingredients),
            instructions: JSON.parse(instructions),
            prepTime,
            cookTime,
            servings,
            difficulty,
            category,
            dietaryPreferences:  dietaryPreferences ?  JSON.parse(dietaryPreferences) : [],
            imageUrl
        });

        res.status(201).json({ 
            message: 'Recipe created successfully', 
            recipe 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to create recipe', 
            error: error.message 
        });
    }
};

export const getAllRecipes = async (req, res) => {
    try {
        const { 
            search, 
            category, 
            difficulty, 
            dietaryPreferences, 
            maxPrepTime,
            page = 1, 
            limit = 10,
            sortBy = 'createdAt',
            order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
                { ingredients: { [Op.contains]: [search] } }
            ];
        }

        if (category) {
            where.category = category;
        }

        if (difficulty) {
            where.difficulty = difficulty;
        }

        if (dietaryPreferences) {
            where.dietaryPreferences = { [Op.contains]: [dietaryPreferences] };
        }

        if (maxPrepTime) {
            where.prepTime = { [Op.lte]: parseInt(maxPrepTime) };
        }

        const { count, rows: recipes } = await Recipe.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'profileImage']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, order]]
        });

        res.status(200).json({
            recipes,
            pagination: {
                total: count,
                page:  parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch recipes', 
            error: error.message 
        });
    }
};

export const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;

        const recipe = await Recipe.findByPk(id, {
            include: [{
                model:  User,
                as: 'author',
                attributes: ['id', 'username', 'profileImage', 'bio']
            }]
        });

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        res.status(200).json({ recipe });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch recipe', 
            error: error.message 
        });
    }
};

export const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, ingredients, instructions, prepTime, cookTime, servings, difficulty, category, dietaryPreferences } = req.body;

        const recipe = await Recipe.findByPk(id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        if (recipe.userId !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this recipe' });
        }

        let imageUrl = recipe.imageUrl;
        if (req.file) {
            if (recipe.imageUrl) {
                await deleteFromS3(recipe.imageUrl);
            }
            imageUrl = await uploadToS3(req.file);
        }

        await recipe.update({
            title: title || recipe.title,
            description: description || recipe.description,
            ingredients: ingredients ?  JSON.parse(ingredients) : recipe.ingredients,
            instructions: instructions ? JSON.parse(instructions) : recipe.instructions,
            prepTime: prepTime || recipe.prepTime,
            cookTime: cookTime || recipe.cookTime,
            servings: servings || recipe.servings,
            difficulty: difficulty || recipe.difficulty,
            category: category || recipe.category,
            dietaryPreferences: dietaryPreferences ? JSON.parse(dietaryPreferences) : recipe.dietaryPreferences,
            imageUrl
        });

        res.status(200).json({ 
            message: 'Recipe updated successfully', 
            recipe 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to update recipe', 
            error: error.message 
        });
    }
};

export const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;

        const recipe = await Recipe.findByPk(id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        if (recipe.userId !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this recipe' });
        }

        if (recipe.imageUrl) {
            await deleteFromS3(recipe.imageUrl);
        }

        await recipe.destroy();

        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to delete recipe', 
            error: error.message 
        });
    }
};

export const getUserRecipes = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: recipes } = await Recipe.findAndCountAll({
            where: { userId },
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'profileImage']
            }],
            limit:  parseInt(limit),
            offset:  parseInt(offset),
            order:  [['createdAt', 'DESC']]
        });

        res.status(200).json({
            recipes,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch user recipes', 
            error: error.message 
        });
    }
};