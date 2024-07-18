import express from "express";
import { env } from "process";
import { route } from "./routes.js";
import authenticationRoutes from "./routes/authentication.js";
import session from "express-session";
import sqlite from "connect-sqlite3";
import passport from "passport";


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
  

app.use("/", route);
app.use("/", authenticationRoutes);
