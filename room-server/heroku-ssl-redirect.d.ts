import * as express from 'express';

declare function sslRedirect(): express.RequestHandler;
declare module "heroku-ssl-redirect";