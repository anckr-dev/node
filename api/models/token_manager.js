"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class token_manager extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			token_manager.belongsTo(models.user, {
				as: "userTokens",
				foreignKey: "userId",
			});
		}
	}
	token_manager.init(
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			token: DataTypes.TEXT,
		},
		{
			sequelize,
			modelName: "token_manager",
		},
	);
	return token_manager;
};
