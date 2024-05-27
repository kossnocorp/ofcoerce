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
  return function coerce(source, schema_ = schema) {
    source ||= {};
    const result = {};
    // Define getter to access FormData
    const get =
      source instanceof FormData
        ? (key) => source.get(key)
        : (key) => source[key];
    for (const key in schema_) {
      const field = schema_[key];
      // Optional
      if (typeof field === "function") result[key] = field(get(key) || "");
      else if (optionalSymbol in field) {
        if (key in source) result[key] = field[optionalSymbol](get(key) || "");
      } else {
        result[key] = coerce(get(key) || "", schema_[key]);
      }
    }
    return result;
  };
}

coercer.infer = coercer;
