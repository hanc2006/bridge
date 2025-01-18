import { ErrorCodes } from '../../error/status';
import { AbstractHandler, Handler, HandlerParams } from '../handler';
import { httpError } from '../../error';
import { TSchema, Static, TProperties } from '@sinclair/typebox';
import { Check } from '@sinclair/typebox/build/cjs/value';

// export type DataParser = TSchema;
// export type InferDataParser<D extends OutputResponse> = D extends TSchema ? Static<D> : any;

export type DataParser<T> = T extends TSchema
  ? Static<T>
  : T extends TProperties
  ? { [K in keyof T]: DataParser<T[K]> }
  : T extends Array<infer U>
  ? Array<DataParser<U>>
  : T extends Function
  ? T
  : {};

export class DataValidator<Output = any> extends AbstractHandler {
  public output!: Output;

  constructor(private parser: TSchema, private dataToValidate: keyof HandlerParams) {
    super();
  }

  public handle: Handler['handle'] = async (data) => {
    try {
      if (!Check(this.parser, data[this.dataToValidate])) {
        throw new Error('Validation failed');
      }

      return super.handle(data);
    } catch (error) {
      switch (this.dataToValidate) {
        case 'body':
          return httpError(ErrorCodes.BAD_REQUEST, `Body schema validation error`, error);
        case 'query':
          return httpError(ErrorCodes.BAD_REQUEST, `Query schema validation error`, error);
        case 'headers':
          return httpError(ErrorCodes.BAD_REQUEST, `Headers schema validation error`, error);
      }
    }
  };
}
