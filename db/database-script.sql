USE bstb3xpjbhdg29eywvfu;

DROP TABLE IF EXISTS opinion;
CREATE TABLE IF NOT EXISTS opinion(
	id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(40) 
		CHARACTER SET utf8mb4
        COLLATE utf8mb4_spanish2_ci
		NOT NULL,
    correo VARCHAR(40) NOT NULL,
    conocimientoDeReciclaje VARCHAR(10) NOT NULL,
    conocimientoDeFilamento VARCHAR(10) NOT NULL,
    
    PRIMARY KEY(id)
);

DROP TABLE IF EXISTS image;
CREATE TABLE IF NOT EXISTS image (
	id INT NOT NULL AUTO_INCREMENT,
    secure_url VARCHAR(255) NOT NULL,
    public_id VARCHAR(255) NOT NULL,
    
    PRIMARY KEY(id)
);

DROP TABLE IF EXISTS user;
CREATE TABLE IF NOT EXISTS user (
    id INT NOT NULL AUTO_INCREMENT,
    profile_picture INT,
    full_name VARCHAR(100) 
		CHARACTER SET utf8mb4
        COLLATE utf8mb4_spanish2_ci
		NOT NULL,
    gender INT NOT NULL,
    email VARCHAR(60) NOT NULL,
    username VARCHAR(20) 
		CHARACTER SET utf8mb4
        COLLATE utf8mb4_spanish2_ci
		NOT NULL,
    password VARCHAR(20) 
		CHARACTER SET utf8mb4
        COLLATE utf8mb4_spanish2_ci
		NOT NULL,
    bio VARCHAR(200) 
		CHARACTER SET utf8mb4
        COLLATE utf8mb4_spanish2_ci
		NOT NULL,

    PRIMARY KEY(id),
    FOREIGN KEY (profile_picture) REFERENCES image(id)
		ON UPDATE CASCADE
        ON DELETE CASCADE
)
ENGINE = InnoDB
;


DROP TABLE IF EXISTS post;
CREATE TABLE IF NOT EXISTS post(
    id INT NOT NULL AUTO_INCREMENT,
    author INT NOT NULL,
    cover_image INT NOT NULL,
    creation_date DATETIME NOT NULL,
    summary VARCHAR(200) 
		CHARACTER SET utf8mb4
        COLLATE utf8mb4_spanish2_ci
		NOT NULL,
    content TEXT 
		CHARACTER SET utf8mb4
        COLLATE utf8mb4_spanish2_ci
		NOT NULL,

    PRIMARY KEY(id),
    FOREIGN KEY(author) REFERENCES user(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
	FOREIGN KEY(cover_image) REFERENCES image(id)
		ON UPDATE CASCADE
        ON DELETE CASCADE
)
ENGINE = InnoDB
;

DROP TABLE IF EXISTS interaction_type;
CREATE TABLE IF NOT EXISTS interaction_type (
    id INT NOT NULL AUTO_INCREMENT,
    _name VARCHAR(20) NOT NULL,
    PRIMARY KEY(id)
)
ENGINE = InnoDB
;

DROP TABLE IF EXISTS interaction;
CREATE TABLE IF NOT EXISTS interaction(
    id INT NOT NULL AUTO_INCREMENT,
    user INT NOT NULL,
    post INT NOT NULL,
    interaction_type INT NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY(user) REFERENCES user(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (post) REFERENCES post(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (interaction_type) REFERENCES interaction_type(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
ENGINE = InnoDB
;

INSERT INTO interaction_type VALUES (1, "like");
INSERT INTO interaction_type VALUES (2, "share");
INSERT INTO interaction_type VALUES (3, "dislike");

CREATE OR REPLACE VIEW likes_per_post AS (
	SELECT 
		interaction.post AS post, 
        COUNT(*) AS likes_count
	FROM interaction
    GROUP BY interaction.post
);
