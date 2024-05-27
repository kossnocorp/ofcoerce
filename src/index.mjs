const optionals = new Map();
const optionalSymbol = Symbol();

const helpers = {
  Optional(type) {
    // Reuse the same optional object to avoid trashing the heap
    !optionals.has(type) && optionals.set(type, { [optionalSymbol]: type });
    return optionals.get(type);
  },
};

export function coercer(schema) {
  if (typeof schema === "function") schema = schema(helpers);
  return function coerce(value, coercer = schema) {
    // The coercer is a function (Boolean, Number, String, etc.), so we can it.
    if (typeof coercer === "function")
      return coercer(
        value || "" // Add empty value to prevent "undefined" strings
      );

    // The coercer is an array, so we use the first element as the coercer.
    if (Array.isArray(coercer))
      return (value && value?.map((item) => coerce(item, coercer[0]))) || [];

    // The coercer is an object and each key must be coerced individually.

    const result = {};

    // Define getter to access FormData
    value ||= {};
    const get =
      value instanceof FormData ? (key) => value.get(key) : (key) => value[key];

    for (const key in coercer) {
      const field = coercer[key];

      // Handle optional field
      if (optionalSymbol in field) {
        // Skip coercing optional field, if it is not present in the value
        // [TODO] FormData support for this case
        if (key in value) result[key] = coerce(get(key), field[optionalSymbol]);
      }
      // Handle required field
      else result[key] = coerce(get(key), field);
    }

    return result;
  };
}

coercer.infer = coercer;
