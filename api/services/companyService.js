module.exports = (companyModel, contactModel) => {
	return {
		createData: function (data, callback) {
			companyModel
				.create(data)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchData: function (find, callback) {
			find.include = [
				{
					model: contactModel,
					as: "contacts",
				},
			];
			companyModel
				.findAll(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		updateData: function (data, find, callback) {
			companyModel
				.update(data, find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		deleteData: function (find, callback) {
			companyModel
				.destroy(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchDetails: function (find, callback) {
			companyModel
				.findOne(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		countData: function (condition, callback) {
			companyModel
				.count(condition)
				.then((count) => {
					callback(null, count);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchData: function (find, callback) {
			companyModel
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
