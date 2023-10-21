import { timestamp, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name'),
    email: varchar('email'),
    password: varchar('password'),
    role: varchar('role').$type<'admin' | 'customer'>(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at'),
});

// infer type of user
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
