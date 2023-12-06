const cookieExtractor = function (req) {
	let token = null;
	if (req && Object.keys(req?.cookies).length) token = req.cookies["token"];
	return token;
};
module.exports = (config, logger, database, jwt) => {
	const JWT = config.JWT;

	return {
		generateAuthToken: function (authData, callback) {
			try {
				jwt.sign(
					{
						data: authData,
					},
					JWT.secretKey,
					{ expiresIn: JWT.expiration },
					function (err, token) {
						if (err) {
							callback(err);
						} else {
							if (token) {
								if (authData?.userId) {
									let userTokenData = {
										userId: authData.userId,
										token: token,
									};
									let tokenModel = database.models.token_manager;
									tokenModel
										.findOne({ where: { userId: authData.userId } })
										.then((existingToken) => {
											if (existingToken) {
												tokenModel
													.update(userTokenData, {
														where: { userId: authData.userId },
													})
													.then(() => {
														callback(null, JWT.BearerToken + token);
													})
													.catch((err) => {
														callback(err);
													});
											} else {
												tokenModel
													.create(userTokenData)
													.then((userToken) => {
														callback(null, JWT.BearerToken + userToken.token);
													})
													.catch((err) => {
														callback(err);
													});
											}
										})
										.catch((err) => {
											callback(err);
										});
								} else {
									callback(null, JWT.BearerToken + token);
								}
							} else {
								callback(null, false);
							}
						}
					},
				);
			} catch (e) {
				callback(e);
			}
		},
		generateOTPAuthToken: function (authData, callback) {
			let tokenExiration = authData.isTeamInvite
				? JWT.teamExpiration
				: JWT.otpExpiration;
			jwt.sign(
				{
					data: authData,
				},
				JWT.saltForOtpEncryption,
				{ expiresIn: tokenExiration },
				function (err, token) {
					if (err) {
						callback(err);
					} else {
						if (token) {
							callback(null, JWT.BearerToken + token);
						} else {
							callback(null, false);
						}
					}
				},
			);
		},
		encryptOTPData: function (authData, callback) {
			jwt.sign(
				{
					data: authData,
				},
				JWT.saltForOtpEncryption,
				{ expiresIn: JWT.otpExpiration },
				function (err, token) {
					if (err) {
						callback(err);
					} else {
						if (token) {
							callback(null, token);
						} else {
							callback(null, false);
						}
					}
				},
			);
		},
		verifyAuthToken: function (req, res, next) {
			try {
				let jwtFromRequest = cookieExtractor(req)
					? cookieExtractor(req)
					: req.headers["authorization"];
				let tokenArray = jwtFromRequest.split(" ");
				let secretKey = JWT.secretKey;
				if (tokenArray?.length && tokenArray[1]) {
					jwt.verify(tokenArray[1], secretKey, function (err, decoded) {
						if (err) {
							logger.error(
								"error occurred on Authentication Verify Token",
								err,
							);
							return res.status(401).json({
								message: config.errorMessages.badRequest.unAuthorizedToken,
								statusCode: config.statusCode.clientError.unAuthorized,
							});
						} else if (decoded) {
							if (decoded?.data?.userId) {
								let userTokenData = {
									where: {
										id: decoded?.data?.userId,
									},
									attributes: { exclude: ["password", "salt"] },
								};
								database.models.user
									.findOne(userTokenData)
									.then((userRes) => {
										req.user = userRes;
										next();
									})
									.catch((err) => {
										logger.error(
											"error occurred on Authentication Verify Token",
											err,
										);
										return res.status(401).json({
											message:
												config.errorMessages.badRequest.unAuthorizedToken,
											statusCode: config.statusCode.clientError.unAuthorized,
										});
									});
							} else {
								return res.status(401).json({
									message: config.errorMessages.badRequest.unAuthorizedToken,
									statusCode: config.statusCode.clientError.unAuthorized,
								});
							}
						} else {
							return res.status(401).json({
								message: config.errorMessages.badRequest.unAuthorizedToken,
								statusCode: config.statusCode.clientError.unAuthorized,
							});
						}
					});
				} else {
					return res.status(401).json({
						message: config.errorMessages.badRequest.unAuthorizedToken,
						statusCode: config.statusCode.clientError.unAuthorized,
					});
				}
			} catch (err) {
				logger.error("error occurred on Authentication Verify Token", err);
				return res.status(401).json({
					message: config.errorMessages.badRequest.unAuthorizedToken,
					statusCode: config.statusCode.clientError.unAuthorized,
				});
			}
		},
		verifyOtpAuthToken: function (req, res, next) {
			try {
				let jwtFromRequest = req.headers["authorization"]
					? req.headers["authorization"]
					: cookieExtractor(req);
				let tokenArray = jwtFromRequest.split(" ");
				let secretKey = JWT.saltForOtpEncryption;
				if (tokenArray?.length && tokenArray[1]) {
					jwt.verify(tokenArray[1], secretKey, function (err, decoded) {
						if (err) {
							if (err?.name === "TokenExpiredError") {
								req.isExpiredEmail = true;
								next();
							} else {
								logger.error(
									"error occurred on Authentication Verify Token",
									err,
								);
								return res.status(401).json({
									message: config.errorMessages.badRequest.unAuthorizedToken,
									statusCode: config.statusCode.clientError.unAuthorized,
								});
							}
						} else if (decoded) {
							if (decoded?.data?.email) {
								let email = decoded?.data?.email?.toLowerCase();
								let userTokenData = {
									where: {
										email: email,
									},
									attributes: { exclude: ["password", "salt"] },
								};
								database.models.user
									.findOne(userTokenData)
									.then((userRes) => {
										req.user = userRes;
										req.isExpiredEmail = false;
										req.userMail = decoded?.data?.email;
										next();
									})
									.catch((err) => {
										logger.error(
											"error occurred on Authentication Verify Token",
											err,
										);
										return res.status(401).json({
											message:
												config.errorMessages.badRequest.unAuthorizedToken,
											statusCode: config.statusCode.clientError.unAuthorized,
										});
									});
							} else {
								req.isExpiredEmail = false;
								req.userMail = decoded?.data?.email;
								next();
							}
						} else {
							return res.status(401).json({
								message: config.errorMessages.badRequest.unAuthorizedToken,
								statusCode: config.statusCode.clientError.unAuthorized,
							});
						}
					});
				} else {
					return res.status(401).json({
						message: config.errorMessages.badRequest.unAuthorizedToken,
						statusCode: config.statusCode.clientError.unAuthorized,
					});
				}
			} catch (err) {
				return res.status(401).json({
					message: config.errorMessages.badRequest.unAuthorizedToken,
					statusCode: config.statusCode.clientError.unAuthorized,
				});
			}
		},
		decodeToken: function (token, isOTPEncrypted, callback) {
			let encryptedSalt = isOTPEncrypted
				? JWT.saltForOtpEncryption
				: JWT.secretKey;
			jwt.verify(
				token,
				encryptedSalt,
				{ ignoreExpiration: true },
				function (err, decode) {
					if (err) {
						callback(err);
					} else if (decode?.data) {
						callback(null, decode.data);
					} else {
						callback("no data found");
					}
				},
			);
		},
		encryptTeamInviteData: function (authData, callback) {
			jwt.sign(
				{
					data: authData,
				},
				JWT.saltForOtpEncryption,
				{ expiresIn: JWT.teamExpiration },
				function (err, token) {
					if (err) {
						callback(err);
					} else {
						if (token) {
							callback(null, token);
						} else {
							callback(null, false);
						}
					}
				},
			);
		},
	};
};
