"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("contacts", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			firstName: {
				type: Sequelize.STRING(50),
			},
			lastName: {
				type: Sequelize.STRING(50),
			},
			email: {
				type: Sequelize.STRING(62),
			},
			phoneNumber: {
				type: Sequelize.STRING(15),
			},
			jobTitle: {
				type: Sequelize.STRING(100),
			},
			companyId: {
				type: Sequelize.INTEGER,
				allowNull: true,
				references: { model: "companies", key: "id" },
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
		await queryInterface.dropTable("contacts");
	},
};
