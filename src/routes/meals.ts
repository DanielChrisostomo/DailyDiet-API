import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { z } from "zod";
import { checkSessionIdExists } from "../middleware/check-session-id-exists";

export async function mealsRoutes (app: FastifyInstance) {

    app.addHook('preHandler', async (request, reply) => {
        checkSessionIdExists(request, reply) 
    })

    app.get("/", async (request, reply) => {
        
        console.log("GET MEALS")

        return reply.status(200).send("GET MEALS ROUTES")
    })
}