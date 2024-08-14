import { FastifyReply, FastifyRequest } from "fastify"

export async function checkSessionIdExists(request: FastifyRequest, reply: FastifyReply) {

    const sessionID = request.cookies.sessionId

    if(!sessionID) {
        return reply.status(404).send("User Unauthorized")
    }
}