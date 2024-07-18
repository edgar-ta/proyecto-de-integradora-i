import express from "express";
import passport from "passport";
import LocalStrategy from "passport-local";
import { getUserByUsername, insertUser } from "../db/user.js";

const router = express.Router();

passport.use(new LocalStrategy(async (username, password, callback) => {
    try {
        const user = await getUserByUsername(username);
        if (user === undefined) return callback(null, false, { message: "El usuario indicado no está registrado todavía" });
        if (user.password != password) return callback(null, false, { message: "El nombre de usuario y la contraseña no coinciden todavía" });
        return callback(null, user);
    } catch (error) {
        return callback(error);
    }
}));

router.get(
    "/app/login", 
    (request, response) => response.render("log-in")
);
router.get(
    "/app/signup", 
    (request, response) => response.render("sign-up")
);

router.post("/app/login", passport.authenticate("local", {
    successRedirect: "/app/feed",
    failureRedirect: "/app/login"
}))

router.post("/app/signup", async (request, response, next) => {
    try {
        // TODO no validation is being done on the username
        // TODO as such, the profile picture is not being uploaded
        await insertUser(request.body);
        const user = { 
            username: request.body.username,
            gender: request.body.gender
        };
        request.logIn(user, (error) => {
            if (error) return next(error);
            response.redirect("/app/feed");
        });
    } catch (e) {
        return next(e);
    }
    // 
});

router.get("/app/logout", (request, response, next) => {
    request.logOut((error) => {
        if (error) return next(error);
        console.log("El usuario cerró su sesión correctamente");
        response.redirect("/app/login");
    })
});

router.get("/app/feed", (request, response) => {
    response.render("feed");
});
// router.get("/app/store");
// router.get("/app/account");


export default router;
