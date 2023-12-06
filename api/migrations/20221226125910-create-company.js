"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("companies", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: {
				type: Sequelize.STRING(50),
			},
			address: {
				type: Sequelize.STRING(100),
			},
			city: {
				type: Sequelize.STRING(50),
			},
			state: {
				type: Sequelize.STRING(50),
			},
			postalCode: {
				type: Sequelize.STRING(10),
			},
			phoneNumber: {
				type: Sequelize.STRING(15),
			},
			website: {
				type: Sequelize.STRING(50),
			},
			country: {
				type: Sequelize.STRING(20),
			},
			creatorUserId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: { model: "users", key: "id" },
			},
			spaceId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: { model: "user_spaces", key: "id" },
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
		await queryInterface.dropTable("companies");
	},
};
