"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("user_spaces", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: {
				type: Sequelize.STRING,
			},
			address: {
				type: Sequelize.STRING,
			},
			city: {
				type: Sequelize.STRING,
			},
			state: {
				type: Sequelize.STRING,
			},
			zip: {
				type: Sequelize.STRING,
			},
			website: {
				type: Sequelize.STRING,
			},
			country: {
				type: Sequelize.STRING,
			},
			creatorUserId: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				allowNull: false,
				references: { model: "users", key: "id" },
			},
			spaceType: {
				type: Sequelize.STRING,
			},
			publicShareLink: {
				type: Sequelize.STRING,
			},
			publicShareEnable: {
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
		await queryInterface.dropTable("user_spaces");
	},
};
