DROP DATABASE IF EXISTS integradora_i;
CREATE DATABASE integradora_i;

USE integradora_i;

DROP TABLE IF EXISTS opinion;
CREATE TABLE IF NOT EXISTS opinion(
	id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(40) NOT NULL,
    correo VARCHAR(40) NOT NULL,
    conocimientoDeReciclaje VARCHAR(10) NOT NULL,
    conocimientoDeFilamento VARCHAR(10) NOT NULL,
    
    PRIMARY KEY(id)
);


DROP TABLE IF EXISTS user;
CREATE TABLE IF NOT EXISTS user (
    id INT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    gender INT NOT NULL,
    email VARCHAR(60) NOT NULL,
    username VARCHAR(20) NOT NULL,
    password VARCHAR(20) NOT NULL,
    profile_picture VARCHAR(200) NOT NULL,
    bio VARCHAR(200) NOT NULL,

    PRIMARY KEY(id)
)
ENGINE = InnoDB
;


DROP TABLE IF EXISTS post;
CREATE TABLE IF NOT EXISTS post(
    id INT NOT NULL AUTO_INCREMENT,
    author INT NOT NULL,
    creation_date DATE NOT NULL,
    summary VARCHAR(200) NOT NULL,
    cover_image VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,

    PRIMARY KEY(id),
    FOREIGN KEY(author) REFERENCES user(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
ENGINE = InnoDB
;

DROP TABLE IF EXISTS _like;
CREATE TABLE IF NOT EXISTS _like(
    user INT NOT NULL,
    post INT NOT NULL,

    FOREIGN KEY(user) REFERENCES user(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY(post) REFERENCES post(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
ENGINE = InnoDB
;
