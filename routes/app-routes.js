import express from "express";
import passport from "passport";
import LocalStrategy from "passport-local";
import { getUserByUsername, insertUser } from "../db/user.js";
import { getMessageParams } from "../js/get-message-params.js";
import { deletePostWithId, getPostById, getPostCardDataForUser, insertPost, updatePropertiesOfPost, updatePropertyOfPost } from "../db/post.js";
import { v2 as cloudinary } from "cloudinary";
import { deleteImageWithPublicId, getImageById, getImageByPublicId, insertImage, uploadImageToCloudinary } from "../db/image.js";

import multer from "multer";
import { likePost, unlikePost } from "../db/interaction.js";
import { v4 as uuidv4 } from "uuid";


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

const redirectIfDoesNotOwnPost = async (request, response, next) => {
    try {
        const user = (await getUserByUsername(request.user.username)).unwrap();
        const post = (await getPostById(request.params.postId)).unwrap();
        if (user.id != post.author) {
            response.redirect("/app/feed");
            return;
        }
        next(null);
    } catch (error) {
        next(error);
    }
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
    const postCardData = await getPostCardDataForUser(request.user.username);
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
        const uploadResult = await uploadImageToCloudinary(request.file.path, request.file.originalname);

        try {
            await insertImage(uploadResult.secure_url, uploadResult.public_id);
            const image = (await getImageByPublicId(uploadResult.public_id)).unwrap();
            
            await insertPost({
                author: user.id,
                content: request.body.content,
                coverImage: image.id,
                summary: request.body.summary
            });
            console.log("El post se insertó correctamente :)");
            response.redirect(`/app/feed?${getMessageParams("El post ha sido publicado", "success")}`);

        } catch (e) {
            await cloudinary.uploader.destroy(uploadResult.public_id)
                .finally(() => deleteImageWithPublicId(uploadResult.public_id));
            
            throw e;
        }
    } catch (error) {
        next(error);
    }
});

router.get("/app/post/like/:postId", redirectIfNotLoggedIn, async (request, response, next) => {
    try {
        let post = await getPostById(request.params.postId);
        if (post.isJust()) {
            post = post.unwrap();
            await likePost(request.user.username, request.params.postId);
        }
        response.redirect("/app/feed");
    } catch (error) {
        next(error);
    }
});

router.get("/app/post/unlike/:postId", redirectIfNotLoggedIn, async (request, response, next) => {
    try {
        let post = await getPostById(request.params.postId);
        if (post.isJust()) {
            post = post.unwrap();
            await unlikePost(request.user.username, request.params.postId);
        }
        response.redirect("/app/feed");
    } catch (error) {
        next(error);
    }
});

router.get("/app/post/delete/:postId", redirectIfNotLoggedIn, redirectIfDoesNotOwnPost, async (request, response, next) => {
    try {
        const post = (await getPostById(request.params.postId)).unwrap();
        const image = (await getImageById(post.coverImage)).unwrap();

        await cloudinary.uploader.destroy(image.publicId);
        await deleteImageWithPublicId(image.publicId);

        await deletePostWithId(request.params.postId);
        response.redirect("/app/feed");
    } catch (error) {
        next(error);
    }
});

router.get("/app/post/edit/:postId", redirectIfNotLoggedIn, redirectIfDoesNotOwnPost, async (request, response, next) => {
    try {
        const post = (await getPostById(request.params.postId)).unwrap();
        const coverImage = (await getImageById(post.coverImage)).unwrap();

        console.log(post);

        response.render("feed/new-post", { 
            post, 
            coverImage,
            selectedPage: "feed" 
        });
    } catch (error) {
        next(error);
    }
});

router.post("/app/post/edit/:postId", redirectIfNotLoggedIn, redirectIfDoesNotOwnPost, upload.single("coverImage"), async (request, response, next) => {
    try {
        const post = (await getPostById(request.params.postId)).unwrap();
        const previousCoverImage = (await getImageById(post.coverImage)).unwrap();

        if (request.file !== undefined) {
            // a new image was selected; thus, the old one must be deleted
            const uploadResult = await uploadImageToCloudinary(request.file.path, request.file.originalname);
            try {
                await insertImage(uploadResult.secure_url, uploadResult.public_id);
                const newImage = (await getImageByPublicId(uploadResult.public_id)).unwrap();

                await updatePropertyOfPost(request.params.postId, "cover_image", newImage.id);

            } catch (error) {
                await cloudinary.uploader.destroy(uploadResult.public_id)
                    .finally(() => deleteImageWithPublicId(uploadResult.public_id));

                throw error;
            }

            await deleteImageWithPublicId(previousCoverImage.publicId);
        }

        await updatePropertiesOfPost(request.params.postId, {
            content: request.body.content,
            summary: request.body.summary
        });

        response.redirect("/app");
    } catch (error) {
        next(error);
    }
});

export default router;
