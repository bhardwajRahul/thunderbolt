import cors from '@koa/cors'

// Configure CORS middleware to allow requests from any origin
export const corsMiddleware = cors({
  origin: '*', // Allow any origin
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
})
