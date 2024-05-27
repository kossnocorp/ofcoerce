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
  return function coerce(value, coercer = schema) {
    if (typeof coercer === "function") return coercer(value || "");
    else if (Array.isArray(coercer)) {
      return (value && value?.map((item) => coerce(item, coercer[0]))) || [];
    } else if (typeof coercer === "object") {
      value ||= {};
      const result = {};
      // Define getter to access FormData
      const get =
        value instanceof FormData
          ? (key) => value.get(key)
          : (key) => value[key];
      for (const key in coercer) {
        const field = coercer[key];
        if (optionalSymbol in field) {
          // [TODO] FormData support for this case
          if (key in value)
            result[key] = coerce(get(key), field[optionalSymbol]);
        } else result[key] = coerce(get(key), field);
      }
      return result;
    }
  };
}

coercer.infer = coercer;
