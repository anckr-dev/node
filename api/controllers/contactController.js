const { Op } = require("sequelize");

module.exports = (config, commonService, companyService, contactService) => {
	// global declarations
	const successStatusCode = config.statusCode.success.ok;
	const errorStatusCodes = config.statusCode.clientError;
	const serverErrors = config.statusCode.serverError;
	const loggerIdentifier = config.loggerIdentifiers.contactController;
	return {
		createContact: function (req, res) {
			try {
				if (
					req.user &&
					req.body.firstName &&
					req.body.lastName &&
					req.memberData &&
					req.body.phoneNumber &&
					req.body.email
				) {
					let createObject = {
						firstName: req.body.firstName,
						lastName: req.body.lastName,
						email: req.body.email,
						phoneNumber: req.body.phoneNumber,
						creatorUserId: req.user.id,
						spaceId: req.memberData.spaceId,
						jobTitle: req.body.jobTittle,
					};
					if (req.body.companyId) {
						createObject.companyId = req.body.companyId;
					}
					contactService.createData(createObject, function (err, contact) {
						if (err) {
							return res
								.status(serverErrors.internalServerError)
								.json(
									commonService.getErrorResponse(
										serverErrors.internalServerError,
										config.errorMessages.internalServerError.serverError,
										req,
										`${loggerIdentifier}on createContact Api`,
										err,
									),
								);
						} else if (contact) {
							return res
								.status(successStatusCode)
								.json(
									commonService.getSuccessResponse(
										contact,
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
										`${loggerIdentifier}on createContact Api`,
										err,
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
								config.errorMessages.badRequest.missingRequiredFields,
								req.body,
								`${loggerIdentifier}on createContact Api`,
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
							`${loggerIdentifier}on createContact Api`,
							e,
						),
					);
			}
		},
		updateContact: function (req, res) {
			try {
				if (req.user && req.body.contactId) {
					let updateObject = {};
					if (req.body.firstName) {
						updateObject.firstName = req.body.firstName;
					}
					if (req.body.lastName) {
						updateObject.lastName = req.body.lastName;
					}
					if (req.body.email) {
						updateObject.email = req.body.email;
					}
					if (req.body.phoneNumber) {
						updateObject.phoneNumber = req.body.phoneNumber;
					}
					if (req.body.jobTitle) {
						updateObject.jobTitle = req.body.jobTitle;
					}
					if (req.body.companyId) {
						updateObject.companyId = req.body.companyId;
					}
					let findCondition = {
						where: {
							id: req.body.contactId,
						},
					};
					contactService.updateData(
						updateObject,
						findCondition,
						function (err, updateRes) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on updateContact Api`,
											err,
										),
									);
							} else if (updateRes) {
								return res
									.status(successStatusCode)
									.json(
										commonService.getSuccessResponse(
											updateObject,
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
											`${loggerIdentifier}on updateContact Api`,
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
								`${loggerIdentifier}on updateContact Api`,
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
							`${loggerIdentifier}on updateContact Api`,
							e,
						),
					);
			}
		},
		fetchContactList: function (req, res) {
			try {
				if (req.user && req.memberData?.spaceId) {
					let pageLimit = 10;
					let page = 0;
					if (req?.query?.pageLimit) {
						pageLimit = parseInt(req.query.pageLimit);
					}
					if (req?.query?.page) {
						page = parseInt(req.query.page);
					}
					const findCondition = {
						limit: pageLimit,
						offset: page * pageLimit,
						where: {
							[Op.and]: [{ spaceId: req.memberData.spaceId }],
						},
					};
					if (req.query.search) {
						findCondition.where[Op.and].push({
							[Op.or]: [
								{
									firstName: {
										[Op.iLike]: `%${req.query.search}%`,
									},
								},
								{
									lastName: {
										[Op.iLike]: `%${req.query.search}%`,
									},
								},
								{
									email: {
										[Op.iLike]: `%${req.query.search}%`,
									},
								},
								{
									phoneNumber: {
										[Op.iLike]: `%${req.query.search}%`,
									},
								},
								{
									jobTitle: {
										[Op.iLike]: `%${req.query.search}%`,
									},
								},
							],
						});
					}
					contactService.fetchData(
						findCondition,
						function (err, fetchedContactList) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on fetchContactsList Api`,
											err,
										),
									);
							} else {
								const countCondition = {
									where: { spaceId: req.memberData.spaceId },
								};
								contactService.countData(
									countCondition,
									function (err, totalContactCount) {
										if (err) {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req.body,
														`${loggerIdentifier}on fetchContactsList Api`,
														err,
													),
												);
										} else {
											let response = {
												fetchedContactList: fetchedContactList,
												totalContactCount: totalContactCount,
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
								`${loggerIdentifier}on fetchContactsList Api`,
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
							`${loggerIdentifier}on fetchContactsList Api`,
							e,
						),
					);
			}
		},
		removeContactData: function (req, res) {
			try {
				if (req.user?.currentOrganizationId && req.params.contactId) {
					let findContact = {
						where: {
							id: req.params.contactId,
						},
					};
					contactService.deleteData(findContact, function (err, deleteData) {
						if (err) {
							return res
								.status(serverErrors.internalServerError)
								.json(
									commonService.getErrorResponse(
										serverErrors.internalServerError,
										config.errorMessages.internalServerError.serverError,
										req,
										`${loggerIdentifier}on removeContactData Api`,
										err,
									),
								);
						} else {
							return res
								.status(successStatusCode)
								.json(
									commonService.getSuccessResponse(
										deleteData,
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
								config.errorMessages.badRequest.missingRequiredFields,
								req.body,
								`${loggerIdentifier}on removeContactData Api`,
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
							`${loggerIdentifier}on removeContactData Api`,
							e,
						),
					);
			}
		},
		removeAssociationWithCompany: function (req, res) {
			try {
				if (req.user && req.params.contactId) {
					let findCondition = {
						where: {
							id: req.params.contactId,
						},
					};
					let updateData = {
						companyId: null,
					};
					contactService.updateData(
						updateData,
						findCondition,
						function (err, updateRes) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on removeAssociationWithCompany Api`,
											err,
										),
									);
							} else if (updateRes) {
								return res
									.status(successStatusCode)
									.json(
										commonService.getSuccessResponse(
											updateRes,
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
											`${loggerIdentifier}on removeAssociationWithCompany Api`,
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
								`${loggerIdentifier}on removeAssociationWithCompany Api`,
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
							`${loggerIdentifier}on removeAssociationWithCompany Api`,
							e,
						),
					);
			}
		},
		fetchNonAssociatedContactList: function (req, res) {
			try {
				if (req.user && req.memberData?.spaceId) {
					const findCondition = {
						where: {
							spaceId: req.memberData.spaceId,
							companyId: null,
						},
					};
					contactService.fetchData(
						findCondition,
						function (err, fetchedContactList) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on fetchNonAssociatedContactList Api`,
											err,
										),
									);
							} else {
								contactService.countData(
									findCondition,
									function (err, totalContactCount) {
										if (err) {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req.body,
														`${loggerIdentifier}on fetchNonAssociatedContactList Api`,
														err,
													),
												);
										} else {
											let response = {
												fetchedContactList: fetchedContactList,
												totalContactCount: totalContactCount,
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
								`${loggerIdentifier}on fetchNonAssociatedContactList Api`,
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
							`${loggerIdentifier}on fetchNonAssociatedContactList Api`,
							e,
						),
					);
			}
		},
	};
};
