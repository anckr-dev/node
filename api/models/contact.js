"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class contact extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			contact.belongsTo(models.company, {
				as: "company",
				foreignKey: "companyId",
			});
			contact.belongsTo(models.user, {
				as: "user",
				foreignKey: "creatorUserId",
			});
		}
	}
	contact.init(
		{
			firstName: {
				type: DataTypes.STRING(50),
			},
			lastName: {
				type: DataTypes.STRING(50),
			},
			email: {
				type: DataTypes.STRING(62),
			},
			phoneNumber: {
				type: DataTypes.STRING(15),
			},
			jobTitle: {
				type: DataTypes.STRING(100),
			},
			companyId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: { model: "companies", key: "id" },
			},
			creatorUserId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: { model: "users", key: "id" },
			},
			spaceId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: "contact",
		},
	);
	return contact;
};
