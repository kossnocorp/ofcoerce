import { type OfCoerce } from "./types.js";
export type { OfCoerce as TinyParse };

export const coercer: OfCoerce.Core.Factory;

export type FromCoercer<Coerce> = OfCoerce.Inferred.Infer<Coerce>;
