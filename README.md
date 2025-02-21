# Of Coerce!

Of Coerce! is a lightweight, near-zero overhead alternative to [Zod](https://zod.dev/) and [Valibot](https://valibot.dev/).

Unlike these libraries, Of Coerce! focuses on a single task: ensuring the data corresponds to the types.

It uses built-in JavaScript features to coerce whatever you pass to it, which makes it the fastest and the most lightweight solution (full library is `381B`!).

```ts
import { coercer } from "ofcoerce";

interface User {
  name: string;
  email: string;
  age?: number;
}

const coerceUser = coercer<User>(($) => ({
  name: String,
  email: String,
  age: $.Optional(Number),
}));

const user = coerceUser({ user: "Sasha", age: "37" });
//=> { user: "Sasha", email: "", age: 37 }
```

It accepts the desired shape type as the generic argument and type-checks the defined schema against it.

But just like the alternatives, it allows inferring types from the schema:

```ts
import { coercer, FromCoercer } from "ofcoerce";

const coerceUser = coercer.infer(($) => ({
  name: String,
  email: String,
  age: $.Optional(Number),
}));

type User = FromCoercer<typeof coerceUser>;
// { user: string, email: string, age?: number }
```

It also accepts `FormData` making it ideal when working with forms, especially inside of React Server Components:

```tsx
import { coercer } from "ofcoerce";

const coerceForm = coercer({
  email: String,
  password: String,
});

function SignInForm() {
  return (
    <form
      action={async (formData) => {
        "use server";
        const form = coerceForm(formData);
        await signIn(form);
      }}
    >
      <input name="email" type="email" required placeholder="Email" />
      <input name="password" type="password" required placeholder="Password" />
      <button>Sign in</button>
    </form>
  );
}
```

You can also use constructors as coercers, that is useful for example when working with `File`:

```tsx
import { coercer } from "ofcoerce";

const coerceFile = coercer({
  file: File,
});

function UploadForm() {
  return (
    <form
      action={async (formData) => {
        "use server";
        const form = coerceFile(formData);
        await upload(form);
      }}
    >
      <input name="file" type="file" required />
      <button>Upload</button>
    </form>
  );
}
```

It will check if the value is an instance of `File`, and if not, it will try to call `new File()` without parameters.

## Getting started

### Installation

Start by installing the package:

```sh
npm i ofcoerce
```

## Changelog

See [the changelog](./CHANGELOG.md).

## License

[MIT © Sasha Koss](https://kossnocorp.mit-license.org/)
