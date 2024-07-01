import { DbConnection } from "./db-connection.js";
import { escape } from "mysql2";

/**
 * @typedef Opinion
 * @property {number} id
 * @property {string} nombre
 * @property {string} correo
 * @property {"mucho" | "algo" | "poco" | "nada"} conocimientoDeReciclaje
 * @property {"si" | "no"} conocimientoDeFilamento
 */




class OpinionController {
    constructor() {
        this.dbConnection = new DbConnection();
    }

    /**
     * 
     * @param {Opinion} opinion 
     */
    async add(opinion) {
        const sql = `INSERT INTO opinion VALUES (NULL, ${escape(opinion.nombre)}, ${escape(opinion.correo)}, ${escape(opinion.conocimientoDeReciclaje)}, ${escape(opinion.conocimientoDeFilamento)});`;

        try {
            await this.dbConnection.connect();
            await this.dbConnection.connection.execute(sql)
        } catch (e) {
            console.log(`Error while inserting a new opinion: ${e}`);
        } finally {
            await this.dbConnection.disconnect();
        }
    }
}

export { OpinionController };
