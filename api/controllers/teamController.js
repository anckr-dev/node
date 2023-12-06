module.exports = (
	async,
	config,
	commonService,
	userService,
	mailManager,
	authentication,
	userSpaceService,
	spaceMemberService,
	cryptoUtility,
) => {
	// sequelize design
	const Op = require("sequelize").Op;
	// global declarations
	const successStatusCode = config.statusCode.success.ok;
	const errorStatusCodes = config.statusCode.clientError;
	const serverErrors = config.statusCode.serverError;
	const loggerIdentifier = config.loggerIdentifiers.teamController;

	async function createSpaceMember(
		userData,
		role,
		spaceId,
		spaceName,
		callback,
	) {
		const spaceMemberData = {
			userId: userData.id,
			spaceId: spaceId,
			role: role,
		};
		spaceMemberService.createData(
			spaceMemberData,
			function (err, spaceMemberSuccessRes) {
				if (err) {
					callback(err);
				} else if (spaceMemberSuccessRes) {
					callback(null, spaceMemberSuccessRes);
				} else {
					callback("unable to create space member");
				}
			},
		);
	}

	return {
		inviteTeamMember: function (req, res) {
			try {
				if (
					req.user &&
					req?.body?.inviteList?.length &&
					req?.body.spaceId &&
					req?.body.spaceName
				) {
					let invitationsList = [];
					async.eachSeries(
						req.body?.inviteList,
						(invite, callback) => {
							let operationPromise = new Promise((resolve, reject) => {
								if (invite?.email && invite?.role) {
									const inviteEmail = invite.email.toLowerCase();
									const findUser = {
										where: { email: invite.email.toLowerCase() },
									};
									const memberFilter = { spaceId: req?.body.spaceId };
									userService.fetchUserDataIncludesMembersWithWhere(
										findUser,
										memberFilter,
										async function (err, userFound) {
											if (err) {
												return res
													.status(serverErrors.internalServerError)
													.json(
														commonService.getErrorResponse(
															serverErrors.internalServerError,
															config.errorMessages.internalServerError
																.serverError,
															req,
															`${loggerIdentifier}on inviteTeamMember Api`,
															err,
														),
													);
											} else if (userFound) {
												if (userFound?.spaceMemberListOfUser?.length) {
													// member already exists in the space
													resolve(config.errorMessages.badRequest.emailExists);
												} else {
													// found existing user, but not in the space
													await createSpaceMember(
														userFound,
														invite.role,
														req?.body.spaceId,
														req?.body.spaceName,
														function (err, spaceMember) {
															if (err) {
																reject(err);
															} else if (spaceMember) {
																let authData = {
																	userId: userFound.id,
																	email: userFound.email,
																	createdDate: new Date(),
																	isTeamInvite: true,
																};
																authentication.generateOTPAuthToken(
																	authData,
																	function (err, token) {
																		if (err) {
																			reject(err);
																		} else if (token) {
																			// valid email to send invitation
																			let encryptOtpDataObj = {
																				isRequestFor: "inviteTeamMember",
																				jwtToken: token,
																				targetEmail: userFound.email,
																				userId: userFound.id,
																				spaceName: req.body.spaceName,
																				spaceId: req.body.spaceId,
																			};
																			authentication.encryptTeamInviteData(
																				encryptOtpDataObj,
																				function (err, encryptedData) {
																					if (err) {
																						reject(err);
																					} else if (encryptedData) {
																						let mailData = {
																							senderFirstName:
																								req.user.firstName,
																							spaceName: req.body.spaceName,
																							role: invite?.role,
																						};
																						invitationsList.push(encryptedData);
																						mailManager.sendMail(
																							inviteEmail,
																							mailData,
																							encryptedData,
																							"inviteTeamMember",
																							function (err, successMail) {
																								if (err) {
																									reject(err);
																								} else if (successMail) {
																									resolve(successMail);
																								} else {
																									reject(err);
																								}
																							},
																						);
																					} else {
																						reject(
																							config.errorMessages
																								.internalServerError
																								.serverError,
																						);
																					}
																				},
																			);
																		}
																	},
																);
															} else {
																reject("user data not created");
															}
														},
													);
												}
											} else {
												// user was not found, so, need to create a new user data with invited status
												let newUserData = {
													email: invite.email.toLowerCase(),
													status: "invited",
													currentSpaceId: req?.body.spaceId,
												};
												userService.createData(
													newUserData,
													async function (err, userData) {
														if (err) {
															reject(err);
														} else if (userData) {
															await createSpaceMember(
																userData,
																invite.role,
																req?.body.spaceId,
																req?.body.spaceName,
																function (err, spaceMember) {
																	if (err) {
																		reject(err);
																	} else if (spaceMember) {
																		let authData = {
																			userId: userData.id,
																			email: userData.email,
																			createdDate: new Date(),
																			isTeamInvite: true,
																		};
																		authentication.generateOTPAuthToken(
																			authData,
																			function (err, token) {
																				if (err) {
																					reject(err);
																				} else if (token) {
																					// valid email to send invitation
																					let encryptOtpDataObj = {
																						isRequestFor: "inviteTeamMember",
																						jwtToken: token,
																						targetEmail: userData.email,
																						userId: userData.id,
																						spaceName: req.body.spaceName,
																						spaceId: req.body.spaceId,
																					};
																					authentication.encryptTeamInviteData(
																						encryptOtpDataObj,
																						function (err, encryptedData) {
																							if (err) {
																								reject(err);
																							} else if (encryptedData) {
																								let mailData = {
																									senderFirstName:
																										req.user.firstName,
																									spaceName: req.body.spaceName,
																									role: invite?.role,
																								};
																								invitationsList.push(
																									encryptedData,
																								);
																								mailManager.sendMail(
																									inviteEmail,
																									mailData,
																									encryptedData,
																									"inviteTeamMember",
																									function (err, successMail) {
																										if (err) {
																											reject(err);
																										} else if (successMail) {
																											resolve(successMail);
																										} else {
																											reject(err);
																										}
																									},
																								);
																							} else {
																								reject(
																									config.errorMessages
																										.internalServerError
																										.serverError,
																								);
																							}
																						},
																					);
																				}
																			},
																		);
																	} else {
																		reject("user data not created");
																	}
																},
															);
														} else {
															reject("user data not created");
														}
													},
												);
											}
										},
									);
								} else {
									// missing required fields
									reject(config.errorMessages.badRequest.missingRequiredFields);
								}
							});
							operationPromise
								.then((complete) => {
									callback(null, complete);
								})
								.catch((e) => {
									callback(e);
								});
						},
						function (err, successOperation) {
							if (err) {
								let response = {
									isValidEmail: false,
									error: err,
								};
								return res
									.status(successStatusCode)
									.json(
										commonService.getSuccessResponse(
											response,
											config.successMessages.messages.successApi,
										),
									);
							} else if (successOperation) {
								let response = {
									isValidEmail: true,
									invitationsList: invitationsList,
									success: successOperation,
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
								let response = {
									isValidEmail: true,
									invitationsList: invitationsList,
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
								config.errorMessages.badRequest.missingRequiredFields,
								req.body,
								`${loggerIdentifier}on inviteTeamMember Api`,
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
							`${loggerIdentifier}on inviteTeamMember Api`,
							e,
						),
					);
			}
		},
		createSpace: function (req, res) {
			try {
				if (Object.keys(req?.body)?.length && req.user) {
					if (
						req.body?.spaceName &&
						req.body?.address &&
						req.body?.city &&
						req.body?.state &&
						req.body?.country &&
						req.body?.zip &&
						req.body?.spaceType
					) {
						let spaceData = {
							name: req.body?.spaceName,
							address: req.body?.address,
							city: req.body?.city,
							state: req.body?.state,
							country: req.body?.country,
							website: req.body?.website,
							zip: req.body?.zip,
							creatorUserId: req.user.id,
							spaceType: req.body?.spaceType,
						};
						if (req.body?.website) {
							spaceData.website = req.body?.website;
						}
						let filterCondition = {
							where: {
								creatorUserId: req.user.id,
							},
						};
						userSpaceService.fetchCount(
							filterCondition,
							function (err, filterdSpaceCount) {
								if (err) {
									return res
										.status(serverErrors.internalServerError)
										.json(
											commonService.getErrorResponse(
												serverErrors.internalServerError,
												config.errorMessages.internalServerError.serverError,
												req,
												`${loggerIdentifier}on createSpace Api`,
												err,
											),
										);
								} else if (
									filterdSpaceCount >=
									config.spaceData.noOfSpacesAllowedForCreation
								) {
									// user had reached the max space limit
									return res
										.status(errorStatusCodes.badRequest)
										.json(
											commonService.getErrorResponse(
												errorStatusCodes.badRequest,
												config.errorMessages.badRequest.OnReachMaxSpaces,
												req.body,
												`${loggerIdentifier}on createSpace Api`,
											),
										);
								} else {
									userSpaceService.createData(
										spaceData,
										function (err, spaceSuccessRes) {
											if (err) {
												return res
													.status(serverErrors.internalServerError)
													.json(
														commonService.getErrorResponse(
															serverErrors.internalServerError,
															config.errorMessages.internalServerError
																.serverError,
															req,
															`${loggerIdentifier}on createSpace Api`,
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
																		`${loggerIdentifier}on createSpace Api`,
																		err,
																	),
																);
														} else if (encodedData) {
															userService.updateUser(
																{ currentSpaceId: spaceSuccessRes.id },
																{ where: { id: req?.user?.id } },
																function (err, updatedRes) {
																	if (err) {
																		return res
																			.status(serverErrors.internalServerError)
																			.json(
																				commonService.getErrorResponse(
																					serverErrors.internalServerError,
																					config.errorMessages
																						.internalServerError.serverError,
																					req,
																					`${loggerIdentifier}on createSpace Api`,
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
																								`${loggerIdentifier}on createSpace Api`,
																								err,
																							),
																						);
																				} else if (spaceMemberSuccessRes) {
																					let response = {
																						userData: req.user,
																						spaceData: spaceSuccessRes,
																						userSpaceMember:
																							spaceMemberSuccessRes,
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
																								`${loggerIdentifier}on createSpace Api`,
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
																					config.errorMessages
																						.internalServerError.serverError,
																					req,
																					`${loggerIdentifier}on createSpace Api`,
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
																		`${loggerIdentifier}on createSpace Api`,
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
															`${loggerIdentifier}on createSpace Api`,
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
									`${loggerIdentifier}on createSpace Api`,
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
								`${loggerIdentifier}on createSpace Api`,
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
							`${loggerIdentifier}on createSpace Api`,
							e,
						),
					);
			}
		},
		fetchSpaceDetailsById: function (req, res) {
			try {
				if (req.user && req.params.spaceId) {
					let filterCondition = {
						where: {
							id: req.params.spaceId,
						},
					};
					userSpaceService.fetchSpaceDataWithMembersList(
						filterCondition,
						function (err, filteredData) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on fetchSpaceDetailsById Api`,
											err,
										),
									);
							} else if (filteredData) {
								userService.updateUser(
									{ currentSpaceId: filteredData.id },
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
														`${loggerIdentifier}on createSpace Api`,
														err,
													),
												);
										} else if (updatedRes) {
											return res
												.status(successStatusCode)
												.json(
													commonService.getSuccessResponse(
														filteredData,
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
														`${loggerIdentifier}on createSpace Api`,
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
											`${loggerIdentifier}on fetchSpaceDetailsById Api`,
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
								req.body,
								`${loggerIdentifier}on fetchSpaceDetailsById Api`,
							),
						);
				}
			} catch (e) {
				return res
					.status(serverErrors.internalServerError)
					.json(
						commonService.getErrorResponse(
							serverErrors.internalServerError,
							e,
							req.body,
							`${loggerIdentifier}on fetchSpaceDetailsById Api`,
							e,
						),
					);
			}
		},
		joinSpaceUsingInvitationLink: function (req, res) {
			try {
				if (req.body.spaceId && req.user) {
					const findCondition = {
						where: {
							spaceId: req.body.spaceId,
							userId: req.user.id,
							status: "pending",
						},
					};
					spaceMemberService.fetchData(
						findCondition,
						function (err, memberData) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req.body,
											`${loggerIdentifier}on joinSpaceUsingInvitationLink Api`,
											err,
										),
									);
							} else if (memberData) {
								memberData.status = "active";
								memberData
									.save()
									.then(() => {
										let filterCondition = {
											where: {
												id: req.body.spaceId,
											},
										};

										userSpaceService.fetchData(
											filterCondition,
											function (err, spaceData) {
												if (err) {
													return res
														.status(serverErrors.internalServerError)
														.json(
															commonService.getErrorResponse(
																serverErrors.internalServerError,
																config.errorMessages.internalServerError
																	.serverError,
																req,
																`${loggerIdentifier}on joinSpaceUsingInvitationLink Api`,
																err,
															),
														);
												} else if (spaceData) {
													let response = {
														isValidEmail: true,
														userData: req.user,
														joinedSpaceData: spaceData,
													};
													let mailData = {
														spaceName: spaceData?.name,
													};
													mailManager.sendMail(
														req?.user?.email,
														mailData,
														null,
														"joinUsingInvitation",
														function (err, successMail) {
															if (err) {
																return res
																	.status(serverErrors.internalServerError)
																	.json(
																		commonService.getErrorResponse(
																			serverErrors.internalServerError,
																			config.errorMessages.internalServerError
																				.serverError,
																			req.body,
																			`${loggerIdentifier}on joinSpaceUsingInvitationLink Api`,
																			err,
																		),
																	);
															} else if (successMail) {
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
													config.errorMessages.internalServerError.serverError,
													req,
													`${loggerIdentifier}on joinSpaceUsingInvitationLink Api`,
													err,
												),
											);
									});
							} else {
								return res
									.status(errorStatusCodes.badRequest)
									.json(
										commonService.getErrorResponse(
											errorStatusCodes.badRequest,
											config.errorMessages.badRequest.linkExpired,
											req.body,
											`${loggerIdentifier}on joinSpaceUsingInvitationLink Api`,
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
								`${loggerIdentifier}on joinSpaceUsingInvitationLink Api`,
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
							`${loggerIdentifier}on joinSpaceUsingInvitationLink Api`,
							e,
						),
					);
			}
		},
		fetchSpaceMemberList: function (req, res) {
			try {
				if (req?.user && req?.query?.spaceId) {
					let pageLimit = 10;
					let page = 0;
					if (req?.query?.pageLimit) {
						pageLimit = parseInt(req.query.pageLimit);
					}
					if (req?.query?.page) {
						page = parseInt(req.query.page);
					}
					const fetchCondition = {
						limit: pageLimit,
						offset: page * pageLimit,
						where: {
							[Op.and]: [{ spaceId: req.query.spaceId }],
						},
					};
					if (req.query.search) {
						fetchCondition.where[Op.and].push({
							[Op.or]: [
								{
									"$user.firstName$": {
										[Op.iLike]: `%${req.query.search || ""}%`,
									},
								},
								{
									"$user.lastName$": {
										[Op.iLike]: `%${req.query.search || ""}%`,
									},
								},
								{
									"$user.email$": {
										[Op.iLike]: `%${req.query.search || ""}%`,
									},
								},
							],
						});
					}
					spaceMemberService.fetchSpaceMembersList(
						fetchCondition,
						function (err, membersList) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req.body,
											`${loggerIdentifier}on fetchSpaceMemberList Api`,
											err,
										),
									);
							} else {
								const countCondition = {
									where: {
										[Op.and]: [
											{ spaceId: Number(req.query.spaceId) },
											{
												[Op.or]: [
													{
														"$user.firstName$": {
															[Op.iLike]: `%${req.query.search || ""}%`,
														},
													},
													{
														"$user.lastName$": {
															[Op.iLike]: `%${req.query.search || ""}%`,
														},
													},
													{
														"$user.email$": {
															[Op.iLike]: `%${req.query.search || ""}%`,
														},
													},
												],
											},
										],
									},
								};
								spaceMemberService.countData(
									countCondition,
									function (err, totalMembersCount) {
										if (err) {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req.body,
														`${loggerIdentifier}on fetchSpaceMemberList Api`,
														err,
													),
												);
										} else {
											let response = {
												membersList: membersList,
												totalMembersCount: totalMembersCount,
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
								`${loggerIdentifier}on fetchSpaceMemberList Api`,
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
							`${loggerIdentifier}on fetchSpaceMemberList Api`,
							e,
						),
					);
			}
		},
		acceptMultipleInvitations: function (req, res) {
			try {
				if (req.body.acceptedSpaceList?.length && req?.user) {
					async.eachSeries(
						req.body.acceptedSpaceList,
						(invitationData, callback) => {
							let promiseOperation = new Promise((resolve, reject) => {
								const findCondition = {
									where: {
										id: invitationData.id,
										status: "pending",
									},
								};
								spaceMemberService.fetchData(
									findCondition,
									function (err, memberData) {
										if (err) {
											reject(err);
										} else if (memberData) {
											memberData.status = "active";
											memberData
												.save()
												.then(() => {
													resolve(memberData);
												})
												.catch((err) => {
													reject(err);
												});
										} else {
											reject("invitation not exist");
										}
									},
								);
							});
							promiseOperation
								.then((successRes) => {
									callback(null, successRes);
								})
								.catch((error) => {
									callback(error);
								});
						},
						function (err, success) {
							if (err) {
								return res
									.status(errorStatusCodes.badRequest)
									.json(
										commonService.getErrorResponse(
											errorStatusCodes.badRequest,
											err,
											req.body,
											`${loggerIdentifier}on acceptMultipleInvitations Api`,
										),
									);
							} else {
								const mailData = {
									firstName: req.user.firstName,
									lastName: req.user.lastName,
								};
								mailManager.sendMail(
									req?.user?.["email"],
									mailData,
									null,
									"emailOnChange",
									function (err, successMail) {
										if (err) {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req.body,
														`${loggerIdentifier}on acceptMultipleInvitations Api`,
														err,
													),
												);
										} else if (successMail) {
											return res
												.status(successStatusCode)
												.json(
													commonService.getSuccessResponse(
														success,
														config.successMessages.messages.successApi,
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
								req.body,
								`${loggerIdentifier}on acceptMultipleInvitations Api`,
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
							`${loggerIdentifier}on acceptMultipleInvitations Api`,
							e,
						),
					);
			}
		},
		resendInvitation: function (req, res) {
			try {
				if (req.params.memberId && req.user) {
					let fetchCondition = {
						where: {
							id: req.params.memberId,
							status: { [Op.or]: ["pending", "revoked"] },
						},
					};
					spaceMemberService.fetchSpaceMember(
						fetchCondition,
						function (err, memberData) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req.body,
											`${loggerIdentifier}on resendInvitation Api`,
											err,
										),
									);
							} else if (memberData?.space && memberData?.user) {
								memberData.status = "pending";
								memberData
									.save()
									.then(() => {
										let authData = {
											userId: memberData.user.id,
											email: memberData.user.email,
											createdDate: new Date(),
											isTeamInvite: true,
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
																req.body,
																`${loggerIdentifier}on resendInvitation Api`,
																err,
															),
														);
												} else if (token) {
													// valid email to send invitation
													let encryptOtpDataObj = {
														isRequestFor: "inviteTeamMember",
														jwtToken: token,
														targerEmail: memberData.user.email,
														userId: memberData.user.id,
														spaceName: memberData.space.name,
														spaceId: memberData.space.id,
													};
													authentication.encryptTeamInviteData(
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
																			req.body,
																			`${loggerIdentifier}on resendInvitation Api`,
																			err,
																		),
																	);
															} else if (encryptedData) {
																let mailData = {
																	senderFirstName: memberData.user.firstName,
																	spaceName: memberData.space.name,
																	role: memberData?.role,
																};
																mailManager.sendMail(
																	memberData.user.email,
																	mailData,
																	encryptedData,
																	"inviteTeamMember",
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
																							.internalServerError.serverError,
																						req.body,
																						`${loggerIdentifier}on resendInvitation Api`,
																						err,
																					),
																				);
																		} else if (successMail) {
																			// successfully invitation mail has been sent
																			return res
																				.status(successStatusCode)
																				.json(
																					commonService.getSuccessResponse(
																						memberData,
																						config.successMessages.messages
																							.successApi,
																					),
																				);
																		} else {
																			return res
																				.status(errorStatusCodes.badRequest)
																				.json(
																					commonService.getErrorResponse(
																						errorStatusCodes.badRequest,
																						config.errorMessages.badRequest
																							.invalidRequest,
																						req.body,
																						`${loggerIdentifier}on resendInvitation Api`,
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
																			req.body,
																			`${loggerIdentifier}on resendInvitation Api`,
																			config.errorMessages.internalServerError
																				.serverError,
																		),
																	);
															}
														},
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
													config.errorMessages.internalServerError.serverError,
													req.body,
													`${loggerIdentifier}on resendInvitation Api`,
													err,
												),
											);
									});
							} else {
								return res
									.status(errorStatusCodes.badRequest)
									.json(
										commonService.getErrorResponse(
											errorStatusCodes.badRequest,
											config.errorMessages.badRequest.invalidRequest,
											req.body,
											`${loggerIdentifier}on resendInvitation Api`,
										),
									);
							}
						},
					);
				} else {
					// missing required fields
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req.body,
								`${loggerIdentifier}on resendInvitation Api`,
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
							`${loggerIdentifier}on resendInvitation Api`,
							e,
						),
					);
			}
		},
		revokeInvitation: function (req, res) {
			try {
				if (req?.params?.memberId) {
					let fetchCondition = {
						where: {
							id: req.params.memberId,
							status: "pending",
						},
					};
					spaceMemberService.updateData(
						{ status: "revoked" },
						fetchCondition,
						function (err, updatedRes) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req.body,
											`${loggerIdentifier}on resendInvitation Api`,
											err,
										),
									);
							} else if (updatedRes[0]) {
								// revoked member invitation request
								return res
									.status(successStatusCode)
									.json(
										commonService.getSuccessResponse(
											updatedRes,
											config.successMessages.messages.successApi,
										),
									);
							} else {
								// member invitation request not found or he already joined the team
								return res
									.status(errorStatusCodes.badRequest)
									.json(
										commonService.getErrorResponse(
											errorStatusCodes.badRequest,
											config.errorMessages.badRequest.invalidRequest,
											req.body,
											`${loggerIdentifier}on resendInvitation Api`,
										),
									);
							}
						},
					);
				} else {
					// missing required fields
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req.body,
								`${loggerIdentifier}on resendInvitation Api`,
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
							`${loggerIdentifier}on resendInvitation Api`,
							e,
						),
					);
			}
		},
		toggleSpaceMemberAccess: function (req, res) {
			try {
				let activeStatus =
					req.body?.activeStatus === true
						? true
						: req.body?.activeStatus === "true"
						? true
						: false;
				if (req.body?.targetMemberId && typeof activeStatus === "boolean") {
					let status = activeStatus ? "active" : "deactive";
					const filterData = {
						where: {
							id: req.body?.targetMemberId,
						},
					};
					spaceMemberService.fetchSpaceMemberAndUserDetails(
						filterData,
						function (err, spaceMemberData) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req.body,
											`${loggerIdentifier}on toggleSpaceMemberAccess Api`,
											err,
										),
									);
							} else if (
								!spaceMemberData?.isSpaceCreator &&
								spaceMemberData?.space &&
								spaceMemberData?.user
							) {
								// updated member status successfully
								spaceMemberData.status = status;
								spaceMemberData
									.save()
									.then(() => {
										let mailData = {
											firstName: spaceMemberData.user.firstName,
											spaceName: spaceMemberData.space.name,
											activeStatus: req.body?.activeStatus,
										};
										mailManager.sendMail(
											spaceMemberData?.user?.email,
											mailData,
											null,
											activeStatus
												? "toggleSpaceMemberActiveAccess"
												: "toggleSpaceMemberDeActiveAccess",
											function (err, successMail) {
												if (err) {
													return res
														.status(serverErrors.internalServerError)
														.json(
															commonService.getErrorResponse(
																serverErrors.internalServerError,
																config.errorMessages.internalServerError
																	.serverError,
																req.body,
																`${loggerIdentifier}on toggleSpaceMemberAccess Api`,
																err,
															),
														);
												} else if (successMail) {
													return res
														.status(successStatusCode)
														.json(
															commonService.getSuccessResponse(
																spaceMemberData,
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
													config.errorMessages.internalServerError.serverError,
													req,
													`${loggerIdentifier}on toggleSpaceMemberAccess update Api`,
													err,
												),
											);
									});
							} else {
								// can't update member status for owner
								return res
									.status(errorStatusCodes.badRequest)
									.json(
										commonService.getErrorResponse(
											errorStatusCodes.badRequest,
											config.errorMessages.badRequest.invalidRequest,
											req.body,
											`${loggerIdentifier}on toggleSpaceMemberAccess Api`,
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
								`${loggerIdentifier}on toggleSpaceMemberAccess Api`,
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
							`${loggerIdentifier}on toggleSpaceMemberAccess Api`,
							e,
						),
					);
			}
		},
		changeMemberRole: function (req, res) {
			try {
				if (req.body?.targetMemberId && req.body?.role) {
					const filterData = {
						where: {
							id: req.body?.targetMemberId,
						},
					};
					spaceMemberService.fetchSpaceMemberAndUserDetails(
						filterData,
						function (err, spaceMemberData) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req.body,
											`${loggerIdentifier}on toggleSpaceMemberAccess Api`,
											err,
										),
									);
							} else if (
								!spaceMemberData?.isSpaceCreator &&
								spaceMemberData?.space &&
								spaceMemberData?.user
							) {
								// updated member status successfully
								spaceMemberData.role = req.body?.role;
								spaceMemberData
									.save()
									.then(() => {
										let mailData = {
											firstName: spaceMemberData.user.firstName,
											spaceName: spaceMemberData.space.name,
											role: req.body?.role,
										};
										mailManager.sendMail(
											spaceMemberData?.user?.email,
											mailData,
											null,
											"changeSpaceMemberRole",
											function (err, successMail) {
												if (err) {
													return res
														.status(serverErrors.internalServerError)
														.json(
															commonService.getErrorResponse(
																serverErrors.internalServerError,
																config.errorMessages.internalServerError
																	.serverError,
																req.body,
																`${loggerIdentifier}on toggleSpaceMemberAccess Api`,
																err,
															),
														);
												} else if (successMail) {
													return res
														.status(successStatusCode)
														.json(
															commonService.getSuccessResponse(
																spaceMemberData,
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
													config.errorMessages.internalServerError.serverError,
													req,
													`${loggerIdentifier}on toggleSpaceMemberAccess update Api`,
													err,
												),
											);
									});
							} else {
								// can't update member status for owner
								return res
									.status(errorStatusCodes.badRequest)
									.json(
										commonService.getErrorResponse(
											errorStatusCodes.badRequest,
											config.errorMessages.badRequest.invalidRequest,
											req.body,
											`${loggerIdentifier}on toggleSpaceMemberAccess Api`,
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
								`${loggerIdentifier}on toggleSpaceMemberAccess Api`,
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
							`${loggerIdentifier}on toggleSpaceMemberAccess Api`,
							e,
						),
					);
			}
		},
	};
};
