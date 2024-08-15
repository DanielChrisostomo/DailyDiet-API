import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { z } from "zod";
import { checkSessionIdExists } from "../middleware/check-session-id-exists";

export async function mealsRoutes(app: FastifyInstance) {
  const createMealBodySchema = z.object({
    name: z.string(),
    description: z.string(),
    meal_time: z.coerce.date(),
    on_diet: z.boolean(),
  });

  const paramsSchema = z.object({
    mealId: z.string(),
  });

  app.addHook("preHandler", async (request, reply) => {
    checkSessionIdExists(request, reply);
  });

  app.get("/", async (request, reply) => {
    const sessionId = request.cookies.sessionId;

    const [user] = await knex("users").where("session_id", sessionId).select();

    const id = user.id;

    const meals = await knex("meals").where("user_id", id).select("*");

    return reply.status(200).send(meals);
  });

  app.get("/:mealId", async (request, reply) => {
    const { mealId } = paramsSchema.parse(request.params);

    const meal = await knex("meals").where("id", mealId).select();

    return reply.status(200).send(meal);
  });

  app.post("/", async (request, reply) => {
    const { sessionId } = request.cookies;
    const [user] = await knex("users").where("session_id", sessionId).select();

    const id = user.id;

    const { name, description, meal_time, on_diet } =
      createMealBodySchema.parse(request.body);

    const meal = {
      id: randomUUID(),
      user_id: id,
      name,
      description,
      meal_time,
      on_diet,
    };

    await knex("meals").insert(meal);

    return reply.status(201).send("your meal was created with success !");
  });

  app.put("/:mealId", async (request, reply) => {
    const { mealId } = paramsSchema.parse(request.params);

    const { name, description, meal_time, on_diet } =
      createMealBodySchema.parse(request.body);

    const sessionId = request.cookies.sessionId;

    const [user] = await knex("users").where("session_id", sessionId).select();
    user.id;

    const data = {
      id: mealId,
      user_id: user.id,
      name,
      description,
      meal_time,
      on_diet,
    };

    await knex("meals").where("id", mealId).update(data);

    return reply.status(201).send("your meal was edited with success !");
  });

  app.delete("/:mealId", async (request, reply) => {
    const { mealId } = paramsSchema.parse(request.params);

    await knex("meals").where("id", mealId).delete();

    return reply.status(200).send("your meal was deleted with success !");
  });

  app.get("/metrics", async (request, reply) => {
    const { sessionId } = request.cookies;

    const [user] = await knex("users").where("session_id", sessionId).select();

    const id = user.id;

    const meals = await knex("meals").where("user_id", id).select("*");

    const onDietTotal = meals.filter((meal) => meal.on_diet === 1).length;
    const offDietTotal = meals.filter((meal) => meal.on_diet === 0).length;
    const totalMeals = meals.length;

    let maxSequence = 0;
    let currentSequence = 0;

    meals.forEach((meal) => {
      if (meal.on_diet === 1) {
        currentSequence++;
        if (currentSequence > maxSequence) {
          maxSequence = currentSequence;
        }
      } else {
        currentSequence = 0;
      }
    });

    const MetricsData = {
      totalMeals,
      onDietTotal,
      offDietTotal,
      maxSequence,
    };

    return reply.status(200).send(MetricsData);
  });
}
