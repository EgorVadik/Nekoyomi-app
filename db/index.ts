import * as schema from '@/db/schema'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'

const expo = openDatabaseSync('db.db')
export const db = drizzle(expo, { schema })
