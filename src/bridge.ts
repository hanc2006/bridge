import { BridgeRoutes } from './routes';
import { ErrorHandler } from './error';
import { RoutesToBridgeType } from './routes';
import type * as express from 'express';
import { createHttpHandler } from './server/adapters/node-http';
import http from 'http';

class Bridge<Routes extends BridgeRoutes> {
  public bridgeType!: RoutesToBridgeType<Routes>;

  constructor(
    public routes: Routes,
    private config: { errorHandler?: ErrorHandler; formidable?: any; logs?: boolean },
  ) { }

  public expressMiddleware = (): express.Handler => createHttpHandler(this.routes, this.config);

  public HTTPServer = () => http.createServer(createHttpHandler(this.routes, this.config));
}

export const initBridge = <Routes extends BridgeRoutes>({
  routes,
  errorHandler,
  formidable,
  logs,
}: {
  routes: Routes;
  formidable?: any;
  errorHandler?: ErrorHandler;
  logs?: boolean;
}): Bridge<Routes> => new Bridge(routes, { formidable, errorHandler, logs });
