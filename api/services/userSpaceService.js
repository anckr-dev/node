module.exports = (userSpaceModel, spaceMemberModel) => {
	return {
		createData: function (data, callback) {
			userSpaceModel
				.create(data)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchData: function (find, callback) {
			userSpaceModel
				.findOne(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchCount: function (find, callback) {
			userSpaceModel
				.count(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchSpaceDataWithMembersList: function (find, callback) {
			find.include = [
				{
					model: spaceMemberModel,
					as: "spaceMemberList",
				},
			];
			userSpaceModel
				.findOne(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		updateData: function (data, find, callback) {
			userSpaceModel
				.update(data, find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
	};
};
