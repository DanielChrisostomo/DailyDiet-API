import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { z } from "zod";

export async function usersRoutes (app: FastifyInstance) {

    app.get("/", async (request, reply) => {
        const users = await knex("users").select("*")

        if(users) {
            return reply.status(200).send(users)
        } else {
            reply.status(404).send("The data you request does not exists")
        }
    })

    app.post("/", async (request, reply) => {

        let sessionId = request.cookies.sessionId

        if(!sessionId) {
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/meals',
                maxAge: 60 * 60 * 24 * 5 // 5 days
            })
        }

       const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string()
        })

        const { name, email } = createUserBodySchema.parse(request.body)

        const user = {
            id: randomUUID(),
            name,
            email,
            session_id: sessionId
        }

        await knex("users").insert(user)

        return reply.status(201).send(`created user with name: ${name} and email: ${email}`)

    })
}