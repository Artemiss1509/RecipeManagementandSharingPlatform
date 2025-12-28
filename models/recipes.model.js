import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../utils/DB.connection.js";

const Recipe = sequelize.define("Recipe", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
        type: DataTypes.INTEGER, // in minutes
        allowNull: false,
    },
    cookTime: {
        type: DataTypes.INTEGER, // in minutes
        allowNull: false,
    },
    servings: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
});

export default Recipe;