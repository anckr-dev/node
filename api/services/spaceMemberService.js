module.exports = (spaceMemberModel, userModel, userSpaceModel) => {
	return {
		createData: function (data, callback) {
			spaceMemberModel
				.create(data)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchSpaceMembersList: function (find, callback) {
			find.include = [
				{
					model: userModel,
					as: "user",
					attributes: [
						"firstName",
						"lastName",
						"email",
						"phoneNumber",
						"userProfileImage",
					],
				},
			];
			spaceMemberModel
				.findAll(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		updateData: function (data, findCondition, callback) {
			spaceMemberModel
				.update(data, findCondition)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchData: function (find, callback) {
			spaceMemberModel
				.findOne(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		countData: function (condition, callback) {
			condition.include = [
				{
					model: userModel,
					as: "user",
					attributes: [
						"firstName",
						"lastName",
						"email",
						"phoneNumber",
						"userProfileImage",
					],
				},
				{
					model: userSpaceModel,
					as: "space",
				},
			];
			spaceMemberModel
				.count(condition)
				.then((count) => {
					callback(null, count);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchSpaceMember: function (find, callback) {
			find.include = [
				{
					model: userModel,
					as: "user",
					attributes: [
						"firstName",
						"lastName",
						"email",
						"phoneNumber",
						"userProfileImage",
					],
				},
				{
					model: userSpaceModel,
					as: "space",
				},
			];
			spaceMemberModel
				.findOne(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchSpaceMemberAndUserDetails: function (find, callback) {
			find.include = [
				{
					model: userModel,
					as: "user",
					attributes: [
						"firstName",
						"lastName",
						"email",
						"phoneNumber",
						"userProfileImage",
					],
				},
				{
					model: userSpaceModel,
					as: "space",
				},
			];
			spaceMemberModel
				.findOne(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchUserMemberList: function (find, callback) {
			find.include = [
				{
					model: userSpaceModel,
					as: "space",
					attributes: ["name", "id"],
				},
			];
			spaceMemberModel
				.findAll(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
	};
};
