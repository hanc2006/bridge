import { TSchema } from '@sinclair/typebox';
import { StatusCode, Exception } from '../error/status';

export type SuccessResponse = TSchema;

// export type ErrorResponse<E extends Exception = Exception> = { message: E };
export type ErrorResponse = { message: Exception };

// S is now a response array. This allow to reduce the status code available
// export type Response<
//   S extends Record<number, string> = Record<number, string>, // S now extends Record<number, string>
//   C extends ContentType = ContentType,
//   E extends Exception | TSchema = TSchema,
// > = {
//   [K in keyof S]?: K extends SuccessCode // Check if K is in SuccessCode
//     ? SuccessResponse<C> // If so, it's a success response
//     : K extends ErrorCode
//     ? S[K] extends ErrorResponse
//       ? ErrorResponse<Exception> // If K is in ErrorCode, it's an error response
//       : never // If K is not in either, it's not handled
//     : never;
// };

export type OutputResponse<S extends StatusCode = StatusCode> = Record<
  S,
  SuccessResponse | ErrorResponse
>;
