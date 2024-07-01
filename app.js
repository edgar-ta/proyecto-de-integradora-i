import express from "express";
import { env } from "process";
import { route } from "./routes.js";

const app = express();

const port = env.PORT || 3_000;

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use("/", route);
