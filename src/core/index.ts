import { CreateHandler } from './types';
import { BridgeHandler } from './handlers';

// This is a BridgeHandler
export const handler: CreateHandler = (routeParams) => {
  return new BridgeHandler({
    bodySchema: routeParams.body,
    querySchema: routeParams.query,
    headersSchema: routeParams.headers,
    outputSchema: routeParams.output,
    filesConfig: routeParams.files,
    middlewares: routeParams.middlewares,
    resolve: routeParams.resolve,
  });
};

export * from './types';
export * from './handlers';
export * from './handler';