import mongoose from 'mongoose';
import 'dotenv/config';

const db = async (): Promise<typeof mongoose.connection> => {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;

      console.log('Current NODE_ENV:', process.env.NODE_ENV);
      console.log('Attempting to connect with URI:', 
        MONGODB_URI?.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://[username]:[password]@')
      );
      
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not defined');
      }

      const conn = await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000 // 5 second timeout
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      console.log('Database connection state:', conn.connection.readyState);
      return conn.connection;
      
    } catch (error) {
      console.error('Database connection error details:');
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if ('code' in error) console.error('Error code:', (error as any).code);
        if ('reason' in error) console.error('Error reason:', (error as any).reason);
      }
      console.error('Full error:', error);
      process.exit(1);
    }
};

export default db;
