"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			User.hasOne(models.token_manager, {
				foreignKey: "userId",
				as: "userTokens",
				onDelete: "cascade",
				hooks: true,
			});
			User.hasMany(models.user_space, {
				foreignKey: "creatorUserId",
				as: "space",
			});
			User.hasMany(models.space_member, {
				foreignKey: "userId",
				as: "spaceMemberListOfUser",
			});
			User.hasMany(models.company, {
				foreignKey: "creatorUserId",
				as: "companyList",
			});
			User.hasMany(models.contact, {
				foreignKey: "creatorUserId",
				as: "contactList",
			});
		}
	}
	User.init(
		{
			firstName: {
				type: DataTypes.STRING,
			},
			lastName: {
				type: DataTypes.STRING,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					is: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/gm,
				},
			},
			password: {
				type: DataTypes.STRING,
			},
			salt: {
				type: DataTypes.STRING,
			},
			role: {
				type: DataTypes.STRING,
				defaultValue: "user",
			},
			phoneNumber: {
				type: DataTypes.STRING,
			},
			status: {
				type: DataTypes.ENUM(
					"invited",
					"notVerified",
					"onboarding_1",
					"onboarding_2",
					"onboarding_3",
					"completed",
					"deleted",
				),
				defaultValue: "notVerified",
			},
			currentSpaceId: {
				type: DataTypes.INTEGER,
				defaultValue: null,
			},
			company: {
				type: DataTypes.STRING,
			},
			country: {
				type: DataTypes.STRING,
			},
			DOB: {
				type: DataTypes.DATE,
			},
			userProfileImage: {
				type: DataTypes.STRING,
			},
		},
		{
			sequelize,
			modelName: "user",
			indexes: [
				{
					unique: true,
					fields: ["email"],
				},
			],
		},
	);
	return User;
};
