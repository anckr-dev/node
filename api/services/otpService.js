module.exports = (otpManager) => {
	return {
		createData: function (data, callback) {
			otpManager
				.create(data)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		fetchEmailData: function (find, callback) {
			otpManager
				.findOne(find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
		updateData: function (updateData, find, callback) {
			otpManager
				.update(updateData, find)
				.then((successData) => {
					callback(null, successData);
				})
				.catch((err) => {
					callback(err);
				});
		},
	};
};
