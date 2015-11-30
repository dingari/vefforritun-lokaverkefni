'use strict';

var express = require('express');
var entries = require('../lib/entries_db')

module.exports.new = function(req, res, next) {
	var user = req.session.user;
	var type = req.query.type;
	var data = {};

	next();
}

module.exports.delete = function(req, res, next) {
	var user = req.session.user;
	var id = req.body.id
	var data = {};

	console.log('deleting', id);

	entries.delete(id, function(error, result) {

		// Ajax call not waning the whole list back
		if(!!req.body.getList) {
			res.json({id: result});
		} else {
			next();
		}
	});
}

module.exports.save = function(req, res, next) {
	var title = req.body.title;
	var content = req.body.content;
	var id = req.body.id;
	var date = new Date();
	var owner_id = req.session.user.id;
	var data = {};
	var page = 1;
	var list;

	console.log('islist', req.body.isList);

	if(req.body.isList) {
		console.log(content);

		content = JSON.parse(content);
		list = true;
	} else {
		content = {};
		content.content = req.body.content;
		list = false;
	}

	console.log('saving', content, id, list);

	var func;
	if(/memos/.test(req.originalUrl)) {
		func = entries.getMemosByUserId;
	} else if(/lists/.test(req.originalUrl)) {
		func = entries.getListsByUserId;
	} else {
		func = entries.findAllByUserId;
	}

	entries.save(id, title, content, list, owner_id, date, function(error, result) {
		if(error) {
			console.error(error);
		}

		// Ajax call that does not want the whole list back
		if(req.body.getList === 'false') {
			res.json({
				id: result,
				title: title,
				content: content,
				date: date.getDate() + '/' + date.getMonth() + '/' + 
					(''+date.getFullYear()).substr(2,3) + ' - ' + 
					date.toTimeString().substr(0,8)
			});
		} else {
			req.activeItem = result;
			next();
		}
	});
};

module.exports.memoList = function(req, res, next) {
	req.thepath = '/memos';
	req.activeItem = req.query.id;
	req.listFunc = entries.getMemosByUserId;

	next();
};

module.exports.listList = function(req, res, next) {
	req.thepath = '/lists';
	req.activeItem = req.query.id;
	req.listFunc = entries.getListsByUserId;

	next();
};

module.exports.share = function(req, res, next) {
	var user_id = req.body.user_id;
	var id = req.body.id;

	entries.setUserShareStatus(id, user_id, true, function(error, result) {
		if(error) {
			console.error(error);
		} 

		next();
	});
};

module.exports.unshare = function(req, res, next) {
	var user_id = req.body.user_id;
	var id = req.body.id;

	console.log(user_id, id)

	entries.setUserShareStatus(id, user_id, false, function(error, result) {
		if(error) {
			console.error(error);
		} 

		next();
	});
};

module.exports.getShareList = function(req, res, next) {
	console.log(req.query.id)
	entries.getUsersSharedWith(req.query.id, function(error, result) {
		if(error) {
			console.error(error);

			if(req.body.async) {
				res.send(500);
			}
		}

		req.sharelist = result;

		next();
	});
};