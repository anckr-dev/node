module.exports = (config, logger, passwordValidator) => {
	// global declarations
	const successStatusCode = config.statusCode.success.ok;

	return {
		getErrorResponse: (code, errorMessage, meta, loggerTace, error) => {
			logger.error(loggerTace, {
				meta: meta,
				message: errorMessage,
				statusCode: code,
				error: error,
			});
			return {
				statusCode: code,
				message: errorMessage,
				error: error,
			};
		},
		getSuccessResponse: (data, message) => {
			logger.info(successStatusCode, message, data);
			return {
				statusCode: successStatusCode,
				message: message,
				data: data,
			};
		},
		getErrorResponseWithoutLogger: (code, errorMessage, error) => {
			return {
				statusCode: code,
				message: errorMessage,
				error: error,
			};
		},
		ValidatePassword: (password, callback) => {
			try {
				let schema = new passwordValidator();
				schema
					.is()
					.min(12) // Minimum length 12
					.has()
					.uppercase() // Must have uppercase letters
					.has()
					.lowercase() // Must have lowercase letters
					.has()
					.digits(1) // Must have at least 1 digits
					.has()
					.symbols(1); // Must have at least 1 symbol

				callback(null, schema.validate(password));
			} catch (e) {
				callback(e);
			}
		},
	};
};
