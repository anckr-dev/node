"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class user_space extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			user_space.belongsTo(models.user, {
				as: "user",
				foreignKey: "creatorUserId",
			});
			user_space.hasMany(models.space_member, {
				foreignKey: "spaceId",
				as: "spaceMemberList",
			});
		}
	}
	user_space.init(
		{
			name: DataTypes.STRING,
			address: DataTypes.STRING,
			city: DataTypes.STRING,
			state: DataTypes.STRING,
			zip: DataTypes.STRING,
			country: DataTypes.STRING,
			website: DataTypes.STRING,
			creatorUserId: DataTypes.INTEGER,
			publicShareLink: {
				type: DataTypes.STRING,
			},
			publicShareEnable: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			spaceType: { type: DataTypes.STRING, defaultValue: "organization" },
		},
		{
			sequelize,
			modelName: "user_space",
		},
	);
	return user_space;
};
