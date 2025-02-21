const memoized = [new Map(), new Map()];
const symbols = [Symbol(), Symbol(), Symbol()];

function Type(index, type) {
  // Reuse the same object to avoid trashing the heap
  !memoized[index].has(type) &&
    memoized[index].set(type, { [symbols[index]]: type });
  return memoized[index].get(type);
}

const helpers = {
  Optional: Type.bind(null, 0),
  Array: Type.bind(null, 1),
  Union: (...types) => ({ [symbols[2]]: types }),
};

export function coercer(schema) {
  if (typeof schema === "function") schema = schema(helpers);
  return function coerce() {
    // [NOTE] Using arguments saves few bytes
    let [
      value = "", // Default to empty value to prevent "undefined" strings
      coercer,
    ] = arguments;
    // // We can't use the default value as it will override undefined
    if (arguments.length === 1) coercer = schema;

    // The coercer is a function (Boolean, Number, String, etc.), so we can
    // try running it on the value.
    if (typeof coercer === "function") {
      try {
        return coercer(value);
      } catch {
        // If it fails, then it is likely a class constructor, so we try
        // handling it as a class constructor.
        //
        // Possible error might look like this:
        //   Uncaught TypeError: Class constructor File cannot be invoked without 'new'

        // If the value is an instance of the coercer, then we return it
        // otherwise we create a new instance of the coercer.
        return value instanceof coercer ? value : new coercer();
      }
    }

    // Return primitives early to avoid unnecessary checks
    if (!coercer || typeof coercer !== "object") return coercer;

    // The coercer is an array, so we use the first element as the coercer.
    if (symbols[1] in coercer)
      return (
        (value && value?.map((item) => coerce(item, coercer[symbols[1]]))) || []
      );

    // The coercer is an union, so we iterate over each type until we find
    // a match or use the first type as the default.
    if (symbols[2] in coercer) {
      const types = coercer[symbols[2]];
      return types.find((t) => t === value) || types[0];
    }

    // The coercer is an object and each key must be coerced individually.

    const result = {};
    value ||= {};

    // Define getter to access FormData
    const get =
      value instanceof FormData ? (key) => value.get(key) : (key) => value[key];

    for (const key in coercer) {
      const field = coercer[key];

      // Handle optional field
      if (field && typeof field === "object" && symbols[0] in field) {
        // Skip coercing optional field, if it is not present in the value
        // [TODO] FormData support for this case
        if (key in value) result[key] = coerce(get(key), field[symbols[0]]);
      }
      // Handle required field
      else result[key] = coerce(get(key), field);
    }

    return result;
  };
}

coercer.infer = coercer;
