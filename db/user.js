import { format } from "mysql2";
import { DbConnection } from "./db-connection.js";
import renameProperty from "../js/rename-property.js";
import * as Maybe from "monads-io/maybe";

/**
 * @typedef {Object} UserRecord
 * @property {number} id
 * @property {number?} profilePicture
 * @property {string} fullName
 * @property {number} gender
 * @property {string} email
 * @property {string} username
 * @property {string} password
 * @property {string} bio
 * 
 */

/**
 * 
 * @param {string} username 
 * @returns {Promise<Maybe.Maybe<UserRecord>>}
 */
async function getUserByUsername(username) {
    const connection = new DbConnection();
    try {
        await connection.connect();
    
        const [ [ user ] ] = await connection.connection.execute(
            "SELECT * FROM user WHERE user.username = ?", 
            [ username ]
        );

        if (user === undefined) {
            return Maybe.none();
        }

        renameProperty(user, "full_name", "fullName");
        renameProperty(user, "profile_picture", "profilePicture");

        return Maybe.just(user);
    } catch (error) {
        throw error;

    } finally {
        await connection.disconnect();
    }
}

/**
 * 
 * @param {number} id 
 * @returns {Promise<boolean>} Whether the user exists or not
 */
async function checkUserById(id) {
    const connection = new DbConnection();
    let userExists = false;
    try {
        await connection.connect();
        const [ [ count ] ] = await connection.connection.execute(format("SELECT COUNT(*) FROM user WHERE user.id = ?", [ id ]));
        userExists = count == 1;
    } catch (error) {
        throw error;
    } finally {
        await connection.disconnect();
    }

    return userExists;
}

/**
 * This function shouldn't do any validation whatsoever
 * @param {UserRecord} userRecord 
 */
async function insertUser(userRecord) {
    const connection = new DbConnection();
    try {
        await connection.connect();

        connection.connection.config.namedPlaceholders = true;
        await connection.connection.execute(
            "INSERT INTO user VALUES (NULL, NULL, :fullName, :gender, :email, :username, :password, '')", 
            userRecord
        );
        
    } catch (error) {
        throw error;
        
    } finally {
        await connection.disconnect();
    }
}


export {
    getUserByUsername,
    insertUser,
    checkUserById
}
