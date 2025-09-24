import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hexerve:hexerve@cluster0.zy7afj9.mongodb.net/trufle-admin'
const MONGODB_DB = process.env.MONGODB_DB || 'trufle-admin'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

let cachedClient = null
let cachedDb = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  
  const db = client.db(MONGODB_DB)
  
  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function getCollection(collectionName) {
  const { db } = await connectToDatabase()
  return db.collection(collectionName)
}
