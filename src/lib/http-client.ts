import ky from 'ky'
import { getCloudUrl } from './config'

// Cache for the HTTP client as a singleton instance to avoid recreating it
let singleton: typeof ky | null = null

// Function to get or create a singleton (cached) ky instance with the correct baseURL
export const getHttpClient = async (): Promise<typeof ky> => {
  if (singleton) {
    return singleton
  }

  const cloudUrl = await getCloudUrl()

  singleton = ky.create({
    prefixUrl: cloudUrl,
  })

  return singleton
}
