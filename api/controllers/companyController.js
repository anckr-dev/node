const { Op } = require("sequelize");

module.exports = (
	config,
	commonService,
	companyService,
	contactService,
	async,
) => {
	// global declarations
	const successStatusCode = config.statusCode.success.ok;
	const errorStatusCodes = config.statusCode.clientError;
	const serverErrors = config.statusCode.serverError;
	const loggerIdentifier = config.loggerIdentifiers.companyControllers;
	return {
		createCompany: function (req, res) {
			try {
				if (
					req.user &&
					req.body.name &&
					req.body.address &&
					req.body.city &&
					req.body.state &&
					req.body.postalCode &&
					req.body.country &&
					req.memberData.spaceId
				) {
					let createObject = {
						name: req.body.name,
						address: req.body.address,
						city: req.body.city,
						state: req.body.state,
						postalCode: req.body.postalCode,
						country: req.body.country,
						creatorUserId: req.user.id,
						spaceId: req.memberData.spaceId,
					};
					if (req.body.phoneNumber) {
						createObject.phoneNumber = req.body.phoneNumber;
					}
					if (req.body.website) {
						createObject.website = req.body.website;
					}
					companyService.createData(createObject, function (err, company) {
						if (err) {
							return res
								.status(serverErrors.internalServerError)
								.json(
									commonService.getErrorResponse(
										serverErrors.internalServerError,
										config.errorMessages.internalServerError.serverError,
										req,
										`${loggerIdentifier}on createCompany Api`,
										err,
									),
								);
						} else if (company) {
							return res
								.status(successStatusCode)
								.json(
									commonService.getSuccessResponse(
										company,
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
										`${loggerIdentifier}on createCompany Api`,
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
								`${loggerIdentifier}on createCompany Api`,
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
							`${loggerIdentifier}on createCompany Api`,
							e,
						),
					);
			}
		},
		updateCompany: function (req, res) {
			try {
				if (req.user && req.body.companyId) {
					let updateObject = {};
					if (req.body.companyName) {
						updateObject.name = req.body.companyName;
					}
					if (req.body.city) {
						updateObject.city = req.body.city;
					}
					if (req.body.state) {
						updateObject.state = req.body.state;
					}
					if (req.body.postalCode) {
						updateObject.postalCode = req.body.postalCode;
					}
					if (req.body.phoneNumber) {
						updateObject.phoneNumber = req.body.phoneNumber;
					}
					if (req.body.website) {
						updateObject.website = req.body.website;
					}
					if (req.body.country) {
						updateObject.country = req.body.country;
					}
					if (req.body.address) {
						updateObject.address = req.body.address;
					}
					let findCondition = {
						where: {
							id: req.body.companyId,
						},
					};
					companyService.updateData(
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
											`${loggerIdentifier}on updateCompany Api`,
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
											`${loggerIdentifier}on updateCompany Api`,
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
								`${loggerIdentifier}on updateCompany Api`,
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
							`${loggerIdentifier}on updateCompany Api`,
							e,
						),
					);
			}
		},
		fetchCompanyList: function (req, res) {
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
					const fetchCondition = {
						limit: pageLimit,
						offset: page * pageLimit,
						where: {
							[Op.and]: [{ spaceId: req.memberData.spaceId }],
						},
					};
					if (req.query.search) {
						fetchCondition.where[Op.and].push({
							[Op.or]: [
								{
									name: {
										[Op.iLike]: `%${req.query.search}%`,
									},
								},
								{
									phoneNumber: {
										[Op.like]: `%${req.query.search}%`,
									},
								},
								{
									address: {
										[Op.iLike]: `%${req.query.search}%`,
									},
								},
								{
									website: {
										[Op.iLike]: `%${req.query.search}%`,
									},
								},
							],
						});
					}

					companyService.fetchData(
						fetchCondition,
						function (err, fetchedCompanyList) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on fetchCompanyList Api`,
											err,
										),
									);
							} else {
								const countCondition = {
									where: { spaceId: req.memberData.spaceId },
								};
								companyService.countData(
									countCondition,
									function (err, totalCompanyCount) {
										if (err) {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req.body,
														`${loggerIdentifier}on fetchCompanyList Api`,
														err,
													),
												);
										} else {
											let response = {
												fetchedCompanyList: fetchedCompanyList,
												totalCompanyCount: totalCompanyCount,
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
								`${loggerIdentifier}on fetchCompanyList Api`,
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
							`${loggerIdentifier}on fetchCompanyList Api`,
							e,
						),
					);
			}
		},
		removeCompanyData: function (req, res) {
			try {
				if (req.user?.currentOrganizationId && req.params.companyId) {
					let findCondition = {
						where: {
							id: req.body.companyId,
						},
					};
					companyService.deleteData(
						findCondition,
						function (err, deleteCompany) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on removeCompanyData Api`,
											err,
										),
									);
							} else if (deleteCompany) {
								let findContact = {
									where: {
										companyId: req.body.companyId,
									},
								};
								contactService.deleteData(
									findContact,
									function (err, deleteContact) {
										if (err) {
											return res
												.status(serverErrors.internalServerError)
												.json(
													commonService.getErrorResponse(
														serverErrors.internalServerError,
														config.errorMessages.internalServerError
															.serverError,
														req,
														`${loggerIdentifier}on removeCompanyData Api`,
														err,
													),
												);
										} else {
											return res
												.status(successStatusCode)
												.json(
													commonService.getSuccessResponse(
														deleteContact,
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
								`${loggerIdentifier}on removeCompanyData Api`,
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
							`${loggerIdentifier}on removeCompanyData Api`,
							e,
						),
					);
			}
		},
		getCompanyDetails: function (req, res) {
			try {
				if (req.user && req.params.companyId) {
					let findCondition = {
						where: {
							id: req.params.companyId,
						},
					};
					companyService.fetchDetails(
						findCondition,
						function (err, getsCompanyDetails) {
							if (err) {
								return res
									.status(serverErrors.internalServerError)
									.json(
										commonService.getErrorResponse(
											serverErrors.internalServerError,
											config.errorMessages.internalServerError.serverError,
											req,
											`${loggerIdentifier}on getCompanyDetails Api`,
											err,
										),
									);
							} else {
								return res
									.status(successStatusCode)
									.json(
										commonService.getSuccessResponse(
											getsCompanyDetails,
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
								`${loggerIdentifier}on getCompanyDetails Api`,
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
							`${loggerIdentifier}on getCompanyDetails Api`,
							e,
						),
					);
			}
		},
		associateMultipleContacts: function (req, res) {
			try {
				if (
					req.user &&
					req.body?.arrayOfAssociations?.length &&
					req.body?.companyId
				) {
					async.eachSeries(
						req.body.arrayOfAssociations,
						(associatedContactId, callback) => {
							let promiseOperation = new Promise((resolve, reject) => {
								let findCondition = {
									where: {
										id: associatedContactId,
									},
								};
								let updateData = {
									companyId: req.body.companyId,
								};
								contactService.updateData(
									updateData,
									findCondition,
									function (err, updateRes) {
										if (err) {
											reject(err);
										} else if (updateRes) {
											resolve(updateRes);
										} else {
											reject("no data found for update");
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
											`${loggerIdentifier}on associateMultipleContacts Api`,
										),
									);
							} else {
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
				} else {
					return res
						.status(errorStatusCodes.badRequest)
						.json(
							commonService.getErrorResponse(
								errorStatusCodes.badRequest,
								config.errorMessages.badRequest.missingRequiredFields,
								req.body,
								`${loggerIdentifier}on associateMultipleContacts Api`,
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
							`${loggerIdentifier}on associateMultipleContacts Api`,
							e,
						),
					);
			}
		},
	};
};
