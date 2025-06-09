import { getDrizzleDatabase } from '@/db/singleton'
import { settingsTable } from '@/db/tables'
import { eq } from 'drizzle-orm'

/**
 * Get the default cloud URL from environment variables or fallback to localhost
 */
export const getDefaultCloudUrl = (): string => {
  return import.meta.env.VITE_THUNDERBOLT_CLOUD_URL || 'http://localhost:8000'
}

/**
 * Get the cloud URL from database settings, falling back to default if not found
 */
export const getCloudUrl = async (): Promise<string> => {
  try {
    const { db } = await getDrizzleDatabase()
    const cloudUrlSetting = await db.select().from(settingsTable).where(eq(settingsTable.key, 'cloud_url')).get()
    
    if (cloudUrlSetting?.value) {
      return cloudUrlSetting.value as string
    }
  } catch (error) {
    console.error('Error getting cloud URL from database:', error)
  }
  
  // Fall back to default
  return getDefaultCloudUrl()
}