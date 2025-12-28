import User from './user.model.js';
import Recipe from './recipes.model.js';
import Review from './review.model.js';
import Rating from './rating.model.js';
import Favorite from './favorite.model.js';
import Collection from './collection.model.js';
import CollectionRecipe from './collectionRecipe.model.js';
import Follow from './follow.model.js';

// User - Recipe associations
User.hasMany(Recipe, { foreignKey: 'userId', as: 'recipes' });
Recipe.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// User - Review associations
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Recipe - Review associations
Recipe.hasMany(Review, { foreignKey: 'recipeId', as: 'reviews' });
Review.belongsTo(Recipe, { foreignKey: 'recipeId', as: 'recipe' });

// User - Rating associations
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Recipe - Rating associations
Recipe.hasMany(Rating, { foreignKey: 'recipeId', as: 'ratings' });
Rating.belongsTo(Recipe, { foreignKey: 'recipeId', as: 'recipe' });

// User - Favorite associations
User.hasMany(Favorite, { foreignKey:  'userId', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Recipe - Favorite associations
Recipe.hasMany(Favorite, { foreignKey:  'recipeId', as:  'favorites' });
Favorite.belongsTo(Recipe, { foreignKey: 'recipeId', as: 'recipe' });

// User - Collection associations
User.hasMany(Collection, { foreignKey: 'userId', as:  'collections' });
Collection.belongsTo(User, { foreignKey: 'userId', as:  'user' });

// Collection - Recipe associations (Many-to-Many through CollectionRecipe)
Collection.belongsToMany(Recipe, { through: CollectionRecipe, foreignKey: 'collectionId', as: 'recipes' });
Recipe.belongsToMany(Collection, { through: CollectionRecipe, foreignKey: 'recipeId', as: 'collections' });

// Follow associations (self-referencing)
User.belongsToMany(User, { 
    through: Follow, 
    as: 'followers', 
    foreignKey: 'followingId',
    otherKey: 'followerId'
});

User.belongsToMany(User, { 
    through: Follow, 
    as: 'following', 
    foreignKey: 'followerId',
    otherKey: 'followingId'
});

export {
    User,
    Recipe,
    Review,
    Rating,
    Favorite,
    Collection,
    CollectionRecipe,
    Follow
};