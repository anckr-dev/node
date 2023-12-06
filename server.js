const createError = require("http-errors");
const express = require("express");
const app = express();
const morgon = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const router = require("express").Router();
const winston = require("winston");
const passport = require("passport");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const cookieParser = require("cookie-parser");

// configurations
const config = require("./api/config/config.json").settings;
const port = config.port || 3000;

app.use(function (req, res, next) {
	// Website you wish to allow to connect
	res.setHeader("Access-Control-Allow-Origin", "*");

	// Request methods you wish to allow
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, OPTIONS, PUT, PATCH, DELETE",
	);

	// Request headers you wish to allow
	res.setHeader(
		"Access-Control-Allow-Headers",
		"X-Requested-With,content-type",
	);

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader("Access-Control-Allow-Credentials", true);
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept",
	);
	// Pass to next layer of middleware
	next();
});

//swagger
const options = {
	swaggerDefinition: {
		info: {
			title: "scaffold APIs",
			description: "List of scaffold APIs",
			contact: {
				name: "Dev",
			},
			servers: ["http://localhost:3000"],
		},
	},
	apis: ["swagger.js"],
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

const origin =
	process.env.NODE_ENV === "development"
		? "http://localhost:3000"
		: "http://localhost:3000";

// middlewares
app.use(morgon("short"));
app.use(
	cors({
		credentials: true,
		origin,
	}),
);
app.use(helmet());
// Used to parse JSON bodies
app.use(express.json());
//Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// passport
app.use(passport.initialize());
app.use(cookieParser());

app.use("/", router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	return next(
		createError(
			config.statusCode.clientError.NotFound,
			config.errorMessages.badRequest.requestNotFound,
		),
	);
});

// HTTP configurations
const server = require("http").createServer(app);

// Server Configuration
server.listen(port, () => {
	console.log("server runs on port: ", port);
});

// logger management
const logger = winston.createLogger({
	transports: [
		new (require("winston-daily-rotate-file"))({
			maxDays: 5,
			maxSize: "20m",
			maxFiles: 20,
			datePattern: "YYYY-MM-DD",
			name: "info",
			filename: `./logger/info/%DATE%-${port}-info.log`,
			level: "info",
		}),
		new (require("winston-daily-rotate-file"))({
			maxDays: 5,
			maxSize: "20m",
			maxFiles: 20,
			datePattern: "YYYY-MM-DD",
			name: "error",
			filename: `./logger/error/%DATE%-${port}-error.log`,
			level: "error",
		}),
	],
});

// DB configuration
const database = require("./api/models/index");
if (database?.error) {
	console.log(database?.error);
	logger.error("error while connecting DB", database?.error);
} else {
	database?.sequelize
		?.sync({ force: false })
		.then(() => {
			require("./api/routes/routes")(
				router,
				config,
				logger,
				database?.sequelize,
				database?.Sequelize,
				passport,
				database,
			);
		})
		.catch((error) => {
			console.log(error);
			logger.error("error while syncing DB", error);
		});
}
