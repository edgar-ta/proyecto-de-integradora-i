import mysql from "mysql2/promise";

class DbConnection {
    constructor() {
        this.connection = null;
        this.mysql = mysql;
    }

    async connect() {
        try {
            this.connection = await this.mysql.createConnection({
                host: "127.0.0.5",
                user: "root",
                password: "root",
                database: "integradora_i",
                port: "3306"
            });
            console.log("Conexión creada");
        } catch (error) {
            console.error(`Error creando la conexión: \n${error.message}`);
        }
    }

    async disconnect() {
        if (this.connection != null) {
            try {
                await this.connection.end();
                console.log("Conexión eliminada");
            } catch {
                console.log("La conexión no se pudo eliminar");
            }
        }
    }
}

export { DbConnection };