import { sql } from 'drizzle-orm'
import { customType, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

const float32Array = customType<{
  data: number[]
  config: { dimensions: number }
  configRequired: true
  driverData: Buffer
}>({
  dataType(config) {
    return `F32_BLOB(${config.dimensions})`
  },
  fromDriver(value: Buffer) {
    return Array.from(new Float32Array(value.buffer))
  },
  toDriver(value: number[]) {
    return sql`vector32(${JSON.stringify(value)})`
  },
})

export const settings = sqliteTable('setting', {
  id: integer('id').primaryKey().unique(),
  value: text('value'),
  updated_at: text('updated_at').default('CURRENT_TIMESTAMP'),
  // embedding: sqliteVector('embedding', 3),
  embedding: float32Array('embedding', { dimensions: 3 }),
})
