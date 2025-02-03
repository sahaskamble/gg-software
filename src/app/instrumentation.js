import connectDB from '@/lib/mongodb';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      await connectDB();
      console.log('MongoDB connected successfully in instrumentation');
    } catch (error) {
      console.error('Failed to connect to MongoDB in instrumentation:', error);
    }
  }
}
