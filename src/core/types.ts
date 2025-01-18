import { ExcludeNeverKeysObj, Pretify } from '../utilities';
import { DataParser as InferParameter, BridgeHandler, FilesConfig } from './handlers';
import { FormidableFile } from '../utilities';
import { OutputResponse } from './response';
import { TSchema } from '@sinclair/typebox';

export interface BridgeParams<
  Resolve = any,
  Middlewares extends ReadonlyArray<BridgeHandler<(p: any) => Record<any, any>>> = never,
  Body extends TSchema = never,
  Query extends TSchema = never,
  Headers extends TSchema = never,
  Files extends FilesConfig = ['BridgeFilesDoNotExists'],
  Output extends OutputResponse = never,
> {
  resolve: Resolve;
  middlewares?: Middlewares;
  // Can't have a body with GET method or with files
  // an error is throw if ther developer tries to,
  // but the type here doesnt block to keep a clean UI
  body?: Body;
  query?: Query;
  headers?: Headers;
  files?: Files;
  output?: Output;
}

type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

// Generic type to get the intersection of return types of an array of BridgeHandler
type IntersecOfResolveReturnTypesWithoutError<T extends Readonly<BridgeHandler<any, any>[]>> =
  T extends Readonly<BridgeHandler<infer F, any>[]>
    ? Omit<UnionToIntersection<ReturnTypeOf<F>>, 'error'>
    : never;

type MidParams<T extends Readonly<BridgeHandler<any, any>[]>> = T extends Readonly<
  BridgeHandler<infer F, any>[]
>
  ? Parameters<F>[number] & { body: {}; query: {}; headers: {}; output: {} }
  : never;

export type CreateHandler = <
  Resolve extends (
    p: Pretify<
      ExcludeNeverKeysObj<{
        middlewares: Pretify<IntersecOfResolveReturnTypesWithoutError<Middelwares>>;
        body: Pretify<
          InferParameter<Body> &
            (MidParams<Middelwares>['body'] extends never ? {} : MidParams<Middelwares>['body'])
        >;
        query: Pretify<
          InferParameter<Query> &
            (MidParams<Middelwares>['query'] extends never ? {} : MidParams<Middelwares>['query'])
        >;
        headers: Pretify<
          InferParameter<Headers> &
            (MidParams<Middelwares>['headers'] extends never
              ? {}
              : MidParams<Middelwares>['headers'])
        >;
        files: Pretify<
          Files extends ['BridgeFilesDoNotExists']
            ? {}
            : Files extends 'any'
            ? { [key: string]: FormidableFile[] }
            : { [key in Files[number]]: FormidableFile[] }
        >;
        output: Pretify<
          InferParameter<Output> &
            (MidParams<Middelwares>['output'] extends never ? {} : MidParams<Middelwares>['output'])
        >;
      }>
    >,
  ) => Output,
  Output extends OutputResponse = never,
  Body extends TSchema = never,
  Query extends TSchema = never,
  Headers extends TSchema = never,
  Files extends FilesConfig = ['BridgeFilesDoNotExists'],
  Middelwares extends ReadonlyArray<BridgeHandler> = never,
>(
  p: BridgeParams<Resolve, Middelwares, Body, Query, Headers, Files>,
) => BridgeHandler<Resolve, Middelwares>;
