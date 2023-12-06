module.exports = (userModel, spaceMemberModel, userSpaceModel) => {
	return {
		createData: function (data, callback) {
			userModel
				.create(data)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		checkEmail: function (find, callback) {
			find.attributes = { exclude: ["password", "salt"] };
			find.include = [
				{
					model: spaceMemberModel,
					as: "spaceMemberListOfUser",
				},
			];
			userModel
				.findOne(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		upseartUser: function (data, find, callback) {
			userModel
				.upsert(data, find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		updateUser: function (data, find, callback) {
			userModel
				.update(data, find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchUserDataWithPassword: function (find, callback) {
			find.include = [
				{
					model: spaceMemberModel,
					where: { status: "active" },
					as: "spaceMemberListOfUser",
					attributes: ["id", "spaceId", "status", "role"],
					required: false,
					include: [
						{
							model: userSpaceModel,
							as: "space",
							attributes: ["name", "id"],
						},
					],
				},
			];
			userModel
				.findOne(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchUserDataIncludesMembersWithWhere: function (
			find,
			memberFilter,
			callback,
		) {
			find.include = [
				{
					model: spaceMemberModel,
					as: "spaceMemberListOfUser",
					where: memberFilter,
					required: false,
				},
			];
			userModel
				.findOne(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchData: function (find, callback) {
			find.attributes = { exclude: ["password", "salt"] };
			userModel
				.findOne(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
	};
};
