import { DataTypes } from "sequelize";
import sequelize from "../utils/DB.connection.js";

const CollectionRecipe = sequelize.define("CollectionRecipe", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    collectionId: {
        type:  DataTypes.INTEGER,
        allowNull: false,
        references:  {
            model: 'Collections',
            key: 'id'
        }
    },
    recipeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Recipes',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['collectionId', 'recipeId']
        }
    ]
});

export default CollectionRecipe;