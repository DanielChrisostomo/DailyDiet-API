import { Knex } from "knex";

declare module 'knex/tables/tables' {
    export interface Tables {
        users: {
            id: string
            name: string
            email: string
            created_at: string
            session_id?: string
        }
    }
}