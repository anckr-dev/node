"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class otp_manager extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
	}
	otp_manager.init(
		{
			otp: DataTypes.STRING,
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					is: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/gm,
				},
			},
			isEmailVerified: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			sequelize,
			modelName: "otp_manager",
		},
	);
	return otp_manager;
};
