import express from "express";
import { env } from "process";
import userRoutes from "./routes.js";

const app = express();

const port = env.PORT || 3_000;

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});

app.set("view engine", "ejs");

app.use("/", userRoutes);
