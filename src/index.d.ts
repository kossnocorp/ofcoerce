import { type OfCoerce } from "./types.js";
export type { OfCoerce as TinyParse };

export const coercer: OfCoerce.Core.Factory;

export type FromCoercer<Coercerer> = OfCoerce.Core.FromCoercer<Coercerer>;
