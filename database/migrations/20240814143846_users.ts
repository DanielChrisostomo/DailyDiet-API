import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();
    table.text("name").notNullable();
    table.text("email").notNullable().unique();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.uuid("session_id").after("id").index();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users");
}

// table.uuid('user_id').references('users.id').notNullable()