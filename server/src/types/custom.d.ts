declare module 'bcrypt' {
    export function hash(data: string, saltOrRounds: string | number): Promise<string>;
    export function compare(data: string, encrypted: string): Promise<boolean>;
  }
  
  declare module 'jsonwebtoken' {
    export interface JwtPayload {
      [key: string]: any;
    }
    
    export function sign(
      payload: string | Buffer | object,
      secretOrPrivateKey: string,
      options?: object
    ): string;
  
    export function verify(
      token: string,
      secretOrPublicKey: string,
      options?: object
    ): string | JwtPayload;
  }
  
  declare module 'cors' {
    import { RequestHandler } from 'express';
    
    interface CorsOptions {
      origin?: boolean | string | RegExp | (string | RegExp)[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
      methods?: string | string[];
      allowedHeaders?: string | string[];
      exposedHeaders?: string | string[];
      credentials?: boolean;
      maxAge?: number;
      preflightContinue?: boolean;
      optionsSuccessStatus?: number;
    }
  
    function cors(options?: CorsOptions): RequestHandler;
    export = cors;
  }