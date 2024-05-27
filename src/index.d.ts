import { type OfCoerce } from "./types.js";
export type { OfCoerce as TinyParse };

export const coercer: OfCoerce.Factory.Factory;

export type FromCoercer<Coercerer> = OfCoerce.Core.FromCoercer<Coercerer>;
