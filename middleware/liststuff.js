
var entries = require('../lib/entries_db');

module.exports.createList = function(req, res, next) {
	var userId = req.data.userId;
	var page = req.data.page;
	var func = req.data.func;

	func(userId, page, true, function(error, result) {
		if(error) {
			console.error(error);
		}

		req.list = result;
		if(!data.path)
			req.thepath = '';

		next();
	});
}

module.exports.createFormData = function(req, data, callback) {
	req.data.formContent = {};
	req.data.formTitle = '';
	var id = req.body.id;

	entries.findOneById(id, function(error, result) {
		if(error) {
			console.error(error);
		} else if(result) {
			req.data.formTitle = result.title;
			req.data.formContent = result.content;
		}

		next();
	});
}