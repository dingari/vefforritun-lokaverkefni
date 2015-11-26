'use strict';

var pg = require('pg');
var transaction = require('pg-transaction');

var DATABASE = 'postgres://postgres:root@localhost/lokaverkefni';
//var DATABASE = process.env.DATABASE_URL;

/*
pg.connect(DATABASE, function(error, client, done) {
	if(error) {
		return console.error(error);
	}
});
*/

module.exports.getById = function(id, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var entryQuery = 'SELECT * FROM entries WHERE id=$1';
		client.query(entryQuery, [id], function(error, result) {

			if(error) {
				done();
				console.error(error);
				return callback(error);
			} else {
				var entry = result.rows[0],
					content;

				var contentQuery = 'SELECT content, num_in_list, checked ' + 
									'FROM content where id=$1 ORDER BY ' + 
									'checked, num_in_list';
				client.query(contentQuery, [id], function(error, result) {
					done();

					if(error) {
						console.error(error);
						return callback(error);
					} else {
						console.log(result.rows);
						if(entry.list) {
							content = result.rows;
						} else {
							content = result.rows[0].content;
						}

						entry.content = content;
						return callback(null, entry);
					}
				});
			}
		});
	});
};


module.exports.getByUserIdDesc = function(id, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query = 'SELECT * FROM entries WHERE owner_id=$1 ORDER BY date DESC'
		client.query(query, [id], function(error, result) {
			done();
			
			if(error) {
				console.error(error);
				return callback(error);
			} else {
				var entries = result.rows;
				return callback(null, entries);
			}
		});
	})
}

module.exports.listPostsDesc = function(callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query = 'SELECT * FROM posts ORDER BY date DESC LIMIT 20;';
		client.query(query, function(error, result) {
			done();

			if(error) {
				console.error(error);
				return callback(error);
			} else {
				return callback(null, result.rows);
			}
		});
	});
};

module.exports.saveMemo = function(id, title, content, owner_id, date, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query, values;
		content = {content: [content]};

		if(id) {
			values = [title, content, date, id];
			query = 'UPDATE entries SET title=$1, content=$2, date=$3 WHERE id=$4';
		} else {
			values = [title, content, owner_id, date];
			query = 'INSERT INTO entries (title, content, owner_id, date)' +
						'VALUES($1, $2, $3, $4)';
		}

		query += ' RETURNING id';

		client.query(query, values, function(error, result) {
			done();

			if(error) {
				console.error(error);
				return callback(error);
			}

			return callback(null, result.rows[0].id);
		});
	});
};

module.exports.delete = function(id, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query = 'DELETE FROM entries WHERE id=$1';
		client.query(query, [id], function(error, status) {
			done();

			if(error) {
				console.log(error);
				return callback(error);
			}

			return callback(null, true);
		})
	})
}

module.exports.findOneById = function(id, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query = 'SELECT * FROM entries WHERE id=$1';
		client.query(query, [id], function(error, result) {
			done();

			if(error) {
				console.error(error);
				return callback(error);
			} else {
				return callback(null, result.rows[0]);
			}
		})
	})
}

module.exports.deletePost = function(id, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query = 'DELETE FROM posts WHERE id=$1';
		client.query(query, [id], function(error, status) {
			done();

			if(error) {
				console.error(error);
				return callback(error);
			} else {
				return callback(null, true);
			}
		});
	});
};