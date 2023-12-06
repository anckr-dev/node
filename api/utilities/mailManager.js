module.exports = (sgMail, config, ejs) => {
	return {
		sendMail: (targetMail, mailData, redirectLink, isRequestFor, callback) => {
			try {
				sgMail.setApiKey(process.env.SENDGRID_API_KEY);

				let path;
				let data;
				if (isRequestFor === "otpVerification") {
					path = "/views/otpVerification.ejs";
					data = {
						link: config.magicLinkRedirectLink + redirectLink,
						otp: mailData.otpCode,
						firstName: mailData.firstName,
						lastName: mailData.lastName,
					};
				} else if (isRequestFor === "tryWithDifferentMail") {
					path = "/views/otpVerification.ejs";
					data = {
						link: config.magicLinkRedirectLink + redirectLink,
						otp: mailData,
					};
				} else if (isRequestFor === "forgotPassword") {
					path = "/views/resetPassword.ejs";
					data = {
						link: config.magicLinkRedirectLink + redirectLink,
						firstName: mailData.firstName,
						lastName: mailData.lastName,
					};
				} else if (isRequestFor === "loginWithMagicLink") {
					path = "/views/autoSignIn.ejs";
					data = {
						link: config.magicLinkRedirectLink + redirectLink,
						firstName: mailData.firstName,
						lastName: mailData.lastName,
					};
				} else if (isRequestFor === "changeEmailRequest") {
					path = "/views/changeEmail.ejs";
					data = {
						link: config.magicLinkRedirectLink + redirectLink,
						firstName: mailData,
						email: targetMail,
					};
				} else if (isRequestFor === "inviteTeamMember") {
					path = "/views/inviteTeamMember.ejs";
					data = {
						link: config.magicLinkRedirectLink + redirectLink,
						firstName: mailData.senderFitargetMailrstName,
						spaceName: mailData.spaceName,
						role: mailData.role,
					};
				} else if (isRequestFor === "inviteUserToSpace") {
					path = "/views/inviteUserToSpace.ejs";
					data = {
						link: config.frontUrl,
						userFirstName: mailData.userFirstName,
						spaceName: mailData.spaceName,
						role: mailData.role,
						inviterName: mailData.inviterName,
					};
				} else if (isRequestFor === "joinUsingInvitation") {
					path = "/views/joinUsingInvitation.ejs";
					data = {
						link: config.frontUrl,
						spaceName: mailData.spaceName,
					};
				} else if (isRequestFor === "toggleSpaceMemberActiveAccess") {
					path = "/views/accountActivate.ejs";
					data = {
						firstName: mailData.firstName,
						spaceName: mailData.spaceName,
						activeStatus: mailData.activeStatus,
						link: config.frontUrl,
					};
				} else if (isRequestFor === "toggleSpaceMemberDeActiveAccess") {
					path = "/views/accountDeactivate.ejs";
					data = {
						firstName: mailData.firstName,
						spaceName: mailData.spaceName,
						activeStatus: mailData.activeStatus,
					};
				} else if (isRequestFor === "changeSpaceMemberRole") {
					path = "/views/changeSpaceMemberRole.ejs";
					data = {
						firstName: mailData.firstName,
						spaceName: mailData.spaceName,
						role: mailData.role,
					};
				} else if (isRequestFor === "changePassword") {
					path = "/views/changePassword.ejs";
					data = {
						link: config.magicLinkRedirectLink + redirectLink,
						firstName: mailData.firstName,
						lastName: mailData.lastName,
					};
				} else if (isRequestFor === "emailOnChange") {
					path = "/views/emailOnChange.ejs";
					data = {
						link: config.magicLinkRedirectLink + redirectLink,
						firstName: mailData.firstName,
						lastName: mailData.lastName,
						role: mailData.role,
					};
				}

				ejs.renderFile(process.cwd() + path, data, (err, data) => {
					if (err) {
						callback(err);
					} else {
						const msg = {
							to: targetMail,
							from: config.mailAuth.authMail,
							subject: "Scaffold",
							html: data,
						};
						sgMail
							.send(msg)
							.then((response) => {
								callback(null, response);
							})
							.catch((error) => {
								callback(error);
							});
					}
				});
			} catch (e) {
				callback(e);
			}
		},
	};
};
