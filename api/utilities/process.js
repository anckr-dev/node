module.exports = async (
	config,
	logger,
	database,
	Sequelize,
	authentication,
	databaseModels,
) => {
	// package declarations
	const bcrypt = require("bcrypt");
	// const nodemailer = require('nodemailer'); //  moved to send grid
	const sgMail = require("@sendgrid/mail");
	const randomatic = require("randomatic");
	const { DateTime } = require("luxon");
	const ejs = require("ejs");
	const passwordValidator = require("password-validator");
	const S3_client = require("aws-sdk/clients/s3");
	const async = require("async");
	const crypto = require("crypto");

	// models declarations
	const userModel = databaseModels["user"];
	const otpManager = databaseModels["otp_manager"];
	const companyModel = databaseModels["company"];
	const contactModel = databaseModels["contact"];
	const userSpaceModel = databaseModels["user_space"];
	const spaceMemberModel = databaseModels["space_member"];

	// utilities declarations
	const mailManager = require("./mailManager")(sgMail, config, ejs);
	const luxon = require("./luxonDateUtility")(DateTime);
	const s3 = require("./s3")(S3_client);
	const cryptoUtility = require("./crypto")(crypto, config);

	// services declarations
	const commonService = require("../services/commonService")(
		config,
		logger,
		passwordValidator,
	);
	const userService = require("../services/userService")(
		userModel,
		spaceMemberModel,
		userSpaceModel,
	);
	const otpService = require("../services/otpService")(otpManager);
	const companyService = require("../services/companyService")(
		companyModel,
		contactModel,
	);
	const contactService = require("../services/contactService")(contactModel);
	const userSpaceService = require("../services/userSpaceService")(
		userSpaceModel,
		spaceMemberModel,
	);
	const spaceMemberService = require("../services/spaceMemberService")(
		spaceMemberModel,
		userModel,
		userSpaceModel,
	);

	// controllers declarations
	const userControllers = require("../controllers/userContoller")(
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
	);
	const companyController = require("../controllers/companyController")(
		config,
		commonService,
		companyService,
		contactService,
		async,
	);
	const contactController = require("../controllers/contactController")(
		config,
		commonService,
		companyService,
		contactService,
	);
	const teamController = require("../controllers/teamController")(
		async,
		config,
		commonService,
		userService,
		mailManager,
		authentication,
		userSpaceService,
		spaceMemberService,
		cryptoUtility,
	);

	return {
		validateEmail: async (req, res) => {
			userControllers.validateEmail(req, res);
		},
		verifyEmailCode: async (req, res) => {
			userControllers.verifyEmailCode(req, res);
		},
		tryWithDifferentMail: async (req, res) => {
			userControllers.tryWithDifferentEmail(req, res);
		},
		updateUserOnbording: async (req, res) => {
			userControllers.updateUserOnbording(req, res);
		},
		forgotPasswordRequest: async (req, res) => {
			userControllers.forgotPasswordRequest(req, res);
		},
		updatePassword: async (req, res) => {
			userControllers.updatePassword(req, res);
		},
		login: async (req, res) => {
			userControllers.login(req, res);
		},
		loginWithMagicLinkRequest: async (req, res) => {
			userControllers.loginWithMagicLinkRequest(req, res);
		},
		signInUsingMagicLink: async (req, res) => {
			userControllers.signInUsingMagicLink(req, res);
		},
		updateUserDetails: async (req, res) => {
			userControllers.updateUserDetails(req, res);
		},
		uploadUserProfileImage: async (req, res) => {
			userControllers.uploadUserProfileImage(req, res);
		},
		changePassword: async (req, res) => {
			userControllers.changePassword(req, res);
		},
		getImage: async (req, res) => {
			userControllers.fetchUserProfileImage(req, res);
		},
		changeEmailRequest: async (req, res) => {
			userControllers.changeEmailRequest(req, res);
		},
		confirmChangeEmailRequest: async (req, res) => {
			userControllers.confirmChangeEmail(req, res);
		},
		createCompany: async (req, res) => {
			companyController.createCompany(req, res);
		},
		updateCompany: async (req, res) => {
			companyController.updateCompany(req, res);
		},
		fetchCompanyList: async (req, res) => {
			companyController.fetchCompanyList(req, res);
		},
		removeCompany: async (req, res) => {
			companyController.removeCompanyData(req, res);
		},
		createContact: async (req, res) => {
			contactController.createContact(req, res);
		},
		updateContact: async (req, res) => {
			contactController.updateContact(req, res);
		},
		fetchContactList: async (req, res) => {
			contactController.fetchContactList(req, res);
		},
		removeContact: async (req, res) => {
			contactController.removeContactData(req, res);
		},
		refreshMagicLink: async (req, res) => {
			userControllers.refreshMagicLink(req, res);
		},
		updateOnboardingForCreateSpace: async (req, res) => {
			userControllers.updateOnboardingForCreateSpace(req, res);
		},
		createSpace: async (req, res) => {
			teamController.createSpace(req, res);
		},
		fetchSpaceDetailsById: async (req, res) => {
			teamController.fetchSpaceDetailsById(req, res);
		},
		inviteTeamMember: async (req, res) => {
			teamController.inviteTeamMember(req, res);
		},
		joinSpaceUsingInvitationLink: async (req, res) => {
			teamController.joinSpaceUsingInvitationLink(req, res);
		},
		fetchSpaceMemberList: async (req, res) => {
			teamController.fetchSpaceMemberList(req, res);
		},
		acceptMultipleInvitations: async (req, res) => {
			teamController.acceptMultipleInvitations(req, res);
		},
		validateEmailFromInvitation: async (req, res) => {
			userControllers.validateEmailFromInvitation(req, res);
		},
		revokeSpaceInvitation: async (req, res) => {
			teamController.revokeInvitation(req, res);
		},
		resendInvitation: async (req, res) => {
			teamController.resendInvitation(req, res);
		},
		toggleSpaceMemberAccess: async (req, res) => {
			teamController.toggleSpaceMemberAccess(req, res);
		},
		changeSpaceMemberRole: async (req, res) => {
			teamController.changeMemberRole(req, res);
		},
		refreshDashboard: async (req, res) => {
			userControllers.refreshDashboard(req, res);
		},
		getCompanyDetails: async (req, res) => {
			companyController.getCompanyDetails(req, res);
		},
		removeAssociationWithCompany: async (req, res) => {
			contactController.removeAssociationWithCompany(req, res);
		},
		fetchNonAssociatedContactList: async (req, res) => {
			contactController.fetchNonAssociatedContactList(req, res);
		},
		associateMultipleContacts: async (req, res) => {
			companyController.associateMultipleContacts(req, res);
		},
	};
};
