const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');
const mongoose = require('mongoose');
const Story = mongoose.model('stories');

router.get('/', ensureGuest, (req, resp) => {
	resp.render('index/welcome');
});

router.get('/dashboard', ensureAuthenticated, (req, resp) => {
	Story.find({user: req.user.id})
		.then(stories => {
			resp.render('index/dashboard', {
				stories: stories
			});
		});
});

router.get('/about', (req, resp) => {
	resp.render('index/about');
});

module.exports = router;
