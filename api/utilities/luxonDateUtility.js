module.exports = (DateTime) => {
	return {
		getDateInUTC: function (date) {
			date = date.toISOString();
			return DateTime.fromISO(date).toUTC().toISO();
		},
		getISOdate: function (date) {
			return DateTime.fromISO(date);
		},
	};
};
