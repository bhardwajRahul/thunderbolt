import axios from 'axios'
import { eq } from 'drizzle-orm'
import { DrizzleContextType } from '@/types'
import { settingsTable } from '@/db/tables'

// Default baseURL in case we can't get it from the database
const DEFAULT_BASE_URL = 'http://localhost:3001'

// Create an axios instance with a default baseURL that will be updated later
const instance = axios.create({
  baseURL: DEFAULT_BASE_URL,
})

// Function to get server URL from database
export const getServerUrl = async (db: DrizzleContextType['db']): Promise<string> => {
  try {
    const serverUrlSetting = await db.select().from(settingsTable).where(eq(settingsTable.key, 'server_url')).get()

    return (serverUrlSetting?.value as string) || DEFAULT_BASE_URL
  } catch (error) {
    console.error('Error getting server URL from database:', error)
    return DEFAULT_BASE_URL
  }
}

// Function to initialize axios with the correct baseURL
export const initializeAxios = async (db: DrizzleContextType['db']): Promise<void> => {
  const serverUrl = await getServerUrl(db)
  instance.defaults.baseURL = serverUrl
}

export default instance
