CREATE TABLE users (
	user_id VARCHAR(255) PRIMARY KEY,
	password VARCHAR(255),
	name VARCHAR(255)
);

CREATE TABLE blogs (
	blog_id SERIAL PRIMARY KEY,
	creator_name VARCHAR(255),
	creator_user_id VARCHAR(255),
	title VARCHAR(255),
	body TEXT,
	date_created TIMESTAMP,
	CONSTRAINT fk_user_id FOREIGN KEY (creator_user_id)
	REFERENCES users(user_id)
);