import renameProperty from "../js/rename-property.js";
import { DbConnection } from "./db-connection.js";
import { checkUserById } from "./user.js";

/**
 * @typedef {Object} PostRecord
 * @property {number} id
 * @property {number} author
 * @property {number} coverImage
 * @property {Date} creationDate
 * @property {string} summary
 * @property {string} content
 */

/**
 * @typedef {Object} PostCardData
 * @property {number} postId
 * @property {string} postSummary
 * @property {Date} postCreationDate
 * @property {string} authorUsername
 * @property {string} authorProfilePicture
 * @property {string} postCoverImage
 */

/**
 * @returns {Promise<PostCardData[]>}
 */
export async function getPostCardData() {
    const connection = new DbConnection();
    try {
        await connection.connect();
        const [ data ] = await connection.connection.execute(`
            SELECT 
                post.id AS postId,
                post.summary AS postSummary,
                post.creation_date AS postCreationDate,
                user.username AS authorUsername,
                profile_picture.secure_url AS authorProfilePicture,
                cover_image.secure_url AS postCoverImage
            FROM post 
            INNER JOIN user ON post.author = user.id
            INNER JOIN image AS cover_image ON post.cover_image = cover_image.id
            LEFT JOIN image AS profile_picture ON user.profile_picture = profile_picture.id
            ORDER BY post.creation_date DESC
            LIMIT 10
            `
        );
        return data;
    } catch (error) {
        throw error;
    } finally {
        connection.disconnect();
    }
}

/**
 * 
 * @param {PostRecord} post 
 */
export async function insertPost(post) {
    const connection = new DbConnection();
    try {
        await connection.connect();
        await connection.connection.execute(
            "INSERT INTO post VALUES (NULL, ?, ?, NOW(), ?, ?)", 
            [ post.author, post.coverImage, post.summary, post.content ]
        );
    } catch (error) {
        throw error;
        
    } finally {
        await connection.disconnect();
    }
}

