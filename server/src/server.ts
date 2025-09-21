import express from 'express';
import path from 'node:path';
import type { Request, Response } from 'express';
import db from './config/connection.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schemas/index.js';
import { authenticateToken } from './utils/auth.js';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
console.log('Registered Mongoose models:', Object.keys(mongoose.models));

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const startApolloServer = async () => {

  // Create a new ApolloServer instance with the schema definition and resolvers
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return error;
    },
    plugins: [{
      requestDidStart: async () => ({
        willSendResponse: async (requestContext) => {
          console.log('GraphQL Response:', requestContext.response);
          return Promise.resolve();
        },
      }),
    }],
  });

  await server.start();
  await db();
console.log('Connected to the database!');

  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));

  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
  }));

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => authenticateToken({ req })
    })
  );

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
    console.log('Static files being served from:', clientDistPath);
    
    app.use(express.static(clientDistPath));

    app.get('*', (_req: Request, res: Response) => {
      const indexPath = path.join(clientDistPath, 'index.html');
      console.log('Attempting to serve index.html from:', indexPath);
      res.sendFile(indexPath);
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
  console.log(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`);
});
}
  console.log('Apollo Server successfully started!');


startApolloServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});
