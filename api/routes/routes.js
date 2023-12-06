module.exports = async (
	router,
	config,
	logger,
	database,
	Sequelize,
	passport,
	databaseModels,
) => {
	// package declarations
	const jwt = require("jsonwebtoken");
	// const fileUpload = require('express-fileupload');
	// const multipartMiddleware = fileUpload();            @depricated
	const passportJWT = require("passport-jwt");
	const multer = require("multer");
	const storage = multer.memoryStorage();
	const upload = multer({
		storage,
		// limits: {fieldSize: }      @ need to discuss
	});
	// global declarations
	const routes = config.routes;
	require("../utilities/passport")(config, database, passport, passportJWT);
	const authentication = require("../utilities/authentication")(
		config,
		logger,
		database,
		jwt,
	);
	const caslPermission = require("../utilities/caslPermission")(
		databaseModels,
		logger,
		config,
	);
	const process = await require("../utilities/process")(
		config,
		logger,
		database,
		Sequelize,
		authentication,
		databaseModels,
	);

	// routes
	router.post(routes.validateEmail, process.validateEmail);
	router.post(
		routes.verifyEmailCode,
		authentication.verifyOtpAuthToken,
		process.verifyEmailCode,
	);
	router.post(routes.tryWithDifferentMail, process.tryWithDifferentMail);
	router.post(
		routes.updateUserOnbording,
		passport.authenticate("jwt", { session: false }),
		process.updateUserOnbording,
	);
	router.post(routes.forgotPasswordRequest, process.forgotPasswordRequest);
	router.post(
		routes.updatePassword,
		authentication.verifyOtpAuthToken,
		process.updatePassword,
	);
	router.post(routes.login, process.login);
	router.post(
		routes.loginWithMagicLinkRequest,
		process.loginWithMagicLinkRequest,
	);
	router.post(
		routes.signInUsingMagicLink,
		authentication.verifyOtpAuthToken,
		process.signInUsingMagicLink,
	);
	router.post(
		routes.updateOnboardingForCreateSpace,
		passport.authenticate("jwt", { session: false }),
		process.updateOnboardingForCreateSpace,
	);
	router.post(
		routes.validateEmailFromInvitation,
		process.validateEmailFromInvitation,
	);

	// user profile
	router.put(
		routes.updateUserDetails,
		passport.authenticate("jwt", { session: false }),
		process.updateUserDetails,
	);
	router.post(
		routes.uploadUserProfileImage,
		upload.single("image"),
		passport.authenticate("jwt", { session: false }),
		process.uploadUserProfileImage,
	);
	router.post(
		routes.changePassword,
		passport.authenticate("jwt", { session: false }),
		process.changePassword,
	);
	router.get(routes.getImage, process.getImage);
	router.post(
		routes.changeEmailRequest,
		passport.authenticate("jwt", { session: false }),
		process.changeEmailRequest,
	);
	router.post(
		routes.confirmChangeEmailRequest,
		authentication.verifyOtpAuthToken,
		process.confirmChangeEmailRequest,
	);

	// Company routes
	router.post(
		routes.createCompany,
		passport.authenticate("jwt", { session: false }),
		caslPermission.checkCompanyAccess,
		process.createCompany,
	);
	router.put(
		routes.updateCompany,
		passport.authenticate("jwt", { session: false }),
		process.updateCompany,
	);
	router.get(
		routes.fetchCompanyList,
		passport.authenticate("jwt", { session: false }),
		caslPermission.checkCompanyAccess,
		process.fetchCompanyList,
	);
	router.delete(
		routes.removeCompany,
		passport.authenticate("jwt", { session: false }),
		process.removeCompany,
	);
	router.get(
		routes.getCompanyDetails,
		passport.authenticate("jwt", { session: false }),
		caslPermission.checkCompanyAccess,
		process.getCompanyDetails,
	);
	// contact routes
	router.post(
		routes.createContact,
		passport.authenticate("jwt", { session: false }),
		caslPermission.checkCompanyAccess,
		process.createContact,
	);
	router.put(
		routes.updateContact,
		passport.authenticate("jwt", { session: false }),
		caslPermission.checkCompanyAccess,
		process.updateContact,
	);
	router.get(
		routes.fetchContactList,
		passport.authenticate("jwt", { session: false }),
		caslPermission.checkCompanyAccess,
		process.fetchContactList,
	);
	router.delete(
		routes.removeContact,
		passport.authenticate("jwt", { session: false }),
		process.removeContact,
	);
	router.put(
		routes.removeAssociationWithCompany,
		passport.authenticate("jwt", { session: false }),
		caslPermission.checkCompanyAccess,
		process.removeAssociationWithCompany,
	);
	router.get(
		routes.fetchNonAssociatedContactList,
		passport.authenticate("jwt", { session: false }),
		caslPermission.checkCompanyAccess,
		process.fetchNonAssociatedContactList,
	);
	router.put(
		routes.associateMultipleContacts,
		passport.authenticate("jwt", { session: false }),
		caslPermission.checkCompanyAccess,
		process.associateMultipleContacts,
	);

	// refresh magic link request
	router.post(routes.refreshMagicLink, process.refreshMagicLink);

	// space routes
	router.post(
		routes.createSpace,
		passport.authenticate("jwt", { session: false }),
		process.createSpace,
	);
	router.get(
		routes.fetchSpaceDetailsById,
		passport.authenticate("jwt", { session: false }),
		process.fetchSpaceDetailsById,
	);
	router.get(
		routes.fetchSpaceMemberList,
		passport.authenticate("jwt", { session: false }),
		process.fetchSpaceMemberList,
	);

	// space member permission routes
	router.put(
		routes.toggleSpaceMemberAccess,
		passport.authenticate("jwt", { session: false }),
		caslPermission.checkSpaceInvitation,
		process.toggleSpaceMemberAccess,
	);
	router.put(
		routes.changeSpaceMemberRole,
		passport.authenticate("jwt", { session: false }),
		caslPermission.checkSpaceInvitation,
		process.changeSpaceMemberRole,
	);

	// space invitation routes
	router.post(
		routes.inviteTeamMember,
		caslPermission.checkSpaceInvitation,
		passport.authenticate("jwt", { session: false }),
		process.inviteTeamMember,
	);
	router.post(
		routes.joinSpaceUsingInvitationLink,
		authentication.verifyOtpAuthToken,
		process.joinSpaceUsingInvitationLink,
	);
	router.put(
		routes.revokeSpaceInvitation,
		passport.authenticate("jwt", { session: false }),
		process.revokeSpaceInvitation,
	);
	router.put(
		routes.resendInvitation,
		passport.authenticate("jwt", { session: false }),
		caslPermission.checkSpaceInvitation,
		process.resendInvitation,
	);
	router.post(
		routes.acceptMultipleInvitations,
		passport.authenticate("jwt", { session: false }),
		process.acceptMultipleInvitations,
	);

	// refresh dashboard
	router.get(
		routes.refreshDashboard,
		passport.authenticate("jwt", { session: false }),
		process.refreshDashboard,
	);
};
