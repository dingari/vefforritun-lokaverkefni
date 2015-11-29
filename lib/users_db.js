'use strict';

var hash = require('../lib/pass').hash;
var pg = require('pg');

var DATABASE = 'postgres://postgres:root@localhost/lokaverkefni';
// var DATABASE = process.env.DATABASE_URL;

pg.connect(DATABASE, function(error, client, done) {
	if(error) {
		return console.error(error);
	}
});


function createUserWithHashAndSalt(username, salt, hash, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var values = [username.toLowerCase(), salt, hash];
		var query = 'INSERT INTO users (username, salt, hash)' +
					' VALUES($1, $2, $3) RETURNING id';
		client.query(query, values, function(error, result) {
			done();

			if(error) {
				console.error(error);
				return callback(error);
			} else {
				return callback(null, result.rows[0].id);
			}
		});
	});
}

module.exports.createUser = function(username, password, callback) {
	hash(password, function(error, salt, hash) {
		if(error) {
			return callback(error);
		}

		createUserWithHashAndSalt(username.toLowerCase(), salt, hash, callback);
	});
};

function findUser(username, inclSaltAndHash, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var values = [username.toLowerCase()];
		var query = 'SELECT id, username';

		if(inclSaltAndHash) {
			query += ', salt, hash';
		} 

		query += ' FROM users WHERE username=$1';

		console.log(query)
		client.query(query, values, function(error, result) {
			done();

			if(error) {
				return callback(error);
			} else {
				return callback(null, result.rows);
			}
		});
	});
}

module.exports.search = function(username, callback) {
	pg.connect(DATABASE, function(error, client, done) {
		if(error) {
			return callback(error);
		}

		var query = 'SELECT id, username FROM users WHERE username' + 
					' LIKE $1';
		client.query(query, ['%' + username + '%'], function(error, result) {
			if(error) {
				return callback(error);
			}

			return callback(null, result.rows);
		});
	});
};

module.exports.auth = function(username, password, callback) {
	findUser(username.toLowerCase(), true, function(error, result) {
		var user = null;

		if(result.length === 1) {
			user = result[0];
		}

		if(!user) {
			return callback(new Error('Cannot find user', username));
		}

		hash(password, user.salt, function(error, hash) {
			if(error) {
				return callback(error);
			}

			if(hash === user.hash) {
				return callback(null, user);
			}

			callback(new Error('Invalid password'));
		});
	});
};
