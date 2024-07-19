import express from "express";
import passport from "passport";
import LocalStrategy from "passport-local";
import { getUserByUsername, insertUser } from "../db/user.js";
import { getMessageParams } from "../js/get-message-params.js";

const router = express.Router();

passport.use(new LocalStrategy(async (username, password, callback) => {
    try {
        const user = await getUserByUsername(username);
        if (user === undefined) return callback(null, false, { message: "El usuario indicado no está registrado todavía" });
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

router.get("/app", (request, response) => response.redirect("/app/login"));

router.get("/app/login", redirectIfLoggedIn, (request, response) => response.render("log-in") );

router.get( "/app/signup", redirectIfLoggedIn, (request, response) => response.render("sign-up") );

router.post("/app/login", redirectIfLoggedIn, passport.authenticate("local", { successRedirect: "/app/feed", failureRedirect: "/app/login" }));

router.post("/app/signup", redirectIfLoggedIn, async (request, response, next) => {
    try {
        const [ error, success ] = await insertUser(request.body);
        const messageParams = success? 
            getMessageParams("El usuario ha sido dado de alta", "success"): 
            getMessageParams(error, "error");

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

router.get("/app/feed", redirectIfNotLoggedIn, (request, response) => {
    response.render("feed");
});
// router.get("/app/store");
// router.get("/app/account");


export default router;
