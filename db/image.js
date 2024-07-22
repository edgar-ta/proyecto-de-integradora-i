import { DbConnection } from "./db-connection.js";
import renameProperty from "../js/rename-property.js";
import * as Maybe from "monads-io/maybe";

import * as fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { v2 as cloudinary } from "cloudinary";
import path from "path";


/**
 * @typedef {Object} ImageRecord
 * @property {number} id
 * @property {string} secureUrl
 * @property {string} publicId
 */

/**
 * 
 * @param {number} id 
 * @returns {Promise<Maybe.Maybe<ImageRecord>>}
 */
export async function getImageById(id) {
    const connection = new DbConnection();
    try {
        await connection.connect();
        const [ [ image ] ] = await connection.connection.execute("SELECT * FROM image WHERE image.id = ?", [ id ]);
        if (image === undefined) {
            return Maybe.none();
        }

        renameProperty(image, "secure_url", "secureUrl");
        renameProperty(image, "public_id", "publicId");

        return Maybe.just(image);
    } catch (error) {
        throw error;

    } finally {
        await connection.disconnect();
    }
}

/**
 * 
 * @param {number} publicId 
 * @returns {Promise<Maybe.Maybe<ImageRecord>>}
 */
export async function getImageByPublicId(publicId) {
    const connection = new DbConnection();
    try {
        await connection.connect();
        const [ [ image ] ] = await connection.connection.execute("SELECT * FROM image WHERE image.public_id = ?", [ publicId ]);
        if (image === undefined) {
            return Maybe.none();
        }

        renameProperty(image, "secure_url", "secureUrl");
        renameProperty(image, "public_id", "publicId");

        return Maybe.just(image);
    } catch (error) {
        throw error;

    } finally {
        await connection.disconnect();
    }
}



/**
 * 
 * @param {string} secureUrl 
 * @param {string} publicId 
 */
export async function insertImage(secureUrl, publicId) {
    const connection = new DbConnection();
    try {
        await connection.connect();
        await connection.connection.execute("INSERT INTO image VALUES (NULL, ?, ?)", [ secureUrl, publicId ]);

    } catch (error) {
        throw error;

    } finally {
        await connection.disconnect();
    }
}

/**
 * 
 * @param {string} publicId 
 */
export async function deleteImageWithPublicId(publicId) {
    const connection = new DbConnection();
    try {
        await connection.connect();
        await connection.connection.execute("DELETE FROM image WHERE image.public_id = ?", [ publicId ]);
    } catch (error) {
        throw error;
    } finally {
        await connection.disconnect();
    }
}

/**
 * 
 * @param {string} temporaryPath 
 * @returns {Promise<UploadApiResponse>}
 */
export async function uploadImageToCloudinary(temporaryPath, originalName) {
    const __filepath = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filepath);

    const originalFileExtension = path.extname(originalName);
    const targetPath = path.join(__dirname, `../_uploaded/image.${originalFileExtension}`);

    fs.rename(temporaryPath, targetPath, (error) => {
        if (error) throw error;
    });

    return cloudinary.uploader.upload(targetPath);
}
