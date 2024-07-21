import express from "express";
import * as fs from "fs";
import passport from "passport";
import LocalStrategy from "passport-local";
import { getUserByUsername, insertUser } from "../db/user.js";
import { getMessageParams } from "../js/get-message-params.js";
import { getPostCardData, insertPost } from "../db/post.js";
import { v2 as cloudinary } from "cloudinary";
import { deleteImageWithPublicId, getImageById, getImageByPublicId, insertImage } from "../db/image.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

import multer from "multer";
import path from "path";
import ensureProfilePicture from "../js/ensure-profile-picture.js";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale/es"

const upload = multer({ dest: "uploads/" });
const router = express.Router();

passport.use(new LocalStrategy(async (username, password, callback) => {
    try {
        let user = await getUserByUsername(username);
        if (user.isNone()) return callback(null, false, { message: "El usuario indicado no está registrado todavía" });

        user = user.unwrap();

        if (user.password != password) return callback(null, false, { message: "El nombre de usuario y la contraseña no coinciden" });
        return callback(null, user);
    } catch (error) {
        return callback(error);
    }
}));

/**
 * Redorects the user to the feed if they are logged in
 * @param {import("express").Request} request 
 * @param {import("express").Response} response 
 * @param {import("express").NextFunction} next 
 */
const redirectIfLoggedIn = (request, response, next) => {
    if (request.user !== undefined) {
        response.redirect("/app/feed");
        return;
    }
    next(null);
}

/**
 * Redirects the user to the log in section if they are not logged in
 * @param {import("express").Request} request 
 * @param {import("express").Response} response 
 * @param {import("express").NextFunction} next 
 */
const redirectIfNotLoggedIn = (request, response, next) => {
    if (request.user === undefined) {
        response.redirect("/app/login");
        return;
    }
    next(null);
}

router.get("/app", redirectIfLoggedIn, (request, response) => response.redirect("/app/login"));

router.get("/app/login", redirectIfLoggedIn, (request, response) => response.render("log-in"));

router.get("/app/signup", redirectIfLoggedIn, (request, response) => response.render("sign-up"));

router.post("/app/login", redirectIfLoggedIn, passport.authenticate("local", { successRedirect: "/app/feed", failureRedirect: "/app/login" }));

router.post("/app/signup", redirectIfLoggedIn, async (request, response, next) => {
    try {
        const previousUser = await getUserByUsername(request.body.username);
        let messageParams;

        if (previousUser.isJust()) {
            messageParams = getMessageParams("El nombre de usuario ya está utilizado por alquien más", "error");
        } else {
            messageParams = getMessageParams("El usuario se dio de alta exitosamente", "success");
            await insertUser(request.body);
        }

        response.redirect(`/app/login?${messageParams}`);
    } catch (e) {
        return next(e);
    }
});

router.get("/app/logout", redirectIfNotLoggedIn, (request, response, next) => {
    request.logOut((error) => {
        if (error) return next(error);
        response.redirect("/app/login");
        console.log("El usuario cerró su sesión correctamente");
    })
});

router.get("/app/feed", redirectIfNotLoggedIn, async (request, response) => {
    const postCardData = (await getPostCardData()).map(postCardDatum => {
        ensureProfilePicture(postCardDatum, "authorProfilePicture");
        postCardDatum.postFormattedCreationDate = formatDistanceToNow(postCardDatum.postCreationDate, { locale: es, includeSeconds: true });
        return postCardDatum;
    });
    console.log(postCardData);
    response.render("feed", { selectedPage: "feed", postCardData });
});

router.get("/app/account", redirectIfNotLoggedIn, async (request, response) => {
    let user = (await getUserByUsername(request.user.username)).unwrap();
    let image = null;

    if (user.profilePicture != null) {
        image = (await getImageById(user.profilePicture)).unwrap();
    }

    response.render("account", { selectedPage: "account", user, image });
});

router.get("/app/store", redirectIfNotLoggedIn, async (request, response, next) => {
    response.render("store", { selectedPage: "store" });
});

router.get("/app/post/new", redirectIfNotLoggedIn, async (request, response) => {
    response.render("feed/new-post", { selectedPage: "feed" });
});

router.post("/app/post/new", redirectIfNotLoggedIn, upload.single("coverImage"), async (request, response, next) => {
    try {
        const user = (await getUserByUsername(request.user.username)).unwrap();

        const __filepath = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filepath);

        const temporaryPath = request.file.path;
        const originalFileExtension = path.extname(request.file.originalname);
        const targetPath = path.join(__dirname, `../uploads/image.${originalFileExtension}`);

        fs.rename(temporaryPath, targetPath, (error) => {
            if (error) throw error;
        });

        const uploadResult = await cloudinary.uploader.upload(targetPath);
        try {
            await insertImage(uploadResult.secure_url, uploadResult.public_id);
            const image = (await getImageByPublicId(uploadResult.public_id)).unwrap();
            
            await insertPost({
                author: user.id,
                content: request.body.content,
                coverImage: image.id,
                summary: request.body.content
            });
            console.log("El post se insertó correctamente :)");
            response.redirect(`/app/feed?${getMessageParams("El post ha sido publicado", "success")}`);

        } catch (e) {
            await cloudinary.uploader.destroy(uploadResult.public_id);
            await deleteImageWithPublicId(uploadResult.public_id);
            
            throw e;
        }
    } catch (error) {
        next(error);
    }
});

export default router;
