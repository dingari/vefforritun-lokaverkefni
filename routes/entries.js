'use strict';

var express = require('express');
var router = express.Router();
var entries = require('../lib/entries_db');
var auth = require('../routes/auth');
var xss = require('xss');

router.get('/my_entries', auth.ensureLoggedIn, function(req, res, next) {
	var user = req.session.user;
	var data = {title: 'Listinn'};

	data.activeItem = req.query.id;

	createList(user.id, data, function() {
		res.render('my_entries', data);
	});
});

router.post('/my_entries', auth.ensureLoggedIn, function(req, res, next) {
	var title = req.body.title;
	var content = req.body.content;
	var id = req.body.id;
	var date = new Date();
	var owner_id = req.session.user.id || 3;
	var data = {};

	entries.saveMemo(id, title, content, owner_id, date, function(error, result) {
		if(error) {
			console.error(error);
		}

		// Ajax call that does not want the whole list back
		if(!!req.body.getList) {
			res.json({
				id: result,
				title: title,
				content: {content: content},
				date: date.getDate() + '/' + date.getMonth() + '/' + 
					(''+date.getFullYear()).substr(2,3) + ' - ' + 
					date.toTimeString().substr(0,8)
			});
		} else {
			data.activeItem = result;
			createList(owner_id, data, function() {
				res.render('my_entries', data);
			});
		}
	});
});

router.post('/new', auth.ensureLoggedIn, function(req, res, next) {
	var user = req.session.user;
	var type = req.query.type;
	var data = {};

	/*
	if(type !== 'list' ) {
		entries.saveMemo(null, '', '', user.id, new Date(), function(error, result) {
			if(error) {
				console.error(error);
			}

			data.activeItem = result;

			createList(user.id, data, function() {
				res.render('my_entries', data);
			});
		});
	}
	*/

	createList(user.id, data, function() {
		res.render('my_entries', data);
	});

});

router.post('/delete', auth.ensureLoggedIn, function(req, res, next) {
	var user = req.session.user;
	var id = req.body.id
	var data = {};

	entries.delete(id, function() {

		createList(user.id, data, function() {
			res.render('my_entries', data);
		})
	})
})

router.get('/', auth. ensureLoggedIn, function(req, res, next) {
	var data = {};

	// Birta yfirlit yfir nýjustu "public" færslurnar?

	/*
	posts.listPostsDesc(function(error, results) {
		if(error) {
			console.error(error);
		}

		if(results.length > 0) {
			data.posts = results;
		}

		data.user = req.session.user;
		data.sidebar = true;
		data.title = 'Póstarnir';

		res.render('posts', data);
	});
	*/
});

router.post('/', function(req, res, next) {
	var data ={};

	/*
	var title = xss(req.body.title);
	var content = xss(req.body.content);
	var date = new Date();
	var username = req.session.user;

	posts.savePost(title, content, date, username, function(error, status) {
		if(error) {
			console.error(error);
		}

		var success = true;

		if(error || !status) {
			success = false;
			data.message = 'Mistókst að vista færslu';
			data.title = title;
			data.content = content;

			res.render('posts', data);
		} else {
			res.redirect('/posts');
		}
	});
*/
});

router.post('/delete', function(req, res, next) {
	/*
	var id = req.query.id;

	posts.deletePost(id, function(error, status) {
		if(error) {
			console.error(error);
		}

		var success = false;
		var data = {};

		if(error || !status) {
			success = false;
			data.message = 'Mistókst að eyða færslu';
		} else {
			res.redirect('/posts');
		}
	});
*/
});

function createFormData(id, data, callback) {
	data.formContent = {};
	data.formTitle = '';

	entries.findOneById(id, function(error, result) {
		if(error) {
			console.error(error);
		} else if(result) {
			data.formTitle = result.title;
			data.formContent = result.content;
		}

		callback();
	});
}

function createList(userId, data, callback) {
	entries.getByUserIdDesc(userId, function(error, result) {
		if(error) {
			console.error(error);
		}

		data.list = result;

		createFormData(data.activeItem, data, callback);
	});
}

module.exports = router;