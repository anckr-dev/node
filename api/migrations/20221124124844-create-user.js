"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable(
			"users",
			{
				id: {
					type: Sequelize.UUID,
					defaultValue: Sequelize.UUIDV4,
					allowNull: false,
					primaryKey: true,
				},
				firstName: {
					type: Sequelize.STRING,
				},
				lastName: {
					type: Sequelize.STRING,
				},
				email: {
					type: Sequelize.STRING,
					allowNull: false,
					unique: true,
				},
				password: {
					type: Sequelize.STRING,
				},
				salt: {
					type: Sequelize.STRING,
				},
				role: {
					type: Sequelize.STRING,
					defaultValue: "user",
				},
				phoneNumber: {
					type: Sequelize.STRING,
				},
				status: {
					type: Sequelize.ENUM(
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
					type: Sequelize.INTEGER,
					defaultValue: null,
				},
				company: {
					type: Sequelize.STRING,
				},
				country: {
					type: Sequelize.STRING,
				},
				DOB: {
					type: Sequelize.DATE,
				},
				userProfileImage: {
					type: Sequelize.STRING,
				},
				createdAt: {
					allowNull: false,
					type: Sequelize.DATE,
				},
				updatedAt: {
					allowNull: false,
					type: Sequelize.DATE,
				},
			},
			{
				indexes: [
					{
						unique: true,
						fields: ["email"],
					},
				],
			},
		);
	},
	async down(queryInterface) {
		await queryInterface.dropTable("users");
	},
};
