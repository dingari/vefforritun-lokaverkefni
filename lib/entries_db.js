'use strict';

var pg = require('pg');
var transaction = require('pg-transaction');

// var DATABASE = 'postgres://postgres:root@localhost/lokaverkefni';
var DATABASE = process.env.DATABASE_URL;

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


module.exports.findAllByUserId = function(id, page, desc, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query = 'SELECT id, title, content, list, owner_id ' + 
			 ", to_char(date, 'DD/MM/YY - HH24:MI:SS') as date " + 
			 'FROM entries WHERE owner_id=$1';
		if(desc) { query += ' ORDER BY date DESC'; }
		else { query += ' ORDER BY date DESC'; }

		console.log(query);

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
	});
};

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

module.exports.save = function(id, title, content, list, owner_id, date, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query, values;
		content = JSON.stringify(content);
		// content = {content: [content]};

		if(id) {
			values = [title, content, list, date, id];
			query = 'UPDATE entries SET title=$1, content=$2, list=$3,' +
				' date=$4 WHERE id=$5';
		} else {
			values = [title, content, list, owner_id, date];
			query = 'INSERT INTO entries (title, content, list, owner_id' + 
				', date) VALUES($1, $2, $3, $4, $5)';
		}

		query += ' RETURNING id';

		console.log(query, values);
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

		var query = 'DELETE FROM entries WHERE id=$1  RETURNING id';
		client.query(query, [id], function(error, result) {
			done();

			if(error) {
				console.log(error);
				return callback(error);
			}

			return callback(null, result.rows[0].id);
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
		});
	});
};

module.exports.getMemosByUserId = function(id, page, desc, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query = 'SELECT id, title, content, list, owner_id ' + 
			", to_char(date, 'DD/MM/YY - HH24:MI:SS') as date " + 
			'FROM entries WHERE owner_id=$1 AND list IS NOT TRUE ' + 
			'ORDER BY date DESC';

		console.log(query)
		client.query(query, [id], function(error, result) {
			done();

			if(error) {
				console.error(error);
				return callback(error);
			}

			return callback(null, result.rows);
		});
	});
};

module.exports.getListsByUserId = function(id, page, desc, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query = 'SELECT id, title, content, list, owner_id ' + 
			 ", to_char(date, 'DD/MM/YY - HH24:MI:SS') as date " + 
			' FROM entries WHERE owner_id=$1 AND list IS TRUE ' + 
			' ORDER BY date DESC';
		client.query(query, [id], function(error, result) {
			done();

			if(error) {
				console.error(error);
				return callback(error);
			}

			return callback(null, result.rows);
		});
	});
};

module.exports.findAllPublicDesc = function(callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query = 'SELECT id, title, content, list, owner_id ' + 
			 ", to_char(date, 'DD/MM/YY - HH24:MI:SS') as date " + 
			' FROM entries ORDER BY date DESC';
		client.query(query, [], function(error, result) {
			done();

			if(error) {
				console.error(error);
				return callback(error);
			}

			return callback(null, result.rows);
		});
	});
};

module.exports.findAllByUserIdPrivate = function(id, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query = 'SELECT id, title, content, list, owner_id ' + 
			 ", to_char(date, 'DD/MM/YY - HH24:MI:SS') as date" + 
			' FROM entries WHERE owner_id=$1' +
			' ORDER BY date DESC';
		client.query(query, [id], function(error, result) {
			if(error) {
				return callback(error);
			}

			return callback(null, result.rows);
		});
	});
};

module.exports.findAllByUserIdSharedWith = function(owner_id, user_id, page, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var values = [owner_id, user_id];
		var query = 'SELECT id, title, content, list, owner_id ' + 
			", to_char(date, 'DD/MM/YY - HH24:MI:SS') as date, can_edit" +
			' from collaborators join entries on (entry_id=id)' + 
			' WHERE owner_id=$1 AND user_id=$2';

		console.log(query)
		client.query(query, values, function(error, result) {
			if(error) {
				console.error(error);
				return callback(error);
			}

			return callback(null, result.rows);
		});
	});
};

module.exports.findAllSharedWith = function(user_id, page, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query = 'SELECT id, title, content, list, owner_id ' + 
			", to_char(date, 'DD/MM/YY - HH24:MI:SS') as date, can_edit" +
			' from collaborators join entries on (entry_id=id)' + 
			' WHERE user_id=$1';

		client.query(query, [user_id], function(error, result) {
			if(error) {
				console.error(error);
				return callback(error);
			}

			return callback(null, result.rows);
		});
	});
};

// module.exports.setShareStatus = function(id, user_id, status, callback) {
// 	pg.connect(DATABASE, function(error, client, done) {
// 		if(error) {
// 			return callback(error);
// 		}

// 		var values = [id, user_id, status];
// 		var query = 'UPDATE entries SET shared=$3 WHERE id=$1';
// 		client.query(query, values, function(error, status) {
// 			if(error) {
// 				done();
// 				return callback(error);
// 			}


// 		})
// 	})
// }

module.exports.getUsersSharedWith = function(id, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query = 'SELECT id, username FROM users JOIN collaborators' + 
			' ON(user_id=id) WHERE entry_id=$1';

		client.query(query, [id], function(error, result) {
			done();

			if(error) {
				done();
				return callback(error);
			}

			return callback(null, result.rows);
		});
	});
};

module.exports.setUserShareStatus = function(id, user_id, status, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var values = [id, user_id];
		var query;

		if(status) {
			query = 'INSERT INTO collaborators (user_id, entry_id)' + 
				' SELECT $2, $1 WHERE NOT EXISTS (SELECT user_id, entry_id' +
				 ' FROM collaborators WHERE entry_id=$1 AND user_id=$2)';
		} else {
			query = 'DELETE FROM collaborators WHERE entry_id=$1' + 
				' AND user_id = $2';
		}
		
		client.query(query, values, function(error, result) {
			done();

			if(error) {
				return callback(error);
			}

			return callback(null, result.command);
		});
	});
};

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