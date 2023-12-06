module.exports = (databaseModels, logger, config) => {
	// define abilities
	const { createMongoAbility, AbilityBuilder } = require("@casl/ability");
	const spaceMemberModel = databaseModels["space_member"];
	const defineAbilities = (member) => {
		const { can, build } = new AbilityBuilder(createMongoAbility);
		if (member.role === "admin" && member.status === "active") {
			can("manage", "all");
		} else {
			can("read", config.spaceActions);
		}
		return build();
	};
	const caslOperations = {
		POST: "create",
		PUT: "update",
		DELETE: "delete",
		GET: "read",
	};

	return {
		checkSpaceInvitation: function (req, res, next) {
			try {
				if (req?.headers["spacememberid"] || req?.headers["spaceMemberId"]) {
					let spaceMemberId =
						req?.headers["spacememberid"] || req?.headers["spaceMemberId"];
					spaceMemberModel
						.findOne({ where: { id: spaceMemberId } })
						.then((successData) => {
							if (successData?.role) {
								req.memberData = successData;
								const ability = defineAbilities(successData);
								if (
									ability.can(caslOperations[req.method], "spaceInvitation")
								) {
									next();
								} else {
									// no permission
									return res.status(401).json({
										message: config.errorMessages.badRequest.invalidPermission,
										statusCode: config.statusCode.clientError.unAuthorized,
									});
								}
							} else {
								// no permissions
								return res.status(401).json({
									message: config.errorMessages.badRequest.invalidPermission,
									statusCode: config.statusCode.clientError.unAuthorized,
								});
							}
						})
						.catch((err) => {
							logger.error("error occurred on CASL permission check", err);
							return res.status(401).json({
								message: config.errorMessages.badRequest.invalidPermission,
								statusCode: config.statusCode.clientError.unAuthorized,
							});
						});
				} else {
					// no permissions
					return res.status(401).json({
						message: config.errorMessages.badRequest.invalidPermission,
						statusCode: config.statusCode.clientError.unAuthorized,
					});
				}
			} catch (e) {
				logger.error("error occurred on CASL permission check", e);
				return res.status(401).json({
					message: config.errorMessages.badRequest.invalidPermission,
					statusCode: config.statusCode.clientError.unAuthorized,
				});
			}
		},
		checkCompanyAccess: function (req, res, next) {
			try {
				if (req?.headers["spacememberid"] || req?.headers["spaceMemberId"]) {
					let spaceMemberId =
						req?.headers["spacememberid"] || req?.headers["spaceMemberId"];
					spaceMemberModel
						.findOne({ where: { id: spaceMemberId } })
						.then((successData) => {
							if (successData?.role) {
								req.memberData = successData;
								const ability = defineAbilities(successData);
								if (ability.can(caslOperations[req.method], "companyAccess")) {
									next();
								} else {
									// no permission
									return res.status(401).json({
										message: config.errorMessages.badRequest.invalidPermission,
										statusCode: config.statusCode.clientError.unAuthorized,
									});
								}
							} else {
								// no permissions
								return res.status(401).json({
									message: config.errorMessages.badRequest.invalidPermission,
									statusCode: config.statusCode.clientError.unAuthorized,
								});
							}
						})
						.catch((err) => {
							logger.error("error occurred on CASL permission check", err);
							return res.status(401).json({
								message: config.errorMessages.badRequest.invalidPermission,
								statusCode: config.statusCode.clientError.unAuthorized,
							});
						});
				} else {
					// no permissions
					return res.status(401).json({
						message: config.errorMessages.badRequest.invalidPermission,
						statusCode: config.statusCode.clientError.unAuthorized,
					});
				}
			} catch (e) {
				logger.error("error occurred on CASL permission check", e);
				return res.status(401).json({
					message: config.errorMessages.badRequest.invalidPermission,
					statusCode: config.statusCode.clientError.unAuthorized,
				});
			}
		},
	};
};
