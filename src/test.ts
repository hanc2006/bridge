// In data-validator.ts

import { AbstractHandler, handler } from "./core";
import { httpError, StatusCode } from "./error";
import { Type } from "@sinclair/typebox";

// const middleware = handler({
//   resolve: () => ({ status: 200, res: 'Hello, world!' }),
// });

const middleware2 = handler({
  body: Type.Object({ last: Type.String() }),
  query: Type.Object({ last: Type.String() }),
  // output: {
  //   200: Type.Object({
  //       id: Type.String(),
  //       created: Type.Boolean(),
  //       user: Type.Object({
  //         name: Type.String(),
  //         details: Type.Object({
  //           verified: Type.Boolean(),
  //         }),
  //       }),
  //     }),
  //   400: {
  //     code: "ERR_CHECKOUT_SERVICE_READ_TIMEOUT",
  //   },
  //   500: {
  //     code: "ERR_FILE_TYPE_NOT_ALLOWED",
  //   },
  resolve: ({ body }) => {
    if (body.last === 'last') return httpError(400, 'last is not allowed');
    return { };
  },
});

// const query = handler({
//   middlewares: [middleware, middleware2] as const,
//   body: z.object({ name: z.string() }),
//   resolve: (data) => {},
// });

// type TEST = readonly [
//   BridgeHandler<
//     () => {
//       brooo: string;
//     },
//     never
//   >,
//   BridgeHandler<
//     () => {
//       status: number;
//       body: string;
//     },
//     never
//   >,
// ];

// export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
//   k: infer I,
// ) => void
//   ? I
//   : never;

// // Generic type to get the intersection of return types of an array of BridgeHandler
// type UnionOfResolveReturnTypes<T extends ReadonlyArray<BridgeHandler<any, any>>> =
//   T extends ReadonlyArray<BridgeHandler<infer F, any>> ? ReturnType<F> : never;

// type Result = UnionToIntersection<UnionOfResolveReturnTypes<TEST>>;
