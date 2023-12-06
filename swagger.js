// Routes

/**
 * @swagger
 *
 * /api/v1/login:
 *   post:
 *     tags: [User]
 *     description: Login to the application
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: enter user email
 *         in: formData
 *         required: true
 *         type: string
 *         example: abc@gmail.com
 *         pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
 *       - name: password
 *         description: enter user password
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: SignIn Successfully
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */
/**
 * @swagger
 *
 * /api/v1/validateEmail:
 *   post:
 *     tags: [User]
 *     description: validate email address to register user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: enter user email
 *         in: formData
 *         required: true
 *         type: string
 *         example: abc@gmail.com
 *         pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
 *       - name: firstName
 *         description: enter user first name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: lastName
 *         description: enter user last name
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */


/**
 * @swagger
 *
 * /api/v1/verifyEmailCode:
 *   post:
 *     tags: [User]
 *     description: verify email with OTP
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: enter user email
 *         in: formData
 *         required: true
 *         type: string
 *         example: abc@gmail.com
 *         pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
 *       - name: otpCode
 *         description: enter your otp 
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */


/**
 * @swagger
 *
 * /api/v1/tryWithDifferentMail:
 *   post:
 *     tags: [User]
 *     description: try with different email to proceed authentication
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: lastEmail
 *         description: enter last registed email
 *         in: formData
 *         required: true
 *         type: string
 *         example: abc@gmail.com
 *         pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
 *       - name: currentEmail
 *         description: enter new email to replace existing email
 *         in: formData
 *         required: true
 *         type: string
 *         example: abc@gmail.com
 *         pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/updateUserOnbording:
 *   post:
 *     tags: [User]
 *     description: to complete onbording step 1
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: password
 *         description: enter password to set for user account
 *         in: formData
 *         required: true
 *         type: string
 *       - name: isSkippingCreateSpace
 *         description: send as true if user wanted to skip create Space
 *         in: formData
 *         required: false
 *         type: boolean
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 * 
 * /api/v1/updateUserOnbording/:
 *   post:
 *     tags: [User]
 *     description: to complete onbording step 3
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: isNotRobotVerified
 *         description: send 'true' if user was not a robot
 *         in: formData
 *         required: true
 *         type: boolean
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/updateOnboardingForCreateSpace:
 *   post:
 *     tags: [User]
 *     description: to complete onbording step 2 for updating space details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: spaceName
 *         description: enter desired name for space
 *         in: formData
 *         required: true
 *         type: string
 *       - name: address
 *         description: enter space address
 *         in: formData
 *         required: true
 *         type: string
 *       - name: city
 *         description: enter city of space
 *         in: formData
 *         required: true
 *         type: string
 *       - name: state
 *         description: enter state of space
 *         in: formData
 *         required: true
 *         type: string
 *       - name: country
 *         description: enter country of space
 *         in: formData
 *         required: true
 *         type: string
 *       - name: zip
 *         description: enter postal code of space
 *         in: formData
 *         required: true
 *         type: string
 *       - name: website
 *         description: enter website of space if exists
 *         in: formData
 *         required: false
 *         type: string
 *       - name: spaceType
 *         description: select space type
 *         in: formData
 *         enum: ['organization']
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/updateOnboardingForCreateSpace/:
 *   post:
 *     tags: [User]
 *     description: to complete onbording step 2 for invited users firstName and lastName details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: firstName
 *         description: enter user firstName
 *         in: formData
 *         required: true
 *         type: string
 *       - name: lastName
 *         description: enter user lastName
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/forgotPasswordRequest:
 *   post:
 *     tags: [User]
 *     description: request for reset password
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: enter registed email
 *         in: formData
 *         required: true
 *         type: string
 *         example: abc@gmail.com
 *         pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/updateForgotPassword:
 *   post:
 *     tags: [User]
 *     description: reset password
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: password
 *         description: enter password for your account
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/loginWithMagicLinkRequest:
 *   post:
 *     tags: [User]
 *     description: magic link request for login
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: enter registered email for magic link request
 *         in: formData
 *         required: true
 *         type: string
 *         example: abc@gmail.com
 *         pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/signInUsingMagicLink:
 *   post:
 *     tags: [User]
 *     description: sign in using magic link
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/updateUserDetails:
 *   put:
 *     tags: [User]
 *     description: update user details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: firstName
 *         description: enter first name to update user details
 *         in: formData
 *         required: false
 *         type: string
 *       - name: lastName
 *         description: enter last name to update user details
 *         in: formData
 *         required: false
 *         type: string
 *       - name: company
 *         description: enter company name to update user details
 *         in: formData
 *         required: false
 *         type: string
 *       - name: country
 *         description: enter country to update user details
 *         in: formData
 *         required: false
 *         type: string
 *       - name: phoneNumber
 *         description: enter phone number to update user details
 *         in: formData
 *         required: false
 *         type: string
 *       - name: DOB
 *         description: enter date of birth to update user details, example:- 2018-03-20
 *         in: formData
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/uploadUserProfileImage:
 *   post:
 *     tags: [User]
 *     description: sign in using magic link
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: image
 *         description: upload image
 *         in: formData
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/changePassword:
 *   post:
 *     tags: [User]
 *     description: change password
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: existingPassword
 *         description: enter existing password
 *         in: formData
 *         required: true
 *         type: string
 *       - name: newPassword
 *         description: enter new password
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */


