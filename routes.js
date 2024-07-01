import { Router } from "express";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { OpinionController } from "./db/opinion.js";

const route = Router();

const __filepath = fileURLToPath(import.meta.url);
const __dirname = dirname(__filepath);

route.get("/", (_, response) => {
    response.render("index");
})

route.post("/", (request, response) => {
    const controller = new OpinionController();
    console.log(request.body);
    controller.add(request.body);

    response.render("index");
});

route.use("/css", express.static(path.join(__dirname, "css")));
route.use("/js", express.static(path.join(__dirname, "js")));
route.use("/assets", express.static(path.join(__dirname, "assets")));

export { 
    route 
};
