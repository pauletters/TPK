declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string;
    JWT_SECRET_KEY: string;
    NODE_ENV: 'development' | 'production';
    PORT?: string;
  }