/**
 * @swagger
 *
 * /api/v1/changeEmailRequest:
 *   post:
 *     tags: [User]
 *     description: change user email
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: newEmail
 *         description: enter new email
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/confirmChangeEmailRequest:
 *   post:
 *     tags: [User]
 *     description: confirm to change email
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userMail
 *         description: enter existing email
 *         in: formData
 *         required: true
 *         type: string
 *       - name: newEmail
 *         description: enter new email
 *         in: formData
 *         required: true
 *         type: string
 *         example: abc@gmail.com
 *         pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/refreshMagicLink:
 *   post:
 *     tags: [User]
 *     description: refresh expired tokens
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: enter expired token
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */


/**
 * @swagger
 *
 * /api/v1/createSpace:
 *   post:
 *     tags: [Space]
 *     description: api is to create a space once after onboarding is done
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: spaceName
 *         description: enter desired name for space
 *         in: formData
 *         required: true
 *         type: string
 *       - name: address
 *         description: enter space address
 *         in: formData
 *         required: true
 *         type: string
 *       - name: city
 *         description: enter city of space
 *         in: formData
 *         required: true
 *         type: string
 *       - name: state
 *         description: enter state of space
 *         in: formData
 *         required: true
 *         type: string
 *       - name: country
 *         description: enter country of space
 *         in: formData
 *         required: true
 *         type: string
 *       - name: zip
 *         description: enter postal code of space
 *         in: formData
 *         required: true
 *         type: string
 *       - name: website
 *         description: enter website of space if exists
 *         in: formData
 *         required: false
 *         type: string
 *       - name: spaceType
 *         description: select space type
 *         in: formData
 *         enum: ['organization']
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/fetchSpaceDetails/{spaceId}:
 *   get:
 *     tags: [Space]
 *     description: fetching space details using the specified space Id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: spaceId
 *         description: identifier for the space
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 *       401:
 *         description: unAuthorized
 */

/**
 * @swagger
 *
 * /api/v1/inviteTeamMember:
 *   post:
 *     tags: [Space Invitation]
 *     description: fetching space details using the specified space Id
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: inviteList
 *         description: identifier for the space
 *         in: formData
 *         required: true
 *         type: array
 *         items: 
 *           type: object
 *           properties:
 *               email:
 *                   type: string
 *               role:
 *                   type: string   
 *       - name: spaceId
 *         description: identifier for the space
 *         in: formData
 *         required: true
 *         type: string
 *       - name: spaceName
 *         description: identifier for the space
 *         in: formData
 *         required: true
 *         type: string
 *       - name: spaceMemberId
 *         in: header
 *         description: an spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 *       401:
 *         description: unAuthorized
 */


/**
 * @swagger
 *
 * /api/v1/joinSpaceUsingInvitationLink:
 *   post:
 *     tags: [Space Invitation]
 *     description: join space using invitation link
 *     produces:
 *       - application/json
 *     parameters:  
 *       - name: spaceId
 *         description: identifier for the invitation
 *         in: formData
 *         required: true
 *         type: string
 *       - name: authorization
 *         in: header
 *         description: an authorization Bearer header ( token )
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 *       401:
 *         description: unAuthorized
 */

/**
 * @swagger
 *
 * /api/v1/fetchSpaceMemberList: 
 *   get:
 *     tags: [Space]
 *     description: fetching space member list using the specified space Id with pagination
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: spaceId
 *         description: identifier for the space
 *         in: query
 *         required: true
 *         type: string
 *       - name: pageLimit
 *         description: number of data
 *         in: query
 *         required: false
 *         type: number
 *       - name: page
 *         description: page number starts from 0
 *         in: query
 *         required: false
 *         type: number
 *       - name: search
 *         description: search here
 *         in: query
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 *       401:
 *         description: unAuthorized
 */

