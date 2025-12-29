import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('testDB', 'rohan', '', {
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
    logging: false, 
});

(async ()=>{ 
    try {
        await sequelize.authenticate()
        console.log('Connection to PostgreSQL Database is successful')
    } catch (error) {
        console.log('Database connection error:', error)
    }
})();

export default sequelize;