import { Router } from "express";
import { OpinionController } from "../db/opinion.js";

const router = Router();

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



export default router;
