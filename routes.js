import { Router } from "express";

const route = Router();

route.get("/", (request, response) => {
    response.render("index");
})


export { 
    route 
};
