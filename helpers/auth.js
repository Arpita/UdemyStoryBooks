module.exports = {
	ensureAuthenticated: function(req, resp, next) {
		if (req.isAuthenticated())
			return next();
		else
			resp.redirect('/');
	},
	ensureGuest: function(req, resp, next) {
		if (req.isAuthenticated())
			resp.redirect('/dashboard');
		else
			return next();
	}
}