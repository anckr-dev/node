"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("space_members", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			userId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: { model: "users", key: "id" },
			},
			spaceId: {
				type: Sequelize.INTEGER,
				references: { model: "user_spaces", key: "id" },
			},
			status: {
				type: Sequelize.ENUM("pending", "active", "deactive", "revoked"),
				defaultValue: "pending",
			},
			role: {
				type: Sequelize.ENUM("admin", "member"),
				defaultValue: "member",
				allowNull: false,
			},
			isSpaceCreator: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable("space_members");
	},
};
