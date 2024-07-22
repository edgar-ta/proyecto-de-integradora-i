import mysql from "mysql2/promise";

class DbConnection {
    constructor() {
        this.connection = null;
        this.mysql = mysql;
    }

    async connect() {
        try {
            this.connection = await this.mysql.createConnection({
                host: process.env.CLEVER_CLOUD_HOST,
                database: process.env.CLEVER_CLOUD_DATABASE,
                user: process.env.CLEVER_CLOUD_USER,
                password: process.env.CLEVER_CLOUD_PASSWORD,
                port: process.env.CLEVER_CLOUD_PORT,
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