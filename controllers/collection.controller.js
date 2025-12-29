import Collection from '../models/collection.model.js';
import CollectionRecipe from '../models/collectionRecipe.model.js';
import Recipe from '../models/recipes.model.js';
import User from '../models/user.model.js';

export const createCollection = async (req, res) => {
    try {
        const { name, description } = req.body;

        const collection = await Collection.create({
            userId: req.user.id,
            name,
            description
        });

        res.status(201).json({ 
            message: 'Collection created successfully', 
            collection 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to create collection', 
            error: error.message 
        });
    }
};

export const getUserCollections = async (req, res) => {
    try {
        const { userId } = req.params || req.user.id;
        const targetUserId = userId || req.user.id;

        const collections = await Collection.findAll({
            where: { userId:  targetUserId },
            include:  [{
                model: Recipe,
                as: 'recipes',
                through: { attributes: [] },
                attributes: ['id', 'title', 'imageUrl']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ collections });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch collections', 
            error: error.message 
        });
    }
};

export const getCollectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const collection = await Collection.findByPk(id);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        const offset = (page - 1) * limit;

        const recipes = await collection.getRecipes({
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'profileImage']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        const totalRecipes = await CollectionRecipe.count({
            where: { collectionId: id }
        });

        res.status(200).json({
            collection,
            recipes,
            pagination: {
                total: totalRecipes,
                page: parseInt(page),
                pages: Math.ceil(totalRecipes / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch collection', 
            error: error.message 
        });
    }
};


export const deleteCollection = async (req, res) => {
    try {
        const { id } = req.params;

        const collection = await Collection.findByPk(id);

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        if (collection.userId !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this collection' });
        }

        await collection.destroy();

        res.status(200).json({ message: 'Collection deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to delete collection', 
            error: error.message 
        });
    }
};

export const addRecipeToCollection = async (req, res) => {
    try {
        const { collectionId, recipeId } = req.params;

        const collection = await Collection.findByPk(collectionId);
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        if (collection.userId !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to modify this collection' });
        }

        const recipe = await Recipe.findByPk(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const existingEntry = await CollectionRecipe.findOne({
            where: { collectionId, recipeId }
        });

        if (existingEntry) {
            return res.status(400).json({ message: 'Recipe already in collection' });
        }

        await CollectionRecipe.create({ collectionId, recipeId });

        res.status(201).json({ message: 'Recipe added to collection' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to add recipe to collection', 
            error: error.message 
        });
    }
};

export const removeRecipeFromCollection = async (req, res) => {
    try {
        const { collectionId, recipeId } = req.params;

        const collection = await Collection.findByPk(collectionId);
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        if (collection.userId !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to modify this collection' });
        }

        const entry = await CollectionRecipe.findOne({
            where: { collectionId, recipeId }
        });

        if (!entry) {
            return res.status(404).json({ message: 'Recipe not found in collection' });
        }

        await entry.destroy();

        res.status(200).json({ message: 'Recipe removed from collection' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to remove recipe from collection', 
            error: error.message 
        });
    }
};