import { DataTypes } from "sequelize";
import sequelize from "../utils/DB.connection.js";

const Recipe = sequelize.define("Recipe", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:  {
            model: 'Users',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    ingredients: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
    },
    instructions: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
    },
    prepTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cookTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    servings: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    difficulty: {
        type: DataTypes.ENUM({
            values:['easy', 'medium', 'hard']
        }),
        allowNull: false,
        defaultValue: 'medium'
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dietaryPreferences: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: []
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    averageRating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    totalRatings: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true,
});

export default Recipe;