/**
 * @swagger
 *
 * /api/v1/validateEmailFromInvitation:
 *   post:
 *     tags: [User]
 *     description: validate email address to register user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: enter user email
 *         in: formData
 *         required: true
 *         type: string
 *         example: abc@gmail.com
 *         pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
 *       - name: firstName
 *         description: enter user first name
 *         in: formData
 *         required: true
 *         type: string
 *       - name: lastName
 *         description: enter user last name
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/refreshDashboard:
 *   get:
 *     tags: [Dashboard]
 *     description: refresh dashboard for latest data
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 *       401:
 *         description: unAuthorized
 */

/**
 * @swagger
 *
 * /api/v1/resendInvitation/{memberId}:
 *   put:
 *     tags: [Space Invitation]
 *     description: resend space member invitation
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: memberId
 *         description: identifier for the space user
 *         in: path
 *         required: true
 *         type: string
 *       - name: spaceMemberId
 *         in: header
 *         description: a spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 *       401:
 *         description: unAuthorized
 */

/**
 * @swagger
 *
 * /api/v1/revokeSpaceInvitation/{memberId}:
 *   put:
 *     tags: [Space Invitation]
 *     description: revoke space member invitation
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: memberId
 *         description: identifier for the space user
 *         in: path
 *         required: true
 *         type: string
 *       - name: spaceMemberId
 *         in: header
 *         description: a spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 *       401:
 *         description: unAuthorized
 */

/**
 * @swagger
 *
 * /api/v1/toggleSpaceMemberAccess:
 *   put:
 *     tags: [Space]
 *     description: Activate or deactivate member access for the space
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: targetMemberId
 *         description: identifier for the space user
 *         in: formData
 *         required: true
 *         type: string
 *       - name: activeStatus
 *         description: true indicates granting access/ false restricting user to access the space
 *         in: formData
 *         required: true
 *         type: boolean
 *       - name: spaceMemberId
 *         in: header
 *         description: a spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 *
 * /api/v1/changeSpaceMemberRole:
 *   put:
 *     tags: [Space]
 *     description: to change space member role
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: targetMemberId
 *         description: identifier for the space user
 *         in: formData
 *         required: true
 *         type: string
 *       - name: role
 *         description: select the role for the accessing space
 *         in: formData
 *         required: true
 *         enum: ['admin', 'member']
 *       - name: spaceMemberId
 *         in: header
 *         description: a spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 *       401:
 *         description: Unauthorized
 */


/**
 * @swagger
 *
 * /api/v1/createCompany:
 *   post:
 *     tags: [Company]
 *     description: add company to the space
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: desire name of the company
 *         in: formData
 *         required: true
 *         type: string
 *       - name: address
 *         description: enter company address
 *         in: formData
 *         required: true
 *         type: string
 *       - name: city
 *         description: enter city of company
 *         in: formData
 *         required: true
 *         type: string
 *       - name: state
 *         description: enter state of company
 *         in: formData
 *         required: true
 *         type: string
 *       - name: country
 *         description: enter country of company
 *         in: formData
 *         required: true
 *         type: string
 *       - name: postalCode
 *         description: enter postal code of company
 *         in: formData
 *         required: true
 *         type: string
 *       - name: website
 *         description: enter website of company if exists
 *         in: formData
 *         required: false
 *         type: string
 *       - name: phoneNumber
 *         description: enter phoneNumber of company if exists
 *         in: formData
 *         required: false
 *         type: string
 *       - name: spaceMemberId
 *         in: header
 *         description: a spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/fetchCompanyList:
 *   get:
 *     tags: [Company]
 *     description: fetching space company list with pagination
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: pageLimit
 *         description: number of data
 *         in: query
 *         required: false
 *         type: number
 *       - name: page
 *         description: page number starts from 0
 *         in: query
 *         required: false
 *         type: number
 *       - name: spaceMemberId
 *         in: header
 *         description: a spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *       - name: search
 *         description: search here
 *         in: query
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 *       401:
 *         description: unAuthorized
 */

/**
 * @swagger
 *
 * /api/v1/getCompanyDetails/{companyId}:
 *   get:
 *     tags: [Company]
 *     description: get company details by its identifier
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: companyId
 *         description: identifier for the company
 *         in: path
 *         required: true
 *         type: string
 *       - name: spaceMemberId
 *         in: header
 *         description: a spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */



