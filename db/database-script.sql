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

