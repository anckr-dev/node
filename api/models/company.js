"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class company extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			company.belongsTo(models.user, {
				as: "user",
				foreignKey: "creatorUserId",
			});
			company.hasMany(models.contact, {
				foreignKey: "companyId",
				as: "contacts",
			});
		}
	}
	company.init(
		{
			name: {
				type: DataTypes.STRING(50),
			},
			address: {
				type: DataTypes.STRING(100),
			},
			city: {
				type: DataTypes.STRING(50),
			},
			state: {
				type: DataTypes.STRING(50),
			},
			postalCode: {
				type: DataTypes.STRING(10),
			},
			phoneNumber: {
				type: DataTypes.STRING(15),
			},
			website: {
				type: DataTypes.STRING(50),
			},
			country: {
				type: DataTypes.STRING(20),
			},
			creatorUserId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			spaceId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: "company",
		},
	);
	return company;
};
