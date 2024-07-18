import { Router } from "express";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { OpinionController } from "./db/opinion.js";

const router = Router();

const __filepath = fileURLToPath(import.meta.url);
const __dirname = dirname(__filepath);

router.get(/^\/(home)?$/, (_, response) => {
    response.render("index");
})

router.post(/^\/(home)?$/, (request, response) => {
    const controller = new OpinionController();
    console.log(request.body);
    controller.add(request.body);

    response.render("index");
});

router.get("/about-us", (_, response) => {
    response.render("about-us");
});


// route.get("/app");

router.use("/css", express.static(path.join(__dirname, "css")));
router.use("/js", express.static(path.join(__dirname, "js")));
router.use("/assets", express.static(path.join(__dirname, "assets")));

export { 
    router as route 
};
