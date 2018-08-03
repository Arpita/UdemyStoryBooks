const express = require('express');
const router = express.Router();
const passport = require('passport');


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] } ) );

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' } ),
		function(req, resp) {
			// Successful authentication, redirect home
			resp.redirect('/dashboard');
		}
);

router.get('/verify', (req, resp) => {
	if (req.user)
		console.log(req.user);
	else
		console.log('Not authenticated');
});

router.get('/logout', (req, resp) => {
	req.logout();
	resp.redirect('/');
});

module.exports = router;