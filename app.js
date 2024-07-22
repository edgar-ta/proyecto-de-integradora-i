import express from "express";
import basicRoutes from "./routes/basic-routes.js";
import appRoutes from "./routes/app-routes.js";
import session from "express-session";
import sqlite from "connect-sqlite3";
import passport from "passport";
import path from "path";
import dotenv from "dotenv";

import { env } from "process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { v2 as cloudinary } from "cloudinary";


const SQLiteStore = sqlite(session);
const app = express();

passport.serializeUser((user, callback) => {
    process.nextTick(() => {
        callback(null, { 
            username: user.username,
            gender: user.gender,
        });
    });
});

passport.deserializeUser((user, callback) => {
    process.nextTick(() => {
        callback(null, user);
    });
});

const port = env.PORT || 3_000;

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "./sessions" })
}));
app.use(passport.authenticate("session"));
  

const __filepath = fileURLToPath(import.meta.url);
const __dirname = dirname(__filepath);

app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/simplemde", express.static(path.join(__dirname, "node_modules/simplemde/dist")));

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

app.use("/", basicRoutes);
app.use("/", appRoutes);
