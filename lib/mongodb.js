import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/truffle-admin'
const MONGODB_DB = process.env.MONGODB_DB || 'truffle-admin'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

let cachedClient = null
let cachedDb = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    try {
      // Test the connection
      await cachedClient.db('admin').ping()
      return { client: cachedClient, db: cachedDb }
    } catch (error) {
      console.log('Cached connection failed, creating new connection')
      cachedClient = null
      cachedDb = null
    }
  }

  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
    maxPoolSize: 10,
    retryWrites: true,
    retryReads: true
  })
  
  try {
    await client.connect()
    console.log('Connected to MongoDB successfully')
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
  
  const db = client.db(MONGODB_DB)
  
  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function getCollection(collectionName) {
  try {
    const { db } = await connectToDatabase()
    return db.collection(collectionName)
  } catch (error) {
    console.error(`Failed to get collection ${collectionName}:`, error)
    throw error
  }
}
