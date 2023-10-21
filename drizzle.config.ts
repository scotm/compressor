import type { Config } from 'drizzle-kit';

export default {
    tablesFilter: ['compressor_*'],
    schema: './lib/db/schema/index.ts',
    out: './drizzle',
} satisfies Config;
