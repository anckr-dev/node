const cookieExtractor = function (req) {
	let token = null;
	if (req && Object.keys(req?.cookies).length) {
		let bearerJwt = req.cookies["token"];
		token = bearerJwt.split(" ")[1];
	}
	return token;
};

module.exports = (config, database, passport, passportJWT) => {
	const JWTStrategy = passportJWT.Strategy;
	const ExtractJWT = passportJWT.ExtractJwt;
	passport.use(
		new JWTStrategy(
			{
				jwtFromRequest: cookieExtractor
					? cookieExtractor
					: ExtractJWT.fromAuthHeaderAsBearerToken(),
				secretOrKey: config.JWT.secretKey,
			},
			function (jwtPayload, done) {
				if (jwtPayload?.data?.userId) {
					let find = {
						where: { id: jwtPayload?.data?.userId },
					};
					find.attributes = { exclude: ["salt"] };
					find.include = [
						{
							model: database.models.space_member,
							as: "spaceMemberListOfUser",
						},
					];
					database.models.user
						.findOne(find)
						.then((user) => {
							if (user) {
								return done(null, user);
							} else {
								return done(null, null, "sample text");
							}
						})
						.catch((err) => {
							return done(err);
						});
				} else {
					return done(null, null, "sample text");
				}
			},
		),
	);
};
