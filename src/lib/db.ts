import mongoose, { Connection, Mongoose } from 'mongoose';

const MONGODB_URI: string = process.env.MONGODB_URL || 'mongodb://admin:admin@localhost:27017/gg-software?authSource=admin';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URL environment variable inside .env or .env.local',
  );
}

interface CachedConnection {
  conn: Connection | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: { conn: Connection | null; promise: Promise<Mongoose> | null } | undefined;
}

let cached: CachedConnection = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<Connection> {
  if (cached.conn) {
    console.log("This is Existing connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Db connected');
      return mongoose;
    });
  }

  try {
    const mongoose = await cached.promise;
    cached.conn = mongoose.connection;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  console.log("This is New connection");
  return cached.conn;
}

export default dbConnect;
