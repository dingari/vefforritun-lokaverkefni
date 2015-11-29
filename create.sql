BEGIN;

DROP TABLE IF EXISTS content;
DROP TABLE IF EXISTS collaborators;
DROP TABLE IF EXISTS entries;
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
	ID SERIAL PRIMARY KEY, 
	username TEXT UNIQUE, 
	email TEXT UNIQUE,
	salt TEXT, 
	hash TEXT
);

CREATE TABLE entries
(
	ID SERIAL PRIMARY KEY, 
	title TEXT,
	content JSON,
	list BOOLEAN,
	shared BOOLEAN,
	owner_id INT REFERENCES users(id) ON DELETE CASCADE, 
	date TIMESTAMP WITH TIME ZONE
);
/*
CREATE TABLE content
(
	ID INT REFERENCES entries(ID),
	num_in_list INT UNIQUE,
	content TEXT,
	checked BOOLEAN
);
*/

CREATE TABLE collaborators 
(
	user_id INT REFERENCES users(id) ON DELETE CASCADE,
	entry_id INT REFERENCES entries(id) ON DELETE CASCADE
);

COMMIT;