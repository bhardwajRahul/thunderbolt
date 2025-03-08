import './index.css'

import { JSXElement, onMount } from 'solid-js'

import { sql } from 'drizzle-orm'
import { db } from './db/database'
import { settings } from './db/schema'
import { createAppDataDir } from './lib/fs'
import Database from './lib/libsql'
import { createTray } from './lib/tray'

const init = async () => {
  createTray()
  createAppDataDir()

  console.log('11111')

  const libsql = await Database.load('data/local.db')
  console.log('🚀 ~ db:', libsql)

  console.log('00000')

  await db.insert(settings).values([{ embedding: sql`vector32(${JSON.stringify([1.1, 2.2, 3.3])})` }])

  console.log('aaaa')

  const res = await db
    .select({
      id: settings.id,
      distance: sql<number>`vector_distance_cos(${settings.embedding}, vector32(${JSON.stringify([2.2, 3.3, 4.4])}))`,
    })
    .from(settings)

  console.log('bbbb')

  console.log(res)

  const topK = await db
    .select({
      id: settings.id,
      distance: sql`distance`,
    })
    .from(sql`vector_top_k('vector_index', vector32(${JSON.stringify([2.2, 3.3, 4.4])}), 5)`)
    .leftJoin(settings, sql`${settings}.id = id`)

  console.log(topK)
}

export default function App({ children }: { children?: JSXElement }) {
  onMount(() => {
    init()
  })

  return <main class="flex h-screen w-screen">{children}</main>
}
