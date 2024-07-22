import { DbConnection } from "./db-connection.js";
import { getUserByUsername } from "./user.js";

/**
 * 
 * @param {string} username 
 * @param {number} postId 
 */
export async function likePost(username, postId) {
    const connection = new DbConnection();
    try {
        const user = (await getUserByUsername(username)).unwrap();
        await connection.connect();
        await connection.connection.execute("INSERT INTO interaction VALUES (NULL, ?, ?, 1)", [ user.id, postId ]);
    } catch (error) {
        throw error;
    } finally {
        connection.disconnect();
    }
}

/**
 * 
 * @param {string} username 
 * @param {number} postId 
 */
export async function unlikePost(username, postId) {
    const connection = new DbConnection();
    try {
        const user = (await getUserByUsername(username)).unwrap();
        await connection.connect();
        await connection.connection.execute("DELETE FROM interaction WHERE interaction.user = ? AND interaction.post = ? AND interaction.interaction_type = 1", [ user.id, postId ]);
    } catch (error) {
        throw error;
    } finally {
        connection.disconnect();
    }
}

