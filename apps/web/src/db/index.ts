import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import * as schema from './schema/index.ts'

// Neon's HTTP driver sends each query as a single HTTPS request. That suits
// Cloudflare Workers, which cannot hold a long-lived TCP connection open the
// way a classic Postgres driver does. Trade-off: interactive transactions are
// not available over HTTP; use `db.batch([...])` for atomic multi-statement work.
export const db = drizzle(neon(process.env.DATABASE_URL!), { schema })
