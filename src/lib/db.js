import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URL
// || 'mongodb://admin:admin@localhost:27017/gg-software?authSource=admin';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URL environment variable inside .env or .env.local',
  )
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    console.log("This is Existing connection");
    return cached.conn
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts).then(mongoose => {
      console.log('Db connected')
      return mongoose
    })
  }
  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  console.log("This is New connection");
  return cached.conn
}

export default dbConnect

