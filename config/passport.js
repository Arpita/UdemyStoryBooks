const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('./keys');

const User = mongoose.model('users');

module.exports = function(passport) {
	passport.use(new GoogleStrategy({
		clientID: keys.googleClientID,
		clientSecret: keys.googleClientSecret,
		callbackURL: '/auth/google/callback',
		proxy: true
	}, (accessToken, refreshToken, profile, done) => {
		//console.log(accessToken);
		//console.log(profile);

		// check for existing user
		User.findOne( { googleID: profile.id } )
			.then(user => {
				if (user) {
					// return existing user
					done(null, user);
				} else {
					// add new user
					const image = profile.photos[0].value.substring(0, profile.photos[0].value.indexOf('?'));

					const newUser = new User({
						googleID: profile.id,
						firstName: profile.name.givenName,
						lastName: profile.name.familyName,
						email: profile.emails[0].value,
						image: image
					});

					newUser.save()
						.then(user => done(null, user)); // returning the new user
				}
			})
	}));

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.findById(id).then(user => done(null, user));
	});
};
