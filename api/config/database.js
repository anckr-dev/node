require("dotenv").config();

module.exports = {
	development: {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		database: process.env.DB_DATABASE,
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		name: process.env.DB_NAME,
		schema: process.env.DB_SCHEMA,
		connector: process.env.DB_SCHEMA,
		ssl: false,
		dialect: process.env.DB_DIALECT,
	},
	test: {
		username: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_DATABASE,
		host: process.env.DB_HOST,
		dialect: process.env.DB_DIALECT,
	},
	production: {
		username: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_DATABASE,
		host: process.env.DB_HOST,
		dialect: process.env.DB_DIALECT,
	},
};
