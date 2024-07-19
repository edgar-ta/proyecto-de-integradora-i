import { format } from "mysql2";
import { DbConnection } from "./db-connection.js";

/**
 * @typedef {Object} UserRecord
 * @property {number} id
 * @property {string} fullName
 * @property {number} gender
 * @property {string} email
 * @property {string} username
 * @property {string} password
 * @property {string} profilePicture
 * @property {string} bio
 * 
 */

/**
 * 
 * @param {string} username 
 * @returns {Promise<UserRecord?>}
 */
async function getUserByUsername(username) {
    let user;
    const connection = new DbConnection();
    try {
        const sql = format("SELECT * FROM user WHERE user.username = ?", [ username ]);
    
        await connection.connect();
        [ [ user ] ] = await connection.connection.execute(sql);

    } catch (error) {
        throw error;

    } finally {
        await connection.disconnect();
    }

    return user;
}

/**
 * 
 * @param {UserRecord} userRecord 
 * @returns {Promise<[ string, boolean ]>} Whether the user was properly inserted or not
 */
async function insertUser(userRecord) {
    const connection = new DbConnection();
    try {
        await connection.connect();
        const user = await getUserByUsername(userRecord.username);
        if (user !== undefined) {
            return [ "El nombre de usuario indicado ya existe", false ];
        }

        connection.connection.config.namedPlaceholders = true;
        await connection.connection.execute(
            "INSERT INTO user VALUES (NULL, :fullName, :gender, :email, :username, :password, '', '')", 
            userRecord
        );
        return [ null, true ];
        
    } catch (error) {
        throw error;
        
    } finally {
        await connection.disconnect();
    }
}


export {
    getUserByUsername,
    insertUser
}
