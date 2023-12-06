module.exports = (contactModel) => {
	return {
		createData: function (data, callback) {
			contactModel
				.create(data)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		countData: function (condition, callback) {
			contactModel
				.count(condition)
				.then((count) => {
					callback(null, count);
				})
				.catch((err) => {
					callback(err);
				});
		},
		// fetchUserContactList: function (find, callback) {
		// 	find.include = [
		// 		{
		// 			model: contactModel,
		// 			as: "space",
		// 			attributes: ["name", "id"],
		// 		},
		// 	];
		// 	contactModel
		// 		.findAll(find)
		// 		.then((successData) => {
		// 			callback(null, successData);
		// 		})
		// 		.catch((err) => {
		// 			callback(err);
		// 		});
		// },

		fetchData: function (find, callback) {
			contactModel
				.findAll(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},

		updateData: function (data, find, callback) {
			contactModel
				.update(data, find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		deleteData: function (find, callback) {
			contactModel
				.destroy(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
	};
};
