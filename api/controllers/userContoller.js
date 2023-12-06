module.exports = (
	config,
	commonService,
	userService,
	bcrypt,
	mailManager,
	randomatic,
	otpService,
	luxon,
	authentication,
	userSpaceService,
	s3,
	spaceMemberService,
	cryptoUtility,
) => {
	// sequelize design
	const Op = require("sequelize").Op;

	// global declarations
	const successStatusCode = config.statusCode.success.ok;
	const errorStatusCodes = config.statusCode.clientError;
	const serverErrors = config.statusCode.serverError;
	const loggerIdentifier = config.loggerIdentifiers.userControllers;

	function encryptPassword(password, callback) {
		bcrypt.genSalt(config.bcryptConfiguration.saltRounds, function (err, salt) {
			bcrypt.hash(password, salt, function (err, hash) {
				if (err) {
					callback(err);
				} else {
					callback(null, hash, salt);
				}
			});
		});
	}

	function comparePasswords(password, existingHash, existingSalt, callback) {
		bcrypt.compare(password, existingHash, function (err, result) {
			if (err) {
				callback(err);
			} else {
				callback(null, result);
			}
		});
	}

	return {
		validateEmail: function (req, res) {
			try {
				if (req?.body?.email && req.body?.firstName && req.body?.lastName) {
					let email = req.body.email.toLowerCase();
					let findMail = {
						where: {
							email: email,
						},
					};
					userService.checkEmail(findMail, function (err, foundUser) {
						if (err) {
							return res
								.status(serverErrors.internalServerError)
								.json(
									commonService.getErrorResponse(
										serverErrors.internalServerError,
										config.errorMessages.internalServerError.serverError,
										req,
										`${loggerIdentifier}on validateEmail Api`,
										err,
									),
								);
						}
						if (foundUser && foundUser?.status?.toLowerCase() === "completed") {
							let response = {
								isValidEmail: false,
							};
							return res
								.status(successStatusCode)
								.json(
									commonService.getSuccessResponse(
										response,
										config.successMessages.messages.successApi,
									),
								);
						} else {
							let userData = {
								email: email,
							};
							if (req.body?.firstName && req.body?.lastName) {
								userData.firstName = req.body?.firstName;
								userData.lastName = req.body?.lastName;
							}
							let findCondition = {
								where: {
									email: email,
								},
							};
							userService.upseartUser(
								userData,
								findCondition,
								function (err, user) {
									if (err) {
										if (err?.message?.includes("Validation error")) {
											return res
												.status(errorStatusCodes.badRequest)
												.json(
													commonService.getErrorResponseWithoutLogger(
														errorStatusCodes.badRequest,
														config.errorMessages.badRequest.validationError,
														err,
													),
												);
										} else {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req,
														`${loggerIdentifier}on validateEmail Api`,
														err,
													),
												);
										}
									} else if (user?.length) {
										let authData = {
											userId: user[0].id,
											email: email,
											createdDate: new Date(),
										};
										authentication.generateOTPAuthToken(
											authData,
											function (err, token) {
												if (err) {
													return res
														.status(serverErrors.internalServerError)
														.json(
															commonService.getErrorResponse(
																serverErrors.internalServerError,
																config.errorMessages.internalServerError
																	.serverError,
																req,
																`${loggerIdentifier}on validateEmail Api`,
																err,
															),
														);
												} else if (token) {
													const otpCode = randomatic("0", 6, {});
													let encryptOtpDataObj = {
														email: email,
														jwtToken: token,
														otp: otpCode,
														isRequestFor: "validateEmail",
													};
													if (req.body.firstName && req.body.lastName) {
														encryptOtpDataObj.firstName = req.body.firstName;
														encryptOtpDataObj.lastName = req.body.lastName;
													}
													authentication.encryptOTPData(
														encryptOtpDataObj,
														function (err, encryptedData) {
															if (err) {
																return res
																	.status(serverErrors.internalServerError)
																	.json(
																		commonService.getErrorResponse(
																			serverErrors.internalServerError,
																			config.errorMessages.internalServerError
																				.serverError,
																			req,
																			`${loggerIdentifier}on validateEmail Api`,
																			err,
																		),
																	);
															} else if (encryptedData) {
																const otpData = {
																	email: email,
																	otp: otpCode,
																};
																otpService.createData(
																	otpData,
																	function (err, success) {
																		if (err) {
																			return res
																				.status(
																					serverErrors.internalServerError,
																				)
																				.json(
																					commonService.getErrorResponse(
																						serverErrors.internalServerError,
																						config.errorMessages
																							.internalServerError.serverError,
																						req,
																						`${loggerIdentifier}on validateEmail Api`,
																						err,
																					),
																				);
																		} else if (success) {
																			mailManager.sendMail(
																				email,
																				{
																					otpCode,
																					firstName: req.body.firstName,
																					lastName: req.body.lastName,
																				},
																				encryptedData,
																				"otpVerification",

																				function (err, successMail) {
																					if (err) {
																						return res
																							.status(
																								serverErrors.internalServerError,
																							)
																							.json(
																								commonService.getErrorResponse(
																									serverErrors.internalServerError,
																									config.errorMessages
																										.internalServerError
																										.serverError,
																									req,
																									`${loggerIdentifier}on validateEmail Api`,
																									err,
																								),
																							);
																					} else if (successMail) {
																						let response = {
																							isValidEmail: true,
																							userData: user[0],
																						};
																						return res
																							.cookie("token", token, {
																								secure:
																									process.env.NODE_ENV !==
																									"development",
																								httpOnly: true,
																								withCredentials: true,
																							})
																							.status(successStatusCode)
																							.json(
																								commonService.getSuccessResponse(
																									response,
																									config.successMessages
																										.messages.successApi,
																								),
																							);
																					} else {
																						return res
																							.status(
																								serverErrors.internalServerError,
																							)
																							.json(
																								commonService.getErrorResponse(
																									serverErrors.internalServerError,
																									config.errorMessages
																										.internalServerError
																										.serverError,
																									req,
																									`${loggerIdentifier}on validateEmail Api`,
																									err,
																								),
																							);
																					}
																				},
																			);
																		} else {
																			return res
																				.status(
																					serverErrors.internalServerError,
																				)
																				.json(
																					commonService.getErrorResponse(
																						serverErrors.internalServerError,
																						config.errorMessages
																							.internalServerError.serverError,
																						req,
																						`${loggerIdentifier}on validateEmail Api`,
																						err,
																					),
																				);
																		}
																	},
																);
															} else {
																return res
																	.status(serverErrors.internalServerError)
																	.json(
																		commonService.getErrorResponse(
																			serverErrors.internalServerError,
																			config.errorMessages.internalServerError
																				.serverError,
																			req,
																			`${loggerIdentifier}on validateEmail Api`,
																			err,
																		),
																	);
															}
														},
													);
												} else {
													return res
														.status(serverErrors.internalServerError)
														.json(
															commonService.getErrorResponse(
																serverErrors.internalServerError,
																config.errorMessages.internalServerError
																	.serverError,
																req,
																`${loggerIdentifier}on validateEmail Api`,
																err,
															),
														);
												}
											},
										);
									} else {
										return res
											.status(serverErrors.internalServerError)
											.json(
												commonService.getErrorResponse(
													serverErrors.internalServerError,
													config.errorMessages.internalServerError.serverError,
													req,
													`${loggerIdentifier}on validateEmail Api`,
													err,
												),
											);
									}
								},
							);
						}
					});
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req,
								`${loggerIdentifier}on validateEmail Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req,
							`${loggerIdentifier}on validateEmail Api`,
							e,
						),
					);
			}
		},
		verifyEmailCode: function (req, res) {
			try {
				if (req?.body?.email && req?.body?.otpCode) {
					let email = req.body?.email?.toLowerCase();
					let condition = {
						where: {
							email: email,
						},
						order: [["createdAt", "DESC"]],
					};
					if (typeof req.body?.otpCode === "string") {
						otpService.fetchEmailData(condition, function (err, success) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on verifyEmailCode Api`,
											err,
										),
									);
							} else if (success) {
								let utcTimeInCurrentTime = luxon.getDateInUTC(new Date());
								let createdTimeInUtc = luxon.getDateInUTC(success.createdAt);
								let difference = luxon
									.getISOdate(utcTimeInCurrentTime)
									.diff(luxon.getISOdate(createdTimeInUtc), ["minutes"])
									.toObject();
								if (
									difference.minutes <= config.otpValidationInMinutes &&
									req?.body?.otpCode === success.otp &&
									!success.isEmailVerified
								) {
									// valid otp
									let findCondition = {
										where: {
											id: success.id,
										},
									};
									otpService.updateData(
										{ isEmailVerified: true },
										findCondition,
										function (err, updateResult) {
											if (err) {
												return res
													.status(serverErrors.internalServerError)
													.json(
														commonService.getErrorResponse(
															serverErrors.internalServerError,
															config.errorMessages.internalServerError
																.serverError,
															req,
															`${loggerIdentifier}on verifyEmailCode Api`,
															err,
														),
													);
											} else if (updateResult) {
												let findCondition = {
													where: {
														email: email,
														status: ["notVerified", "invited"],
													},
												};
												userService.updateUser(
													{ status: "onboarding_1" },
													findCondition,
													function (err, updatedUserData) {
														if (err) {
															return res
																.status(serverErrors.internalServerError)
																.json(
																	commonService.getErrorResponse(
																		serverErrors.internalServerError,
																		config.errorMessages.internalServerError
																			.serverError,
																		req,
																		`${loggerIdentifier}on verifyEmailCode Api`,
																		err,
																	),
																);
														} else if (updatedUserData) {
															userService.checkEmail(
																{ where: { email: email } },
																function (err, user) {
																	if (err) {
																		return res
																			.status(serverErrors.internalServerError)
																			.json(
																				commonService.getErrorResponse(
																					serverErrors.internalServerError,
																					config.errorMessages
																						.internalServerError.serverError,
																					req,
																					`${loggerIdentifier}on verifyEmailCode Api`,
																					err,
																				),
																			);
																	} else if (user) {
																		let authData = {
																			userId: user.id,
																			email: email,
																			createdDate: new Date(),
																		};
																		authentication.generateAuthToken(
																			authData,
																			function (err, token) {
																				if (err) {
																					return res
																						.status(
																							serverErrors.internalServerError,
																						)
																						.json(
																							commonService.getErrorResponse(
																								serverErrors.internalServerError,
																								config.errorMessages
																									.internalServerError
																									.serverError,
																								req,
																								`${loggerIdentifier}on verifyEmailCode Api`,
																								err,
																							),
																						);
																				} else if (token) {
																					let findCondition = {
																						where: {
																							userId: user.id,
																							status: "active",
																						},
																					};
																					spaceMemberService.countData(
																						findCondition,
																						function (err, count) {
																							if (err) {
																								return res
																									.status(
																										serverErrors.internalServerError,
																									)
																									.json(
																										commonService.getErrorResponse(
																											serverErrors.internalServerError,
																											config.errorMessages
																												.internalServerError
																												.serverError,
																											req,
																											`${loggerIdentifier}on validateEmailFromInvitation Api`,
																											err,
																										),
																									);
																							} else {
																								let response = {
																									isValidOTP: true,
																									userData: user,
																									isJoinedSpace: count
																										? true
																										: false,
																								};
																								return res
																									.cookie("token", token, {
																										secure:
																											process.env.NODE_ENV !==
																											"development",
																										httpOnly: true,
																									})
																									.status(successStatusCode)
																									.json(
																										commonService.getSuccessResponse(
																											response,
																											config.successMessages
																												.messages.successApi,
																										),
																									);
																							}
																						},
																					);
																				} else {
																					return res
																						.status(
																							serverErrors.internalServerError,
																						)
																						.json(
																							commonService.getErrorResponse(
																								serverErrors.internalServerError,
																								config.errorMessages
																									.internalServerError
																									.serverError,
																								req,
																								`${loggerIdentifier}on verifyEmailCode Api`,
																								err,
																							),
																						);
																				}
																			},
																		);
																	} else {
																		// not valid user
																		let response = {
																			isValidOTP: false,
																		};
																		return res
																			.status(successStatusCode)
																			.json(
																				commonService.getSuccessResponse(
																					response,
																					config.successMessages.messages
																						.successApi,
																				),
																			);
																	}
																},
															);
														} else {
															return res
																.status(serverErrors.internalServerError)
																.json(
																	commonService.getErrorResponse(
																		serverErrors.internalServerError,
																		config.errorMessages.internalServerError
																			.serverError,
																		req,
																		`${loggerIdentifier}on verifyEmailCode Api`,
																		err,
																	),
																);
														}
													},
												);
											} else {
												return res
													.status(serverErrors.internalServerError)
													.json(
														commonService.getErrorResponse(
															serverErrors.internalServerError,
															config.errorMessages.internalServerError
																.serverError,
															req,
															`${loggerIdentifier}on verifyEmailCode Api`,
															err,
														),
													);
											}
										},
									);
								} else if (
									difference.minutes <= config.otpValidationInMinutes &&
									req?.body?.otpCode === success.otp &&
									success.isEmailVerified
								) {
									// he is already verified user
									userService.checkEmail(
										{ where: { email: email } },
										function (err, user) {
											if (err) {
												return res
													.status(serverErrors.internalServerError)
													.json(
														commonService.getErrorResponse(
															serverErrors.internalServerError,
															config.errorMessages.internalServerError
																.serverError,
															req,
															`${loggerIdentifier}on verifyEmailCode Api`,
															err,
														),
													);
											} else if (user) {
												let authData = {
													userId: user.id,
													email: email,
													createdDate: new Date(),
												};
												authentication.generateAuthToken(
													authData,
													function (err, token) {
														if (err) {
															return res
																.status(serverErrors.internalServerError)
																.json(
																	commonService.getErrorResponse(
																		serverErrors.internalServerError,
																		config.errorMessages.internalServerError
																			.serverError,
																		req,
																		`${loggerIdentifier}on verifyEmailCode Api`,
																		err,
																	),
																);
														} else if (token) {
															let response = {
																isValidOTP: true,
																userData: user,
															};
															return res
																.cookie("token", token, {
																	secure:
																		process.env.NODE_ENV !== "development",
																	httpOnly: true,
																})
																.status(successStatusCode)
																.json(
																	commonService.getSuccessResponse(
																		response,
																		config.successMessages.messages.successApi,
																	),
																);
														} else {
															return res
																.status(serverErrors.internalServerError)
																.json(
																	commonService.getErrorResponse(
																		serverErrors.internalServerError,
																		config.errorMessages.internalServerError
																			.serverError,
																		req,
																		`${loggerIdentifier}on verifyEmailCode Api`,
																		err,
																	),
																);
														}
													},
												);
											} else {
												// not valid user
												let response = {
													isValidOTP: false,
												};
												return res
													.status(successStatusCode)
													.json(
														commonService.getSuccessResponse(
															response,
															config.successMessages.messages.successApi,
														),
													);
											}
										},
									);
								} else {
									// otp expired
									let response = {
										isValidOTP: false,
									};
									return res
										.status(successStatusCode)
										.json(
											commonService.getSuccessResponse(
												response,
												config.successMessages.messages.successApi,
											),
										);
								}
							} else {
								// invalid otp
								let response = {
									isValidOTP: false,
								};
								return res
									.status(successStatusCode)
									.json(
										commonService.getSuccessResponse(
											response,
											config.successMessages.messages.successApi,
										),
									);
							}
						});
					} else {
						return res
							.status(errorStatusCodes.badRequest)
							.json(
								commonService.getErrorResponse(
									errorStatusCodes.badRequest,
									config.errorMessages.badRequest.OTPTypeShouldBeString,
									req,
									`${loggerIdentifier}on verifyEmailCode Api`,
								),
							);
					}
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req,
								`${loggerIdentifier}on verifyEmailCode Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req,
							`${loggerIdentifier}on verifyEmailCode Api`,
							e,
						),
					);
			}
		},
		updateUserOnbording: function (req, res) {
			try {
				if (
					Object.keys(req?.body)?.length &&
					req.user &&
					req.user.status === "onboarding_1"
				) {
					if (req.body.password) {
						commonService.ValidatePassword(
							req.body.password,
							function (err, password) {
								if (err) {
									return res
										.status(serverErrors.internalServerError)
										.json(
											commonService.getErrorResponse(
												serverErrors.internalServerError,
												config.errorMessages.internalServerError.serverError,
												req,
												`${loggerIdentifier}on onbording update Api`,
												err,
											),
										);
								} else if (password) {
									encryptPassword(
										req.body.password,
										function (err, hash, salt) {
											if (err) {
												return res
													.status(serverErrors.internalServerError)
													.json(
														commonService.getErrorResponse(
															serverErrors.internalServerError,
															config.errorMessages.internalServerError
																.serverError,
															req,
															`${loggerIdentifier}on onbording update Api`,
															err,
														),
													);
											} else {
												let skipBoolean =
													req.body.isSkippingCreateSpace === true ||
													req.body.isSkippingCreateSpace === "true";
												let nextOnboardingStepStatus = skipBoolean
													? "onboarding_3"
													: "onboarding_2";
												userService.updateUser(
													{
														password: hash,
														salt: salt,
														status: nextOnboardingStepStatus,
													},
													{ where: { id: req?.user?.id } },
													function (err, updatedRes) {
														if (err) {
															return res
																.status(serverErrors.internalServerError)
																.json(
																	commonService.getErrorResponse(
																		serverErrors.internalServerError,
																		config.errorMessages.internalServerError
																			.serverError,
																		req,
																		`${loggerIdentifier}on onbording update Api`,
																		err,
																	),
																);
														} else if (updatedRes) {
															req.user.status = nextOnboardingStepStatus;
															let response = {
																userData: req.user,
															};
															return res
																.status(successStatusCode)
																.json(
																	commonService.getSuccessResponse(
																		response,
																		config.successMessages.messages.successApi,
																	),
																);
														} else {
															return res
																.status(serverErrors.internalServerError)
																.json(
																	commonService.getErrorResponse(
																		serverErrors.internalServerError,
																		config.errorMessages.internalServerError
																			.serverError,
																		req,
																		`${loggerIdentifier}on onbording update Api`,
																		err,
																	),
																);
														}
													},
												);
											}
										},
									);
								} else {
									// invalid password
									return res
										.status(errorStatusCodes.badRequest)
										.json(
											commonService.getErrorResponse(
												errorStatusCodes.badRequest,
												config.errorMessages.badRequest.invalidPassword,
												req,
												`${loggerIdentifier}on onbording update Api`,
											),
										);
								}
							},
						);
					} else {
						// missingRequiredFields
						return res
							.status(errorStatusCodes.badRequest)
							.json(
								commonService.getErrorResponse(
									errorStatusCodes.badRequest,
									config.errorMessages.badRequest.missingRequiredFields,
									req,
									`${loggerIdentifier}on onbording update Api`,
								),
							);
					}
				} else if (
					Object.keys(req?.body)?.length &&
					req.user &&
					req.user.status === "onboarding_3"
				) {
					let isNotRobotBoolean =
						req.body?.isNotRobotVerified === "true" ||
						req.body?.isNotRobotVerified === true;
					if (isNotRobotBoolean) {
						userService.fetchUserDataWithPassword(
							{ where: { id: req?.user?.id } },
							function (err, userData) {
								if (err) {
									return res
										.status(serverErrors.internalServerError)
										.json(
											commonService.getErrorResponse(
												serverErrors.internalServerError,
												config.errorMessages.internalServerError.serverError,
												req,
												`${loggerIdentifier}on onbording update Api`,
												err,
											),
										);
								} else if (userData) {
									userData.status = "completed";
									userData
										.save()
										.then(() => {
											spaceMemberService.fetchUserMemberList(
												{ where: { userId: req?.user?.id, status: "pending" } },
												function (err, membersList) {
													if (err) {
														return res
															.status(serverErrors.internalServerError)
															.json(
																commonService.getErrorResponse(
																	serverErrors.internalServerError,
																	config.errorMessages.internalServerError
																		.serverError,
																	req,
																	`${loggerIdentifier}on onbording update Api`,
																	err,
																),
															);
													} else {
														let response = {
															userData: userData,
															pendingInvitations: membersList,
														};
														return res
															.status(successStatusCode)
															.json(
																commonService.getSuccessResponse(
																	response,
																	config.successMessages.messages.successApi,
																),
															);
													}
												},
											);
										})
										.catch((err) => {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req,
														`${loggerIdentifier}on onbording update Api`,
														err,
													),
												);
										});
								} else {
									return res
										.status(serverErrors.internalServerError)
										.json(
											commonService.getErrorResponse(
												serverErrors.internalServerError,
												config.errorMessages.internalServerError.serverError,
												req,
												`${loggerIdentifier}on onbording update Api`,
												err,
											),
										);
								}
							},
						);
					} else {
						return res
							.status(errorStatusCodes.badRequest)
							.json(
								commonService.getErrorResponse(
									errorStatusCodes.badRequest,
									config.errorMessages.badRequest.missingRequiredFields,
									req,
									`${loggerIdentifier}on onbording update Api`,
								),
							);
					}
				} else {
					// user status registration status not updated
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.onboardingStepAlreadyCompleted,
								req,
								`${loggerIdentifier}on onbording update Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req,
							`${loggerIdentifier}on onbording update Api`,
							e,
						),
					);
			}
		},
		forgotPasswordRequest: function (req, res) {
			try {
				if (req?.body?.email) {
					let email = req.body.email.toLowerCase();
					userService.checkEmail(
						{ where: { email: email, status: "completed" } },
						function (err, user) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on forgotPasswordRequest Api`,
											err,
										),
									);
							} else if (user) {
								// user found
								let authData = {
									userId: user.id,
									email: email,
									createdDate: new Date(),
								};
								authentication.generateOTPAuthToken(
									authData,
									function (err, token) {
										if (err) {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req,
														`${loggerIdentifier}on forgotPasswordRequest Api`,
														err,
													),
												);
										} else if (token) {
											// const otpCode = randomatic('0', 6, {});
											let encryptOtpDataObj = {
												email: email,
												jwtToken: token,
												isRequestFor: "forgotPassword",
											};
											authentication.encryptOTPData(
												encryptOtpDataObj,
												function (err, encryptedData) {
													if (err) {
														return res
															.status(serverErrors.internalServerError)
															.json(
																commonService.getErrorResponse(
																	serverErrors.internalServerError,
																	config.errorMessages.internalServerError
																		.serverError,
																	req,
																	`${loggerIdentifier}on forgotPasswordRequest Api`,
																	err,
																),
															);
													} else if (encryptedData) {
														mailManager.sendMail(
															email,
															{
																firstName: user?.firstName,
																lastName: user?.lastName,
															},
															encryptedData,
															"forgotPassword",
															function (err, successMail) {
																if (err) {
																	return res
																		.status(serverErrors.internalServerError)
																		.json(
																			commonService.getErrorResponse(
																				serverErrors.internalServerError,
																				config.errorMessages.internalServerError
																					.serverError,
																				req,
																				`${loggerIdentifier}on forgotPasswordRequest Api`,
																				err,
																			),
																		);
																} else if (successMail) {
																	let response = {
																		isValidEmail: true,
																	};
																	return res
																		.status(successStatusCode)
																		.json(
																			commonService.getSuccessResponse(
																				response,
																				config.successMessages.messages
																					.successApi,
																			),
																		);
																} else {
																	return res
																		.status(serverErrors.internalServerError)
																		.json(
																			commonService.getErrorResponse(
																				serverErrors.internalServerError,
																				config.errorMessages.internalServerError
																					.serverError,
																				req,
																				`${loggerIdentifier}on forgotPasswordRequest Api`,
																				err,
																			),
																		);
																}
															},
														);
													} else {
														return res
															.status(serverErrors.internalServerError)
															.json(
																commonService.getErrorResponse(
																	serverErrors.internalServerError,
																	config.errorMessages.internalServerError
																		.serverError,
																	req,
																	`${loggerIdentifier}on forgotPasswordRequest Api`,
																	err,
																),
															);
													}
												},
											);
										} else {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req,
														`${loggerIdentifier}on forgotPasswordRequest Api`,
														err,
													),
												);
										}
									},
								);
							} else {
								// user not found
								return res
									.status(errorStatusCodes.NotFound)
									.json(
										commonService.getErrorResponse(
											errorStatusCodes.NotFound,
											config.errorMessages.badRequest.userNotFound,
											req,
											`${loggerIdentifier}on forgotPasswordRequest Api`,
										),
									);
							}
						},
					);
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req,
								`${loggerIdentifier}on forgotPasswordRequest Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req,
							`${loggerIdentifier}on forgotPasswordRequest Api`,
							e,
						),
					);
			}
		},
		updatePassword: function (req, res) {
			try {
				if (req.body.password && !req.isExpiredEmail && req.userMail) {
					let email = req.userMail.toLowerCase();
					commonService.ValidatePassword(
						req.body.password,
						function (err, password) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on updatePassword Api`,
											err,
										),
									);
							} else if (password) {
								encryptPassword(req.body.password, function (err, hash, salt) {
									if (err) {
										return res
											.status(serverErrors.internalServerError)
											.json(
												commonService.getErrorResponse(
													serverErrors.internalServerError,
													config.errorMessages.internalServerError.serverError,
													req,
													`${loggerIdentifier}on updatePassword Api`,
													err,
												),
											);
									} else {
										userService.updateUser(
											{ password: hash, salt: salt },
											{ where: { email: req.userMail.toLowerCase() } },
											function (err, updatedRes) {
												if (err) {
													return res
														.status(serverErrors.internalServerError)
														.json(
															commonService.getErrorResponse(
																serverErrors.internalServerError,
																config.errorMessages.internalServerError
																	.serverError,
																req,
																`${loggerIdentifier}on updatePassword Api`,
																err,
															),
														);
												} else if (updatedRes) {
													userService.checkEmail(
														{ where: { email: email } },
														function (err, user) {
															if (err) {
																return res
																	.status(serverErrors.internalServerError)
																	.json(
																		commonService.getErrorResponse(
																			serverErrors.internalServerError,
																			config.errorMessages.internalServerError
																				.serverError,
																			req,
																			`${loggerIdentifier}on updatePassword Api`,
																			err,
																		),
																	);
															} else if (user) {
																let authData = {
																	userId: user.id,
																	email: email,
																	createdDate: new Date(),
																};
																authentication.generateAuthToken(
																	authData,
																	function (err, token) {
																		if (err) {
																			return res
																				.status(
																					serverErrors.internalServerError,
																				)
																				.json(
																					commonService.getErrorResponse(
																						serverErrors.internalServerError,
																						config.errorMessages
																							.internalServerError.serverError,
																						req,
																						`${loggerIdentifier}on updatePassword Api`,
																						err,
																					),
																				);
																		} else if (token) {
																			let response = {
																				isValidEmail: true,
																				userData: user,
																			};
																			return res
																				.cookie("token", token, {
																					secure:
																						process.env.NODE_ENV !==
																						"development",
																					httpOnly: true,
																				})
																				.status(successStatusCode)
																				.json(
																					commonService.getSuccessResponse(
																						response,
																						config.successMessages.messages
																							.successApi,
																					),
																				);
																		} else {
																			return res
																				.status(
																					serverErrors.internalServerError,
																				)
																				.json(
																					commonService.getErrorResponse(
																						serverErrors.internalServerError,
																						config.errorMessages
																							.internalServerError.serverError,
																						req,
																						`${loggerIdentifier}on updatePassword Api`,
																						err,
																					),
																				);
																		}
																	},
																);
															} else {
																// not valid user
																let response = {
																	isValidEmail: false,
																};
																return res
																	.status(successStatusCode)
																	.json(
																		commonService.getSuccessResponse(
																			response,
																			config.successMessages.messages
																				.successApi,
																		),
																	);
															}
														},
													);
												} else {
													return res
														.status(serverErrors.internalServerError)
														.json(
															commonService.getErrorResponse(
																serverErrors.internalServerError,
																config.errorMessages.internalServerError
																	.serverError,
																req,
																`${loggerIdentifier}on updatePassword Api`,
																err,
															),
														);
												}
											},
										);
									}
								});
							} else {
								// invalid password
								return res
									.status(errorStatusCodes.badRequest)
									.json(
										commonService.getErrorResponse(
											errorStatusCodes.badRequest,
											config.errorMessages.badRequest.invalidPassword,
											req,
											`${loggerIdentifier}on updatePassword Api`,
										),
									);
							}
						},
					);
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req,
								`${loggerIdentifier}on updatePassword Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req,
							`${loggerIdentifier}on updatePassword Api`,
							e,
						),
					);
			}
		},
		login: function (req, res) {
			try {
				if (req.body.password && req.body.email) {
					let email = req.body.email.toLowerCase();
					userService.fetchUserDataWithPassword(
						{ where: { email: email, status: { [Op.ne]: "notVerified" } } },
						function (err, user) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on login Api`,
											err,
										),
									);
							} else if (user?.password) {
								comparePasswords(
									req.body.password,
									user.password,
									user.salt,
									function (err, isMatched) {
										if (err) {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req,
														`${loggerIdentifier}on login Api`,
														err,
													),
												);
										} else if (isMatched) {
											user.password = null;
											user.salt = null;
											// entered correct password
											let authData = {
												userId: user.id,
												email: email,
												createdDate: new Date(),
											};
											authentication.generateAuthToken(
												authData,
												function (err, token) {
													if (err) {
														return res
															.status(serverErrors.internalServerError)
															.json(
																commonService.getErrorResponse(
																	serverErrors.internalServerError,
																	config.errorMessages.internalServerError
																		.serverError,
																	req,
																	`${loggerIdentifier}on login Api`,
																	err,
																),
															);
													} else if (token) {
														spaceMemberService.fetchUserMemberList(
															{ where: { userId: user.id, status: "pending" } },
															function (err, membersList) {
																if (err) {
																	return res
																		.status(serverErrors.internalServerError)
																		.json(
																			commonService.getErrorResponse(
																				serverErrors.internalServerError,
																				config.errorMessages.internalServerError
																					.serverError,
																				req,
																				`${loggerIdentifier}on login Api`,
																				err,
																			),
																		);
																} else {
																	let findCondition = {
																		where: {
																			userId: user.id,
																			status: "active",
																		},
																	};
																	spaceMemberService.countData(
																		findCondition,
																		function (err, count) {
																			if (err) {
																				return res
																					.status(
																						serverErrors.internalServerError,
																					)
																					.json(
																						commonService.getErrorResponse(
																							serverErrors.internalServerError,
																							config.errorMessages
																								.internalServerError
																								.serverError,
																							req,
																							`${loggerIdentifier}on validateEmailFromInvitation Api`,
																							err,
																						),
																					);
																			} else {
																				let response = {
																					isValidCredentials: true,
																					userData: user,
																					pendingInvitations: membersList,
																					isJoinedSpace: count ? true : false,
																				};
																				return res
																					.cookie("token", token, {
																						secure:
																							process.env.NODE_ENV !==
																							"development",
																						httpOnly: true,
																					})
																					.status(successStatusCode)
																					.json(
																						commonService.getSuccessResponse(
																							response,
																							config.successMessages.messages
																								.successApi,
																						),
																					);
																			}
																		},
																	);
																}
															},
														);
													} else {
														return res
															.status(serverErrors.internalServerError)
															.json(
																commonService.getErrorResponse(
																	serverErrors.internalServerError,
																	config.errorMessages.internalServerError
																		.serverError,
																	req,
																	`${loggerIdentifier}on login Api`,
																	err,
																),
															);
													}
												},
											);
										} else {
											// entered password not matched
											let response = {
												isValidCredentials: false,
											};
											return res
												.status(successStatusCode)
												.json(
													commonService.getSuccessResponse(
														response,
														config.successMessages.messages.successApi,
													),
												);
										}
									},
								);
							} else {
								// user not found
								return res
									.status(errorStatusCodes.NotFound)
									.json(
										commonService.getErrorResponse(
											errorStatusCodes.NotFound,
											config.errorMessages.badRequest.userNotFound,
											req.body,
											`${loggerIdentifier}on login Api`,
										),
									);
							}
						},
					);
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req.body,
								`${loggerIdentifier}on login Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req.body,
							`${loggerIdentifier}on login Api`,
							e,
						),
					);
			}
		},
		loginWithMagicLinkRequest: function (req, res) {
			try {
				if (req.body.email) {
					let email = req.body.email.toLowerCase();
					userService.checkEmail(
						{ where: { email: email, status: { [Op.ne]: "notVerified" } } },
						function (err, user) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on loginWithMagicLinkRequest Api`,
											err,
										),
									);
							} else if (user) {
								let authData = {
									userId: user.id,
									email: email,
									createdDate: new Date(),
								};
								authentication.generateOTPAuthToken(
									authData,
									function (err, token) {
										if (err) {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req,
														`${loggerIdentifier}on loginWithMagicLinkRequest Api`,
														err,
													),
												);
										} else if (token) {
											let encryptOtpDataObj = {
												email: email,
												jwtToken: token,
												isRequestFor: "login",
											};
											authentication.encryptOTPData(
												encryptOtpDataObj,
												function (err, encryptedData) {
													if (err) {
														return res
															.status(serverErrors.internalServerError)
															.json(
																commonService.getErrorResponse(
																	serverErrors.internalServerError,
																	config.errorMessages.internalServerError
																		.serverError,
																	req,
																	`${loggerIdentifier}on loginWithMagicLinkRequest Api`,
																	err,
																),
															);
													} else if (encryptedData) {
														mailManager.sendMail(
															email,
															{
																firstName: user?.firstName,
																lastName: user?.lastName,
															},
															encryptedData,
															"loginWithMagicLink",
															function (err, successMail) {
																if (err) {
																	return res
																		.status(serverErrors.internalServerError)
																		.json(
																			commonService.getErrorResponse(
																				serverErrors.internalServerError,
																				config.errorMessages.internalServerError
																					.serverError,
																				req,
																				`${loggerIdentifier}on loginWithMagicLinkRequest Api`,
																				err,
																			),
																		);
																} else if (successMail) {
																	let response = {
																		isValidEmail: true,
																	};
																	return res
																		.status(successStatusCode)
																		.json(
																			commonService.getSuccessResponse(
																				response,
																				config.successMessages.messages
																					.successApi,
																			),
																		);
																} else {
																	return res
																		.status(serverErrors.internalServerError)
																		.json(
																			commonService.getErrorResponse(
																				serverErrors.internalServerError,
																				config.errorMessages.internalServerError
																					.serverError,
																				req,
																				`${loggerIdentifier}on loginWithMagicLinkRequest Api`,
																				err,
																			),
																		);
																}
															},
														);
													} else {
														return res
															.status(serverErrors.internalServerError)
															.json(
																commonService.getErrorResponse(
																	serverErrors.internalServerError,
																	config.errorMessages.internalServerError
																		.serverError,
																	req,
																	`${loggerIdentifier}on loginWithMagicLinkRequest Api`,
																	err,
																),
															);
													}
												},
											);
										} else {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req,
														`${loggerIdentifier}on loginWithMagicLinkRequest Api`,
														err,
													),
												);
										}
									},
								);
							} else {
								return res
									.status(errorStatusCodes.NotFound)
									.json(
										commonService.getErrorResponse(
											errorStatusCodes.NotFound,
											config.errorMessages.badRequest.userNotFound,
											req.body,
											`${loggerIdentifier}on loginWithMagicLinkRequest Api`,
										),
									);
							}
						},
					);
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req.body,
								`${loggerIdentifier}on loginWithMagicLinkRequest Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req.body,
							`${loggerIdentifier}on loginWithMagicLinkRequest Api`,
							e,
						),
					);
			}
		},
		signInUsingMagicLink: function (req, res) {
			try {
				if (!req.isExpiredEmail && req.userMail) {
					let email = req.userMail.toLowerCase();
					userService.fetchUserDataWithPassword(
						{ where: { email: email } },
						function (err, user) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on signInUsingMagicLink Api`,
											err,
										),
									);
							} else if (user) {
								let authData = {
									userId: user.id,
									email: email,
									createdDate: new Date(),
								};
								authentication.generateAuthToken(
									authData,
									function (err, token) {
										if (err) {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req,
														`${loggerIdentifier}on signInUsingMagicLink Api`,
														err,
													),
												);
										} else if (token) {
											spaceMemberService.fetchUserMemberList(
												{ where: { userId: user.id, status: "pending" } },
												function (err, membersList) {
													if (err) {
														return res
															.status(serverErrors.internalServerError)
															.json(
																commonService.getErrorResponse(
																	serverErrors.internalServerError,
																	config.errorMessages.internalServerError
																		.serverError,
																	req,
																	`${loggerIdentifier}on signInUsingMagicLink Api`,
																	err,
																),
															);
													} else {
														let findCondition = {
															where: {
																userId: user.id,
																status: "active",
															},
														};
														spaceMemberService.countData(
															findCondition,
															function (err, count) {
																if (err) {
																	return res
																		.status(serverErrors.internalServerError)
																		.json(
																			commonService.getErrorResponse(
																				serverErrors.internalServerError,
																				config.errorMessages.internalServerError
																					.serverError,
																				req,
																				`${loggerIdentifier}on validateEmailFromInvitation Api`,
																				err,
																			),
																		);
																} else {
																	let response = {
																		isValidEmail: true,
																		userData: user,
																		pendingInvitations: membersList,
																		isJoinedSpace: count ? true : false,
																	};
																	return res
																		.cookie("token", token, {
																			secure:
																				process.env.NODE_ENV !== "development",
																			httpOnly: true,
																		})
																		.status(successStatusCode)
																		.json(
																			commonService.getSuccessResponse(
																				response,
																				config.successMessages.messages
																					.successApi,
																			),
																		);
																}
															},
														);
													}
												},
											);
										} else {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req,
														`${loggerIdentifier}on signInUsingMagicLink Api`,
														err,
													),
												);
										}
									},
								);
							} else {
								// not valid user
								let response = {
									isValidEmail: false,
								};
								return res
									.status(successStatusCode)
									.json(
										commonService.getSuccessResponse(
											response,
											config.successMessages.messages.successApi,
										),
									);
							}
						},
					);
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.expiredMagicLink,
								req,
								`${loggerIdentifier}on signInUsingMagicLink Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req.body,
							`${loggerIdentifier}on signInUsingMagicLink Api`,
							e,
						),
					);
			}
		},
		updateUserDetails: function (req, res) {
			try {
				if (
					req.body &&
					req.user &&
					(req.body.firstName ||
						req.body.lastName ||
						req.body.company ||
						req.body.country ||
						req.body.phoneNumber ||
						req.body.DOB)
				) {
					let userDetails = {};
					if (req.body.firstName) {
						userDetails.firstName = req.body.firstName;
					}
					if (req.body.lastName) {
						userDetails.lastName = req.body.lastName;
					}
					if (req.body.company) {
						userDetails.company = req.body.company;
					}
					if (req.body.phoneNumber) {
						userDetails.phoneNumber = req.body.phoneNumber;
					}
					if (req.body.country) {
						userDetails.country = req.body.country;
					}
					if (req.body.DOB) {
						userDetails.DOB = req.body.DOB;
					}
					let findCondition = {
						where: {
							id: req.user?.id,
						},
					};
					userService.updateUser(
						userDetails,
						findCondition,
						function (err, updateResult) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on updateUserDetails Api`,
											err,
										),
									);
							} else {
								return res
									.status(successStatusCode)
									.json(
										commonService.getSuccessResponse(
											updateResult,
											config.successMessages.messages.successApi,
										),
									);
							}
						},
					);
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req.body,
								`${loggerIdentifier}on updateUserDetails Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req.body,
							`${loggerIdentifier}on updateUserDetails Api`,
							e,
						),
					);
			}
		},
		changePassword: function (req, res) {
			try {
				if (req.body.existingPassword && req.body.newPassword && req.user) {
					if (req.body.existingPassword === req.body.newPassword) {
						return res
							.status(serverErrors.internalServerError)
							.json(
								commonService.getErrorResponse(
									serverErrors.internalServerError,
									config.errorMessages.badRequest.existingPassword,
									req,
									config.errorMessages.badRequest.existingPassword,
								),
							);
					}
					commonService.ValidatePassword(
						req.body.newPassword,
						function (err, password) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on changePassword Api`,
											err,
										),
									);
							} else if (password) {
								comparePasswords(
									req.body.existingPassword,
									req.user.password,
									req.user.salt,
									function (err, passwordMatch) {
										if (err) {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req,
														`${loggerIdentifier}on changePassword Api`,
														err,
													),
												);
										} else if (passwordMatch) {
											// password matched
											encryptPassword(
												req.body.newPassword,
												function (err, hash, salt) {
													if (err) {
														return res
															.status(serverErrors.internalServerError)
															.json(
																commonService.getErrorResponse(
																	serverErrors.internalServerError,
																	config.errorMessages.internalServerError
																		.serverError,
																	req,
																	`${loggerIdentifier}on changePassword Api`,
																	err,
																),
															);
													} else {
														userService.updateUser(
															{ password: hash, salt: salt },
															{ where: { id: req.user.id } },
															function (err, user) {
																if (err) {
																	return res
																		.status(serverErrors.internalServerError)
																		.json(
																			commonService.getErrorResponse(
																				serverErrors.internalServerError,
																				config.errorMessages.internalServerError
																					.serverError,
																				req,
																				`${loggerIdentifier}on changePassword Api`,
																				err,
																			),
																		);
																} else if (user) {
																	mailManager.sendMail(
																		req?.user?.email,
																		{
																			firstName: req.user.firstName,
																			lastName: req.user.lastName,
																		},
																		null,
																		"changePassword",
																		function (err, successMail) {
																			if (err) {
																				return res
																					.status(
																						serverErrors.internalServerError,
																					)
																					.json(
																						commonService.getErrorResponse(
																							serverErrors.internalServerError,
																							config.errorMessages
																								.internalServerError
																								.serverError,
																							req,
																							`${loggerIdentifier}on changePassword Api`,
																							err,
																						),
																					);
																			} else if (successMail) {
																				let response = {
																					isValidEmail: true,
																				};
																				return res
																					.status(successStatusCode)
																					.json(
																						commonService.getSuccessResponse(
																							req.user,
																							config.successMessages.messages
																								.successApi,
																						),
																					);
																			} else {
																				return res
																					.status(
																						serverErrors.internalServerError,
																					)
																					.json(
																						commonService.getErrorResponse(
																							serverErrors.internalServerError,
																							config.errorMessages
																								.internalServerError
																								.serverError,
																							req,
																							`${loggerIdentifier}on changePassword Api`,
																							err,
																						),
																					);
																			}
																		},
																	);
																} else {
																	return res
																		.status(serverErrors.internalServerError)
																		.json(
																			commonService.getErrorResponse(
																				serverErrors.internalServerError,
																				config.errorMessages.internalServerError
																					.serverError,
																				req,
																				`${loggerIdentifier}on changePassword Api`,
																				err,
																			),
																		);
																}
															},
														);
													}
												},
											);
										} else {
											// password not matched
											return res
												.status(errorStatusCodes.badRequest)
												.json(
													commonService.getErrorResponse(
														errorStatusCodes.badRequest,
														config.errorMessages.badRequest.existingPassword,
														req.body,
														`${loggerIdentifier}on changePassword Api`,
													),
												);
										}
									},
								);
							} else {
								// invalid password
								return res
									.status(errorStatusCodes.badRequest)
									.json(
										commonService.getErrorResponse(
											errorStatusCodes.badRequest,
											config.errorMessages.badRequest.invalidPassword,
											req,
											`${loggerIdentifier}on changePassword Api`,
										),
									);
							}
						},
					);
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req.body,
								`${loggerIdentifier}on changePassword Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req.body,
							`${loggerIdentifier}on changePassword Api`,
							e,
						),
					);
			}
		},
		uploadUserProfileImage: function (req, res) {
			try {
				if (req?.user) {
					s3.uploadFile(req.file, function (err, url) {
						if (err) {
							return res
								.status(serverErrors.internalServerError)
								.json(
									commonService.getErrorResponse(
										serverErrors.internalServerError,
										config.errorMessages.internalServerError.serverError,
										req,
										`${loggerIdentifier}on uploadUserProfileImage Api`,
										err,
									),
								);
						} else {
							req.user.userProfileImage = url.Location;
							req.user
								.save()
								.then((successData) => {
									return res
										.status(successStatusCode)
										.json(
											commonService.getSuccessResponse(
												successData,
												config.successMessages.messages.successApi,
											),
										);
								})
								.catch((err) => {
									return res
										.status(serverErrors.internalServerError)
										.json(
											commonService.getErrorResponse(
												serverErrors.internalServerError,
												config.errorMessages.internalServerError.serverError,
												req,
												`${loggerIdentifier}on uploadUserProfileImage Api`,
												err,
											),
										);
								});
						}
					});
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req.body,
								`${loggerIdentifier}on uploadUserProfileImage Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req.body,
							`${loggerIdentifier}on uploadUserProfileImage Api`,
							e,
						),
					);
			}
		},
		fetchUserProfileImage: function (req, res) {
			try {
				if (req.params.fileKey) {
					s3.getFileStream(req.params.fileKey, function (err, stream) {
						if (err) {
							return res
								.status(serverErrors.internalServerError)
								.json(
									commonService.getErrorResponse(
										serverErrors.internalServerError,
										config.errorMessages.internalServerError.serverError,
										req,
										`${loggerIdentifier}on fetchUserProfileImage Api`,
										err,
									),
								);
						} else {
							return res.json(stream);
						}
					});
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req.body,
								`${loggerIdentifier}on fetchUserProfileImage Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req.body,
							`${loggerIdentifier}on fetchUserProfileImage Api`,
							e,
						),
					);
			}
		},
		changeEmailRequest: function (req, res) {
			try {
				if (req.user && req.body.newEmail) {
					let findEmail = { where: { email: req.body.newEmail.toLowerCase() } };
					userService.checkEmail(findEmail, function (err, emailFound) {
						if (err) {
							return res
								.status(serverErrors.internalServerError)
								.json(
									commonService.getErrorResponse(
										serverErrors.internalServerError,
										config.errorMessages.internalServerError.serverError,
										req,
										`${loggerIdentifier}on changeEmailRequest Api`,
										err,
									),
								);
						} else if (emailFound) {
							// invalid email
							return res
								.status(successStatusCode)
								.json(
									commonService.getSuccessResponse(
										{ isValidEmail: false },
										config.errorMessages.badRequest.emailExists,
									),
								);
						} else {
							// valid email to update
							let authData = {
								userId: req.user.id,
								email: req.user.email,
								createdDate: new Date(),
							};
							authentication.generateOTPAuthToken(
								authData,
								function (err, token) {
									if (err) {
										return res
											.status(serverErrors.internalServerError)
											.json(
												commonService.getErrorResponse(
													serverErrors.internalServerError,
													config.errorMessages.internalServerError.serverError,
													req,
													`${loggerIdentifier}on changeEmailRequest Api`,
													err,
												),
											);
									} else if (token) {
										let encryptOtpDataObj = {
											email: req.user.email,
											newEmail: req.body.newEmail.toLowerCase(),
											jwtToken: token,
											isRequestFor: "changeEmail",
										};
										authentication.encryptOTPData(
											encryptOtpDataObj,
											function (err, encryptedData) {
												if (err) {
													return res
														.status(serverErrors.internalServerError)
														.json(
															commonService.getErrorResponse(
																serverErrors.internalServerError,
																config.errorMessages.internalServerError
																	.serverError,
																req,
																`${loggerIdentifier}on changeEmailRequest Api`,
																err,
															),
														);
												} else if (encryptedData) {
													mailManager.sendMail(
														req.body.newEmail,
														req.user?.firstName,
														encryptedData,
														"changeEmailRequest",
														function (err, successMail) {
															if (err) {
																return res
																	.status(serverErrors.internalServerError)
																	.json(
																		commonService.getErrorResponse(
																			serverErrors.internalServerError,
																			config.errorMessages.internalServerError
																				.serverError,
																			req,
																			`${loggerIdentifier}on changeEmailRequest Api`,
																			err,
																		),
																	);
															} else if (successMail) {
																let response = {
																	isValidEmail: true,
																};
																return res
																	.status(successStatusCode)
																	.json(
																		commonService.getSuccessResponse(
																			response,
																			config.successMessages.messages
																				.successApi,
																		),
																	);
															} else {
																return res
																	.status(serverErrors.internalServerError)
																	.json(
																		commonService.getErrorResponse(
																			serverErrors.internalServerError,
																			config.errorMessages.internalServerError
																				.serverError,
																			req,
																			`${loggerIdentifier}on changeEmailRequest Api`,
																			err,
																		),
																	);
															}
														},
													);
												} else {
													return res
														.status(serverErrors.internalServerError)
														.json(
															commonService.getErrorResponse(
																serverErrors.internalServerError,
																config.errorMessages.internalServerError
																	.serverError,
																req,
																`${loggerIdentifier}on changeEmailRequest Api`,
																err,
															),
														);
												}
											},
										);
									} else {
										return res
											.status(serverErrors.internalServerError)
											.json(
												commonService.getErrorResponse(
													serverErrors.internalServerError,
													config.errorMessages.internalServerError.serverError,
													req,
													`${loggerIdentifier}on changeEmailRequest Api`,
													err,
												),
											);
									}
								},
							);
						}
					});
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req.body,
								`${loggerIdentifier}on changeEmailRequest Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req.body,
							`${loggerIdentifier}on changeEmailRequest Api`,
							e,
						),
					);
			}
		},
		confirmChangeEmail: function (req, res) {
			try {
				if (!req.isExpiredEmail && req.body.newEmail && req.userMail) {
					userService.updateUser(
						{ email: req.body.newEmail },
						{ where: { email: req.userMail } },
						function (err, user) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on confirmChangeEmail Api`,
											err,
										),
									);
							} else if (user) {
								return res
									.status(successStatusCode)
									.json(
										commonService.getSuccessResponse(
											{ isValidEmail: true },
											config.successMessages.messages.successApi,
										),
									);
							} else {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on confirmChangeEmail Api`,
											err,
										),
									);
							}
						},
					);
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.expiredMagicLink,
								req.body,
								`${loggerIdentifier}on confirmChangeEmail Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req.body,
							`${loggerIdentifier}on confirmChangeEmail Api`,
							e,
						),
					);
			}
		},
		tryWithDifferentEmail: function (req, res) {
			try {
				if (req.body?.lastEmail && req.body?.currentEmail) {
					let email = req.body.lastEmail.toLowerCase();
					let newEmail = req.body.currentEmail.toLowerCase();
					userService.checkEmail(
						{ where: { email: newEmail } },
						function (err, user) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on tryWithDifferentEmail Api`,
											err,
										),
									);
							} else if (user) {
								return res
									.status(errorStatusCodes.badRequest)
									.json(
										commonService.getErrorResponseWithoutLogger(
											errorStatusCodes.badRequest,
											config.errorMessages.badRequest.userExists,
										),
									);
							} else {
								userService.updateUser(
									{ email: newEmail },
									{ where: { email: email } },
									function (err, updatedRes) {
										if (err) {
											if (err?.message?.includes("Validation error")) {
												return res
													.status(errorStatusCodes.badRequest)
													.json(
														commonService.getErrorResponseWithoutLogger(
															errorStatusCodes.badRequest,
															config.errorMessages.badRequest.validationError,
															err,
														),
													);
											} else {
												return res
													.status(serverErrors.internalServerError)
													.json(
														commonService.getErrorResponse(
															serverErrors.internalServerError,
															config.errorMessages.internalServerError
																.serverError,
															req,
															`${loggerIdentifier}on tryWithDifferentEmail Api`,
															err,
														),
													);
											}
										} else if (updatedRes[0]) {
											userService.checkEmail(
												{ where: { email: newEmail } },
												function (err, user) {
													if (err) {
														return res
															.status(serverErrors.internalServerError)
															.json(
																commonService.getErrorResponse(
																	serverErrors.internalServerError,
																	config.errorMessages.internalServerError
																		.serverError,
																	req,
																	`${loggerIdentifier}on tryWithDifferentEmail Api`,
																	err,
																),
															);
													} else if (user) {
														let authData = {
															userId: user.id,
															email: newEmail,
															createdDate: new Date(),
														};
														authentication.generateOTPAuthToken(
															authData,
															function (err, token) {
																if (err) {
																	return res
																		.status(serverErrors.internalServerError)
																		.json(
																			commonService.getErrorResponse(
																				serverErrors.internalServerError,
																				config.errorMessages.internalServerError
																					.serverError,
																				req,
																				`${loggerIdentifier}on tryWithDifferentEmail Api`,
																				err,
																			),
																		);
																} else if (token) {
																	const otpCode = randomatic("0", 6, {});
																	let encryptOtpDataObj = {
																		email: newEmail,
																		jwtToken: token,
																		otp: otpCode,
																		isRequestFor: "tryWithDifferentEmail",
																	};
																	if (user?.firstName && user?.lastName) {
																		encryptOtpDataObj.firstName =
																			user?.firstName;
																		encryptOtpDataObj.lastName = user?.lastName;
																	}
																	authentication.encryptOTPData(
																		encryptOtpDataObj,
																		function (err, encryptedData) {
																			if (err) {
																				return res
																					.status(
																						serverErrors.internalServerError,
																					)
																					.json(
																						commonService.getErrorResponse(
																							serverErrors.internalServerError,
																							config.errorMessages
																								.internalServerError
																								.serverError,
																							req,
																							`${loggerIdentifier}on tryWithDifferentEmail Api`,
																							err,
																						),
																					);
																			} else if (encryptedData) {
																				const otpData = {
																					email: newEmail,
																					otp: otpCode,
																				};
																				otpService.createData(
																					otpData,
																					function (err, success) {
																						if (err) {
																							return res
																								.status(
																									serverErrors.internalServerError,
																								)
																								.json(
																									commonService.getErrorResponse(
																										serverErrors.internalServerError,
																										config.errorMessages
																											.internalServerError
																											.serverError,
																										req,
																										`${loggerIdentifier}on tryWithDifferentEmail Api`,
																										err,
																									),
																								);
																						} else if (success) {
																							mailManager.sendMail(
																								newEmail,
																								otpCode,
																								encryptedData,
																								"tryWithDifferentMail",
																								function (err, successMail) {
																									if (err) {
																										return res
																											.status(
																												serverErrors.internalServerError,
																											)
																											.json(
																												commonService.getErrorResponse(
																													serverErrors.internalServerError,
																													config.errorMessages
																														.internalServerError
																														.serverError,
																													req,
																													`${loggerIdentifier}on tryWithDifferentEmail Api`,
																													err,
																												),
																											);
																									} else if (successMail) {
																										let response = {
																											isValidEmail: true,
																											userData: user,
																										};
																										return res
																											.cookie("token", token, {
																												secure:
																													process.env
																														.NODE_ENV !==
																													"development",
																												httpOnly: true,
																											})
																											.status(successStatusCode)
																											.json(
																												commonService.getSuccessResponse(
																													response,
																													config.successMessages
																														.messages
																														.successApi,
																												),
																											);
																									} else {
																										return res
																											.status(
																												serverErrors.internalServerError,
																											)
																											.json(
																												commonService.getErrorResponse(
																													serverErrors.internalServerError,
																													config.errorMessages
																														.internalServerError
																														.serverError,
																													req,
																													`${loggerIdentifier}on tryWithDifferentEmail Api`,
																													err,
																												),
																											);
																									}
																								},
																							);
																						} else {
																							return res
																								.status(
																									serverErrors.internalServerError,
																								)
																								.json(
																									commonService.getErrorResponse(
																										serverErrors.internalServerError,
																										config.errorMessages
																											.internalServerError
																											.serverError,
																										req,
																										`${loggerIdentifier}on tryWithDifferentEmail Api`,
																										err,
																									),
																								);
																						}
																					},
																				);
																			} else {
																				return res
																					.status(
																						serverErrors.internalServerError,
																					)
																					.json(
																						commonService.getErrorResponse(
																							serverErrors.internalServerError,
																							config.errorMessages
																								.internalServerError
																								.serverError,
																							req,
																							`${loggerIdentifier}on tryWithDifferentEmail Api`,
																							err,
																						),
																					);
																			}
																		},
																	);
																} else {
																	return res
																		.status(serverErrors.internalServerError)
																		.json(
																			commonService.getErrorResponse(
																				serverErrors.internalServerError,
																				config.errorMessages.internalServerError
																					.serverError,
																				req,
																				`${loggerIdentifier}on tryWithDifferentEmail Api`,
																				err,
																			),
																		);
																}
															},
														);
													} else {
														return res
															.status(serverErrors.internalServerError)
															.json(
																commonService.getErrorResponse(
																	serverErrors.internalServerError,
																	config.errorMessages.internalServerError
																		.serverError,
																	req,
																	`${loggerIdentifier}on tryWithDifferentEmail Api`,
																	err,
																),
															);
													}
												},
											);
										} else {
											return res
												.status(errorStatusCodes.badRequest)
												.json(
													commonService.getErrorResponseWithoutLogger(
														errorStatusCodes.badRequest,
														config.errorMessages.badRequest.validationError,
														err,
													),
												);
										}
									},
								);
							}
						},
					);
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req,
								`${loggerIdentifier}on tryWithDifferentEmail Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req,
							`${loggerIdentifier}on tryWithDifferentEmail Api`,
							e,
						),
					);
			}
		},
		refreshMagicLink: function (req, res) {
			try {
				if (req.body.token) {
					authentication.decodeToken(
						req.body.token,
						true,
						function (err, data) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on refreshMagicLink Api`,
											err,
										),
									);
							} else if (data) {
								if (config.otpEmailTemplates.includes(data?.isRequestFor)) {
									//  email with otp
									authentication.decodeToken(
										data?.jwtToken,
										false,
										function (err, decodedJwt) {
											if (err) {
												return res
													.status(serverErrors.internalServerError)
													.json(
														commonService.getErrorResponse(
															serverErrors.internalServerError,
															config.errorMessages.internalServerError
																.serverError,
															req,
															`${loggerIdentifier}on refreshMagicLink Api`,
															err,
														),
													);
											} else if (decodedJwt) {
												decodedJwt.createdDate = new Date();
												return res
													.status(successStatusCode)
													.json(
														commonService.getSuccessResponse(
															decodedJwt,
															config.successMessages.messages.successApi,
														),
													);
											} else {
												return res
													.status(successStatusCode)
													.json(
														commonService.getSuccessResponse(
															decodedJwt,
															config.successMessages.messages.successApi,
														),
													);
											}
										},
									);
								} else if (
									config.withoutOtpEmailTemplates.includes(data?.isRequestFor)
								) {
									//  email without otp
									return res
										.status(successStatusCode)
										.json(
											commonService.getSuccessResponse(
												data,
												config.successMessages.messages.successApi,
											),
										);
								} else {
									return res
										.status(successStatusCode)
										.json(
											commonService.getSuccessResponse(
												data,
												config.successMessages.messages.successApi,
											),
										);
								}
							} else {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on refreshMagicLink Api`,
											err,
										),
									);
							}
						},
					);
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req,
								`${loggerIdentifier}on refreshMagicLink Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req,
							`${loggerIdentifier}on refreshMagicLink Api`,
							e,
						),
					);
			}
		},
		updateOnboardingForCreateSpace: function (req, res) {
			try {
				if (
					Object.keys(req?.body)?.length &&
					req.user &&
					req.user.status === "onboarding_2"
				) {
					if (
						req.body?.spaceName &&
						req.body?.address &&
						req.body?.city &&
						req.body?.state &&
						req.body?.country &&
						req.body?.zip &&
						req.body?.spaceType
					) {
						let spaceData = {};
						if (req.body?.spaceName) {
							spaceData.name = req.body?.spaceName;
						}
						if (req.body?.address) {
							spaceData.address = req.body?.address;
						}
						if (req.body?.city) {
							spaceData.city = req.body?.city;
						}
						if (req.body?.state) {
							spaceData.state = req.body?.state;
						}
						if (req.body?.country) {
							spaceData.country = req.body?.country;
						}
						if (req.body?.website) {
							spaceData.website = req.body?.website;
						}
						if (req.body?.zip) {
							spaceData.zip = req.body?.zip;
						}
						if (req.user?.id) {
							spaceData.creatorUserId = req.user.id;
						}
						userSpaceService.createData(
							spaceData,
							function (err, spaceSuccessRes) {
								if (err) {
									return res
										.status(serverErrors.internalServerError)
										.json(
											commonService.getErrorResponse(
												serverErrors.internalServerError,
												config.errorMessages.internalServerError.serverError,
												req,
												`${loggerIdentifier}on updateOnboardingForCreateSpace Api`,
												err,
											),
										);
								} else if (spaceSuccessRes) {
									cryptoUtility.encodeData(
										spaceSuccessRes?.id?.toString(),
										function (err, encodedData) {
											if (err) {
												return res
													.status(serverErrors.internalServerError)
													.json(
														commonService.getErrorResponse(
															serverErrors.internalServerError,
															config.errorMessages.internalServerError
																.serverError,
															req,
															`${loggerIdentifier}on updateOnboardingForCreateSpace Api`,
															err,
														),
													);
											} else if (encodedData) {
												spaceSuccessRes.publicShareLink = encodedData;
												spaceSuccessRes.save();
												userService.updateUser(
													{
														status: "onboarding_3",
														currentSpaceId: spaceSuccessRes.id,
													},
													{ where: { id: req?.user?.id } },
													function (err, updatedRes) {
														if (err) {
															return res
																.status(serverErrors.internalServerError)
																.json(
																	commonService.getErrorResponse(
																		serverErrors.internalServerError,
																		config.errorMessages.internalServerError
																			.serverError,
																		req,
																		`${loggerIdentifier}on updateOnboardingForCreateSpace Api`,
																		err,
																	),
																);
														} else if (updatedRes) {
															let spaceMemberData = {
																userId: req.user.id,
																spaceId: spaceSuccessRes.id,
																status: "active",
																role: "admin",
																isSpaceCreator: true,
															};
															spaceMemberService.createData(
																spaceMemberData,
																function (err, spaceMemberSuccessRes) {
																	if (err) {
																		return res
																			.status(serverErrors.internalServerError)
																			.json(
																				commonService.getErrorResponse(
																					serverErrors.internalServerError,
																					config.errorMessages
																						.internalServerError.serverError,
																					req,
																					`${loggerIdentifier}on updateOnboardingForCreateSpace Api`,
																					err,
																				),
																			);
																	} else if (spaceMemberSuccessRes) {
																		req.user.status = "onboarding_3";
																		let response = {
																			userData: req.user,
																			spaceData: spaceSuccessRes,
																			userSpaceMember: spaceMemberSuccessRes,
																		};
																		return res
																			.status(successStatusCode)
																			.json(
																				commonService.getSuccessResponse(
																					response,
																					config.successMessages.messages
																						.successApi,
																				),
																			);
																	} else {
																		return res
																			.status(serverErrors.internalServerError)
																			.json(
																				commonService.getErrorResponse(
																					serverErrors.internalServerError,
																					config.errorMessages
																						.internalServerError.serverError,
																					req,
																					`${loggerIdentifier}on updateOnboardingForCreateSpace Api`,
																					err,
																				),
																			);
																	}
																},
															);
														} else {
															return res
																.status(serverErrors.internalServerError)
																.json(
																	commonService.getErrorResponse(
																		serverErrors.internalServerError,
																		config.errorMessages.internalServerError
																			.serverError,
																		req,
																		`${loggerIdentifier}on updateOnboardingForCreateSpace Api`,
																		err,
																	),
																);
														}
													},
												);
											} else {
												return res
													.status(serverErrors.internalServerError)
													.json(
														commonService.getErrorResponse(
															serverErrors.internalServerError,
															config.errorMessages.internalServerError
																.serverError,
															req,
															`${loggerIdentifier}on updateOnboardingForCreateSpace Api`,
															err,
														),
													);
											}
										},
									);
								} else {
									return res
										.status(serverErrors.internalServerError)
										.json(
											commonService.getErrorResponse(
												serverErrors.internalServerError,
												config.errorMessages.internalServerError.serverError,
												req,
												`${loggerIdentifier}on updateOnboardingForCreateSpace Api`,
												"data not encoded properly",
											),
										);
								}
							},
						);
					} else if (
						req.body?.firstName &&
						req.body?.lastName &&
						req.user.status === "onboarding_2"
					) {
						let userUpdateData = {
							firstName: req.body?.firstName,
							lastName: req.body?.lastName,
							status: "onboarding_3",
						};
						userService.updateUser(
							userUpdateData,
							{ where: { id: req?.user?.id } },
							function (err, updatedRes) {
								if (err) {
									return res
										.status(serverErrors.internalServerError)
										.json(
											commonService.getErrorResponse(
												serverErrors.internalServerError,
												config.errorMessages.internalServerError.serverError,
												req,
												`${loggerIdentifier}on updateOnboardingForCreateSpace Api`,
												err,
											),
										);
								} else if (updatedRes) {
									req.user.status = "onboarding_3";
									let response = {
										userData: req.user,
									};
									return res
										.status(successStatusCode)
										.json(
											commonService.getSuccessResponse(
												response,
												config.successMessages.messages.successApi,
											),
										);
								} else {
									return res
										.status(serverErrors.internalServerError)
										.json(
											commonService.getErrorResponse(
												serverErrors.internalServerError,
												config.errorMessages.internalServerError.serverError,
												req,
												`${loggerIdentifier}on updateOnboardingForCreateSpace Api`,
												err,
											),
										);
								}
							},
						);
					} else {
						return res
							.status(errorStatusCodes.badRequest)
							.json(
								commonService.getErrorResponse(
									errorStatusCodes.badRequest,
									config.errorMessages.badRequest.missingRequiredFields,
									req,
									`${loggerIdentifier}on updateOnboardingForCreateSpace Api`,
								),
							);
					}
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req,
								`${loggerIdentifier}on updateOnboardingForCreateSpace Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req.body,
							`${loggerIdentifier}on updateOnboardingForCreateSpace Api`,
							e,
						),
					);
			}
		},
		validateEmailFromInvitation: function (req, res) {
			try {
				if (req?.body?.email && req.body?.firstName && req.body?.lastName) {
					let email = req.body.email.toLowerCase();
					let findMail = {
						where: {
							email: email,
						},
					};
					userService.checkEmail(findMail, function (err, foundUser) {
						if (err) {
							return res
								.status(serverErrors.internalServerError)
								.json(
									commonService.getErrorResponse(
										serverErrors.internalServerError,
										config.errorMessages.internalServerError.serverError,
										req,
										`${loggerIdentifier}on validateEmailFromInvitation Api`,
										err,
									),
								);
						}
						if (foundUser && foundUser?.status?.toLowerCase() === "completed") {
							let response = {
								isValidEmail: false,
							};
							return res
								.status(successStatusCode)
								.json(
									commonService.getSuccessResponse(
										response,
										config.successMessages.messages.successApi,
									),
								);
						} else {
							let userData = {
								email: email,
							};
							if (req.body?.firstName && req.body?.lastName) {
								userData.firstName = req.body?.firstName;
								userData.lastName = req.body?.lastName;
							}
							let findCondition = {
								where: {
									email: email,
								},
							};
							userService.upseartUser(
								userData,
								findCondition,
								function (err, user) {
									if (err) {
										if (err?.message?.includes("Validation error")) {
											return res
												.status(errorStatusCodes.badRequest)
												.json(
													commonService.getErrorResponseWithoutLogger(
														errorStatusCodes.badRequest,
														config.errorMessages.badRequest.validationError,
														err,
													),
												);
										} else {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req,
														`${loggerIdentifier}on validateEmailFromInvitation Api`,
														err,
													),
												);
										}
									} else if (user?.length) {
										let findCondition = {
											where: {
												email: email,
												status: ["notVerified", "invited"],
											},
										};
										userService.updateUser(
											{ status: "onboarding_1" },
											findCondition,
											function (err, updatedUserData) {
												if (err) {
													return res
														.status(serverErrors.internalServerError)
														.json(
															commonService.getErrorResponse(
																serverErrors.internalServerError,
																config.errorMessages.internalServerError
																	.serverError,
																req,
																`${loggerIdentifier}on validateEmailFromInvitation Api`,
																err,
															),
														);
												} else if (updatedUserData) {
													userService.fetchData(
														{ where: { email: email } },
														function (err, user) {
															if (err) {
																return res
																	.status(serverErrors.internalServerError)
																	.json(
																		commonService.getErrorResponse(
																			serverErrors.internalServerError,
																			config.errorMessages.internalServerError
																				.serverError,
																			req,
																			`${loggerIdentifier}on validateEmailFromInvitation Api`,
																			err,
																		),
																	);
															} else if (user) {
																let authData = {
																	userId: user.id,
																	email: email,
																	createdDate: new Date(),
																};
																authentication.generateAuthToken(
																	authData,
																	function (err, token) {
																		if (err) {
																			return res
																				.status(
																					serverErrors.internalServerError,
																				)
																				.json(
																					commonService.getErrorResponse(
																						serverErrors.internalServerError,
																						config.errorMessages
																							.internalServerError.serverError,
																						req,
																						`${loggerIdentifier}on validateEmailFromInvitation Api`,
																						err,
																					),
																				);
																		} else if (token) {
																			let findCondition = {
																				where: {
																					userId: user.id,
																					status: "active",
																				},
																			};
																			spaceMemberService.countData(
																				findCondition,
																				function (err, count) {
																					if (err) {
																						return res
																							.status(
																								serverErrors.internalServerError,
																							)
																							.json(
																								commonService.getErrorResponse(
																									serverErrors.internalServerError,
																									config.errorMessages
																										.internalServerError
																										.serverError,
																									req,
																									`${loggerIdentifier}on validateEmailFromInvitation Api`,
																									err,
																								),
																							);
																					} else {
																						let response = {
																							isValidOTP: true,
																							userData: user,
																							isJoinedSpace: count
																								? true
																								: false,
																						};
																						return res
																							.cookie("token", token, {
																								secure:
																									process.env.NODE_ENV !==
																									"development",
																								httpOnly: true,
																							})
																							.status(successStatusCode)
																							.json(
																								commonService.getSuccessResponse(
																									response,
																									config.successMessages
																										.messages.successApi,
																								),
																							);
																					}
																				},
																			);
																		} else {
																			return res
																				.status(
																					serverErrors.internalServerError,
																				)
																				.json(
																					commonService.getErrorResponse(
																						serverErrors.internalServerError,
																						config.errorMessages
																							.internalServerError.serverError,
																						req,
																						`${loggerIdentifier}on validateEmailFromInvitation Api`,
																						err,
																					),
																				);
																		}
																	},
																);
															} else {
																// not valid user
																let response = {
																	isValidOTP: false,
																};
																return res
																	.status(successStatusCode)
																	.json(
																		commonService.getSuccessResponse(
																			response,
																			config.successMessages.messages
																				.successApi,
																		),
																	);
															}
														},
													);
												} else {
													return res
														.status(serverErrors.internalServerError)
														.json(
															commonService.getErrorResponse(
																serverErrors.internalServerError,
																config.errorMessages.internalServerError
																	.serverError,
																req,
																`${loggerIdentifier}on validateEmailFromInvitation Api`,
																err,
															),
														);
												}
											},
										);
									} else {
										return res
											.status(serverErrors.internalServerError)
											.json(
												commonService.getErrorResponse(
													serverErrors.internalServerError,
													config.errorMessages.internalServerError.serverError,
													req,
													`${loggerIdentifier}on validateEmailFromInvitation Api`,
													err,
												),
											);
									}
								},
							);
						}
					});
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req,
								`${loggerIdentifier}on validateEmailFromInvitation Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req,
							`${loggerIdentifier}on validateEmailFromInvitation Api`,
							e,
						),
					);
			}
		},
		refreshDashboard: function (req, res) {
			try {
				if (req.user) {
					const filterUserCondition = {
						where: {
							id: req.user?.id,
						},
						attributes: { exclude: ["password", "salt"] },
					};
					userService.fetchUserDataWithPassword(
						filterUserCondition,
						function (err, userData) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on refreshDashboard Api`,
											err,
										),
									);
							} else if (userData) {
								let response = {
									userData: userData,
								};
								return res
									.status(successStatusCode)
									.json(
										commonService.getSuccessResponse(
											response,
											config.successMessages.messages.successApi,
										),
									);
							} else {
								return res
									.status(errorStatusCodes.badRequest)
									.json(
										commonService.getErrorResponse(
											errorStatusCodes.badRequest,
											config.errorMessages.badRequest.requestNotFound,
											req.body,
											`${loggerIdentifier}on refreshDashboard Api`,
										),
									);
							}
						},
					);
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req.body,
								`${loggerIdentifier}on refreshDashboard Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							config.errorMessages.internalServerError.serverError,
							req.body,
							`${loggerIdentifier}on refreshDashboard Api`,
							e,
						),
					);
			}
		},
	};
};
