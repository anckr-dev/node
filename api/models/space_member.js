"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
	class space_member extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			space_member.belongsTo(models.user, { as: "user", foreignKey: "userId" });
			space_member.belongsTo(models.user_space, {
				as: "space",
				foreignKey: "spaceId",
			});
		}
	}
	space_member.init(
		{
			userId: DataTypes.INTEGER,
			spaceId: DataTypes.INTEGER,
			status: {
				type: DataTypes.ENUM("pending", "active", "deactive", "revoked"),
				defaultValue: "pending",
			},
			role: {
				type: DataTypes.ENUM("admin", "member"),
				defaultValue: "member",
			},
			isSpaceCreator: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			sequelize,
			modelName: "space_member",
		},
	);
	return space_member;
};