/**
 * @swagger
 *
 * /api/v1/updateCompany:
 *   put:
 *     tags: [Company]
 *     description: update company details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: companyId
 *         description: identifier for company
 *         in: formData
 *         required: true
 *         type: string
 *       - name: companyName
 *         description: enter name of company you wanted to update
 *         in: formData
 *         required: false
 *         type: string
 *       - name: city
 *         description: enter company city
 *         in: formData
 *         required: false
 *         type: string
 *       - name: state
 *         description: enter company state
 *         in: formData
 *         required: false
 *         type: string
 *       - name: address
 *         description: enter company address
 *         in: formData
 *         required: false
 *         type: string
 *       - name: postalCode
 *         description: enter company address postalCode 
 *         in: formData
 *         required: false
 *         type: string
 *       - name: phoneNumber
 *         description: enter phoneNumber of company
 *         in: formData
 *         required: false
 *         type: string
 *       - name: country
 *         description: enter country of company
 *         in: formData
 *         required: false
 *         type: string
 *       - name: website
 *         description: enter website os the company
 *         in: formData
 *         required: false
 *         type: string
 *       - name: spaceMemberId
 *         in: header
 *         description: a spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */ 

/**
 * @swagger
 *
 * /api/v1/createContact:
 *   post:
 *     tags: [Contact]
 *     description: create contact
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: firstName
 *         description: first name of contact
 *         in: formData
 *         required: true
 *         type: string
 *       - name: lastName
 *         description: last name of contact 
 *         in: formData
 *         required: true
 *         type: string
 *       - name: email
 *         description: email related to contact 
 *         in: formData
 *         required: true
 *         type: string
 *         example: abc@gmail.com
 *         pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
 *       - name: phoneNumber
 *         description: phone number of contact 
 *         in: formData
 *         required: true
 *         type: string
 *       - name: jobTittle
 *         description: job related to contact
 *         in: formData
 *         required: true
 *         type: string
 *       - name: companyId
 *         description: identifier of company to associate 
 *         in: formData
 *         required: false
 *         type: string
 *       - name: spaceMemberId
 *         in: header
 *         description: a spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */
/**
 * @swagger
 *
 * /api/v1/updateContact:
 *   put:
 *     tags: [Contact]
 *     description: update Contact details
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: contactId
 *         description: enter contactId for update
 *         in: formData
 *         required: true
 *         type: string
 *       - name: firstName
 *         description: enter first name for update 
 *         in: formData
 *         required: false
 *         type: string
 *       - name: lastName
 *         description: enter last name for update 
 *         in: formData
 *         required: false
 *         type: string
 *       - name: email
 *         description: enter email for update
 *         in: formData
 *         required: false
 *         type: string
 *         pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
 *       - name: companyId
 *         description: enter companyId to associate
 *         in: formData
 *         required: false
 *         type: string
 *       - name: phoneNumber
 *         description: enter phone number for update 
 *         in: formData
 *         required: false
 *         type: string
 *       - name: jobTitle
 *         description: enter jobTitle for update 
 *         in: formData
 *         required: false
 *         type: string
 *       - name: spaceMemberId
 *         in: header
 *         description: a spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */
/**
 * @swagger
 *
 * /api/v1/fetchContactList:
 *   get:
 *     tags: [Contact]
 *     description: fetching space contact list with pagination
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: pageLimit
 *         description: number of data
 *         in: query
 *         required: false
 *         type: number
 *       - name: page
 *         description: page number starts from 0
 *         in: query
 *         required: false
 *         type: number
 *       - name: spaceMemberId
 *         in: header
 *         description: a spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 *       401:
 *         description: unAuthorized
 */

/**
 * @swagger
 *
 * /api/v1/removeAssociationWithCompany/{contactId}:
 *   put:
 *     tags: [Contact]
 *     description: remove association with company
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: contactId
 *         description: identifier for the contact
 *         in: path
 *         required: true
 *         type: string
 *       - name: spaceMemberId
 *         in: header
 *         description: a spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 */

/**
 * @swagger
 *
 * /api/v1/fetchNonAssociatedContactList:
 *   get:
 *     tags: [Contact]
 *     description: fetching space non associated contact list
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: spaceMemberId
 *         in: header
 *         description: a spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 *       401:
 *         description: unAuthorized
 */


/**
 * @swagger
 *
 * /api/v1/associateMultipleContacts:
 *   put:
 *     tags: [Company]
 *     description: update multiple contacts associated with a company
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: arrayOfAssociations
 *         description: identifiers of selected contacts
 *         in: formData
 *         required: true
 *         type: array
 *       - name: companyId
 *         description: identifier for the company
 *         in: formData
 *         required: true
 *         type: string
 *       - name: spaceMemberId
 *         in: header
 *         description: an spaceMemberId is needed for confirming admin restricted access
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: api got success
 *       422:
 *         description: invalid input
 *       500:
 *         description: server error
 *       401:
 *         description: unAuthorized
 */

