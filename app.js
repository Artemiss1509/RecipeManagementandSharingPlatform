import express from 'express';
import cors from 'cors';
import sequelize from './utils/DB.connection.js';
import User from './models/user.model.js';
import userRoutes from './routes/user.routes.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/users',userRoutes);


sequelize.sync().then(() => {
    console.log('Database synchronized successfully.');
}).catch((error) => {
    console.error('Error synchronizing the database:', error);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


