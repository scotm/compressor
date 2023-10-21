import {
    integer,
    pgEnum,
    pgTable,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';

const roleEnum = pgEnum('role', ['admin', 'customer']);

const statusEnum = pgEnum('status', ['awaiting', 'starting', 'complete']);

export const job = pgTable('job', {
    id: uuid('id').primaryKey().defaultRandom(),
    status: statusEnum('status').default('awaiting'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at'),
});

export const file = pgTable('file', {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: integer('job_id').references(() => job.id),
    url: varchar('url', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at'),
});
