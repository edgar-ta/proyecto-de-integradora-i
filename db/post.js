import { Maybe } from "monads-io";
import ensureProfilePicture from "../js/ensure-profile-picture.js";
import { DbConnection } from "./db-connection.js";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale/es"
import renameProperty from "../js/rename-property.js";
import { format } from "mysql2";


/**
 * @template T
 * @typedef {{ [K in keyof T]: T[K]? }} AllNullable<T>
 */

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
 * @typedef {Object} PostRecord_SnakeCase
 * @property {number} id
 * @property {number} author
 * @property {number} cover_image
 * @property {Date} creation_date
 * @property {string} summary
 * @property {string} content
 */

/**
 * @typedef {Object} PostCardData
 * @property {number} postId
 * @property {string} postSummary
 * @property {string} postCreationDate
 * @property {string} authorUsername
 * @property {string} authorProfilePicture
 * @property {string} postCoverImage
 * @property {number} postLikesCount
 * @property {boolean} userLikesPost
 * @property {boolean} userOwnsPost
 */

/**
 * @param {string} username
 * @returns {Promise<PostCardData[]>}
 */
export async function getPostCardDataForUser(username) {
    const connection = new DbConnection();
    try {
        await connection.connect();
        const [ data ] = await connection.connection.execute(`
    SELECT 
        post.id AS postId,
        post.summary AS postSummary,
        post.creation_date AS postCreationDate,
        author.username AS authorUsername,
        profile_picture.secure_url AS authorProfilePicture,
        cover_image.secure_url AS postCoverImage,
        likes_per_post.likes_count AS postLikesCount,
        author.username = ? AS userOwnsPost,
        post.id IN (
            SELECT interaction.post
            FROM interaction
            INNER JOIN user ON interaction.user = user.id
            WHERE user.username = ?
        ) AS userLikesPost
    FROM post 
    INNER JOIN user AS author ON post.author = author.id
    INNER JOIN image AS cover_image ON post.cover_image = cover_image.id
    LEFT JOIN image AS profile_picture ON author.profile_picture = profile_picture.id
    LEFT JOIN likes_per_post ON likes_per_post.post = post.id
    ORDER BY post.creation_date DESC
    LIMIT 10
            `,
            [ username, username ]
        );
        data.map(postCardDatum => {
            ensureProfilePicture(postCardDatum, "authorProfilePicture");
            if (postCardDatum.postLikesCount === null) {
                postCardDatum.postLikesCount = 0;
            }
            postCardDatum.userLikesPost = new Boolean(postCardDatum.userLikesPost).valueOf();
            postCardDatum.userOwnsPost = new Boolean(postCardDatum.userOwnsPost).valueOf();
            postCardDatum.postCreationDate = formatDistanceToNow(postCardDatum.postCreationDate, { locale: es });
        });
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

/**
 * 
 * @param {number} postId 
 * @returns {Promise<Maybe<PostRecord>>}
 */
export async function getPostById(postId) {
    const connection = new DbConnection();
    try {
        await connection.connect();
        const [ [ post ] ] = await connection.connection.execute("SELECT * FROM post WHERE post.id = ?", [ postId ]);
        if (post === undefined) {
            return Maybe.none();
        }
        
        renameProperty(post, "cover_image", "coverImage");
        renameProperty(post, "creation_date", "creationDate");

        return Maybe.just(post);
    } catch (error) {
        throw error;
    } finally {
        await connection.disconnect();
    }
}

export async function deletePostWithId(postId) {
    const connection = new DbConnection();
    try {
        await connection.connect();
        await connection.connection.execute("DELETE FROM post WHERE post.id = ?", [ postId ]);
    } catch (error) {
        throw error;
    } finally {
        await connection.disconnect();
    }
}

/**
 * 
 * @param {number} postId
 * @param {keyof PostRecord_SnakeCase} property 
 * @param {typeof PostRecord_SnakeCase[keyof PostRecord_SnakeCase]} newValue 
 */
export async function updatePropertyOfPost(postId, property, newValue) {
    const connection = new DbConnection();
    try {
        await connection.connect();
        await connection.connection.execute(`UPDATE post SET post.${property} = ? WHERE post.id = ?`, [ newValue, postId ]);
    } catch (error) {
        throw error;
    } finally {
        await connection.disconnect();
    }
}

/**
 * 
 * @param {number} postId
 * @param {AllNullable<PostRecord_SnakeCase>} post
 */
export async function updatePropertiesOfPost(postId, post) {
    const connection = new DbConnection();
    try {
        await connection.connect();
        const sql = format(`UPDATE post SET ? WHERE id = ?`, [ post, postId ]);
        await connection.connection.execute(sql);
    } catch (error) {
        throw error;
    } finally {
        await connection.disconnect();
    }
}
