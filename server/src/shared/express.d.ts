import 'express';

declare module 'express' {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: string;
    };
  }

  interface ParamsDictionary {
    [key: string]: string;
  }
}
