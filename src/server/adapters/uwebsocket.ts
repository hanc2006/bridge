import uWS from 'uWebSockets.js';
import AdmZip from 'adm-zip';
import { directoryExists } from '../../utilities';
import { ErrorHandler } from '../../error';
import pathLib from 'path';
import {
  getJSONDataFromRequestStream,
  getJSONQueryFromURL,
  formidableAsyncParseFiles,
} from '../http-transormers';
import { convertBridgeRoutesToServerRoutes, BridgeRoutes, Method } from '../../routes';
import { FormidableFile } from '../../utilities';

const logs: any[] = [];

export const createUwsHandler = (
  routes: BridgeRoutes,
  config?: { errorHandler?: ErrorHandler; formidable?: any; logs?: boolean },
) => {
  let path: string;
  let queryString: string;

  const serverRoutes = convertBridgeRoutesToServerRoutes(
    routes,
    '',
    config?.formidable !== undefined,
  );

  return async (res: uWS.HttpResponse, req: uWS.HttpRequest) => {
    let body: Record<any, any> = {};

    let files: { [file: string]: FormidableFile | FormidableFile[] } = {};

    const query = getJSONQueryFromURL(req.getUrl());

    try {
      [path, queryString] = (req.getUrl() || '/').split('?');

      if (path === '/get-logs')
        return res
          .writeHeader('Content-Type', 'application/json')
          .end(JSON.stringify([...logs].reverse()));

      if (path === '/sdk') {
        const sdkPath = pathLib.join(process.cwd(), 'sdk');
        const dirExists = directoryExists(sdkPath);

        if (!dirExists)
          return res
            .writeHeader('Content-Type', 'application/json')
            .writeStatus(500)
            .end(
              JSON.stringify({
                error: {
                  status: 500,
                  name: `The sdk folder doesn't exist. Use "npx bridge-compile@latest" to create it.`,
                },
              }),
            );

        const zip = new AdmZip();
        zip.addLocalFolder(sdkPath);
        const zipBuffer = zip.toBuffer();

        return res
          .writeHeader('Content-Type', 'application/octet-stream')
          .writeHeader('Content-Disposition', 'attachment; filename=data.bin')
          .writeHeader('Content-Length', String(zipBuffer.length))
          .end(zipBuffer);
      }

      const route = serverRoutes[path];
      const endpoint = route?.[req.getMethod() as Method];

      if (!endpoint)
        return res
          .writeHeader('Content-Type', 'application/json')
          .writeStatus(404)
          .end(JSON.stringify({ status: 404, name: 'Route not found' }));

      if (endpoint.config.filesConfig)
        files = await formidableAsyncParseFiles(req, config?.formidable!);
      else body = await getJSONDataFromRequestStream(req);

      const result = await endpoint.handle({
        body,
        files,
        query,
        headers: req.getHeader(),
        middlewares: {},
      });

      if (config?.logs) {
        if (logs.length > 100) logs.pop();
        logs.push({
          time: new Date().toLocaleString(),
          path,
          body,
          files,
          query,
          headers: {
            token: req.getHeader('token'),
          },
          result,
        });
      }

      if (!result)
        return res.writeHeader('Content-Type', 'application/json').end(JSON.stringify({}));

      if (result?.error) {
        config?.errorHandler?.({ error: result.error, path: path });
        res.writeStatus(result.error.status || 500);
        return res
          .writeHeader('Content-Type', 'application/json')
          .end(JSON.stringify({ error: result.error }));
      }

      res.writeHeader(
        'Content-Type',
        typeof result === 'object' ? 'application/json' : 'text/plain',
      );
      res.end(typeof result === 'object' ? JSON.stringify(result) : result);
    } catch (err) {
      config?.errorHandler?.({
        error: { status: 500, name: 'Internal server error', data: err },
        path: path,
      });
      res.writeStatus(500);
      return res
        .writeHeader('Content-Type', 'application/json')
        .end(JSON.stringify({ status: 500, name: 'Internal server error' }));
    }
  };
};
