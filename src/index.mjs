const optionals = new Map();
const optionalSymbol = Symbol();

const helpers = {
  Optional(type) {
    !optionals.has(type) && optionals.set(type, { [optionalSymbol]: type });
    return optionals.get(type);
  },
};

export function coercer(schema) {
  if (typeof schema === "function") schema = schema(helpers);
  return function coerce(source) {
    source ||= {};
    const result = {};
    // Define getter to access FormData
    const get =
      source instanceof FormData
        ? (key) => source.get(key)
        : (key) => source[key];
    for (const key in schema) {
      const field = schema[key];
      // Optional
      if (optionalSymbol in field) {
        if (key in source) result[key] = field[optionalSymbol](get(key) || "");
      } else {
        result[key] = field(get(key) || "");
      }
    }
    return result;
  };
}

coercer.infer = coercer;
