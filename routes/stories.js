const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');
const mongoose = require('mongoose');
const Story = mongoose.model('stories');
const User = mongoose.model('users');

// Stories index
router.get('/', (req, resp) => {
	Story.find({ status: 'public' })
		.populate('user')
		.sort({date: 'desc'})
		.then(stories => {
			resp.render('stories/index', {
				stories: stories
			});
		});
});

// Show single story
router.get('/show/:id', (req, resp) => {
	Story.findOne({ _id: req.params.id })
		.populate('user')
		.populate('comments.commentUser')
		.then(story => {
			if (story.status == 'public') {
				resp.render('stories/show', {
					story: story
				});
			} else {
				if (req.user) {
					if (req.user.id == story.user._id) {
						resp.render('stories/show', {
							story: story
						});
					} else
						resp.redirect('/stories');
				} else {
					resp.redirect('/stories');
				}
			}
		});
});

// List stories from a specific user
router.get('/users/:userid', ensureAuthenticated, (req, resp) => {
	Story.find({ user: req.params.userid, status: 'public' })
		.populate('user')
		.sort({date: 'desc'})
		.then(stories => {
			resp.render('stories/index', {
				stories: stories
			});
		});
});

// List stories from logged in user
router.get('/my', ensureAuthenticated, (req, resp) => {
	Story.find({ user: req.user.id })
		.populate('user')
		.sort({date: 'desc'})
		.then(stories => {
			resp.render('stories/index', {
				stories: stories
			});
		});
});

// Add story form
router.get('/add', ensureAuthenticated, (req, resp) => {
	resp.render('stories/add');
});

// Process add story
router.post('/', (req, resp) => {
	var allowComments = false;

	if (req.body.allowComments)
		allowComments = true;

	const newStory = new Story( {
		title: req.body.title,
		body: req.body.body,
		status: req.body.status,
		allowComments: allowComments,
		user: req.user.id
	} );

	newStory.save()
		.then(story => {
			resp.redirect(`/stories/show/${story.id}`);
		});
});

// Edit story form
router.get('/edit/:id', ensureAuthenticated, (req, resp) => {
	Story.findOne({ _id: req.params.id })
		.then(story => {
			if (story.user != req.user.id)
				resp.redirect('/stories');
			else {
				resp.render('stories/edit', {
					story: story
				});
			}
		});
});

// Process edit form
router.put('/:id', ensureAuthenticated, (req, resp) => {
	Story.findOne({ _id: req.params.id })
		.then(story => {
			var allowComments = false;

			if (req.body.allowComments)
				allowComments = true;

			story.title = req.body.title;
			story.body = req.body.body;
			story.status = req.body.status;
			story.allowComments = allowComments;

			story.save()
				.then(st => {
					resp.redirect('/dashboard');
				});
		});
});

// Delete story
router.delete('/:id', ensureAuthenticated, (req, resp) => {
	Story.remove({ _id: req.params.id })
		.then(() => {
			resp.redirect('/dashboard');
		});
});

// Add comment
router.post('/comments/:id', ensureAuthenticated, (req, resp) => {
	Story.findOne({ _id: req.params.id })
		.then(story => {
			const newComment = {
				commentBody: req.body.commentBody,
				commentUser: req.user.id
			}
			// add to the begnning of the array so unshift
			story.comments.unshift(newComment);

			story.save()
				.then(st => {
					resp.redirect(`/stories/show/${story.id}`);
				});
		});
});

module.exports = router;