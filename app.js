import express from 'express';
import cors from 'cors';
import sequelize from './utils/DB.connection.js';
import { User, Recipe, Review, Rating, Favorite, Collection, CollectionRecipe, Follow } from './models/associations.js';

import userRoutes from './routes/user.routes.js';
import recipeRoutes from './routes/recipe.routes.js';
import ratingRoutes from './routes/rating.routes.js';
import reviewRoutes from './routes/review.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import collectionRoutes from './routes/collection.routes.js';
import followRoutes from './routes/follow.routes.js';
import profileRoutes from './routes/profile.routes.js';
import adminRoutes from './routes/admin.routes.js';


const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);


sequelize.sync().then(() => {
    console.log('Database synchronized successfully.');
}).catch((error) => {
    console.error('Error synchronizing the database:', error);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


