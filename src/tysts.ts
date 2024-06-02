import { FromCoercer, coercer } from ".";

//#region Core
{
  interface User {
    name: string;
    email: string;
    age?: number;
  }

  interface Project {
    slug: string;
    name: string;
  }

  //! It allows to specify the shape
  {
    const coerceUser = coercer<User>(($) => ({
      name: String,
      email: String,
      age: $.Optional(Number),
    }));

    //! Forces to return correct coercer

    //! Age must be optional
    // @ts-expect-error
    coercer<User>(($) => ({
      name: String,
      email: String,
      age: Number,
    }));

    //! Email is missing
    // @ts-expect-error
    coercer<User>(($) => ({
      name: String,
      age: $.Optional(Number),
    }));

    //! It returns coerced data
    const user = coerceUser(null);
    user satisfies User;
    user.name;

    //! It allows to pass schema directly

    const coerceProject = coercer<Project>({
      slug: String,
      name: String,
    });

    const project = coerceProject(null);
    project satisfies Project;
    project.name;
  }

  //! It allows to infer schema
  {
    const coerceUser = coercer.infer(($) => ({
      name: String,
      email: String,
      age: $.Optional(Number),
    }));

    type UserSchema = FromCoercer<typeof coerceUser>;
    type _a = Assert<User, UserSchema>;
    type _b = Assert<UserSchema, User>;

    //! It returns coerced data
    const user = coerceUser(null);
    user satisfies User;
    user.name;

    //! It allows to pass schema directly

    const coerceProject = coercer.infer({
      slug: String,
      name: String,
    });

    const project = coerceProject(null);
    project satisfies Project;
    project.name;
  }

  //! It allows to coerce FormData
  {
    const formCoercer = coercer.infer(($) => ({
      email: String,
      password: String,
    }));

    formCoercer(new FormData());
  }
}
//#endregion

//#region Nested
{
  {
    interface Name {
      first: string;
      last: string;
    }

    interface User {
      name: Name;
      email: string;
    }

    //! It coerces nested objects

    {
      const coerceUser = coercer<User>(($) => ({
        name: {
          first: String,
          last: String,
        },
        email: String,
      }));

      const user = coerceUser(null);

      //! It returns coerced data
      user satisfies User;
      user.name.first;
    }

    {
      const coerceUser = coercer.infer(($) => ({
        name: {
          first: String,
          last: String,
        },
        email: String,
      }));

      const user = coerceUser(null);

      //! It works with inferred schema
      user satisfies User;
      user.name.first;

      //! If allows to infer schema
      type UserSchema = FromCoercer<typeof coerceUser>;
      type _a = Assert<User, UserSchema>;
      type _b = Assert<UserSchema, User>;
    }
  }

  {
    interface Lyrics {
      author?: string;
      lines: string[];
    }

    interface Song {
      title: string;
      lyrics: Lyrics;
      artist: string;
    }

    {
      const coerceSong = coercer<Song>(($) => ({
        title: String,
        artist: String,
        lyrics: {
          author: $.Optional(String),
          lines: $.Array(String),
        },
      }));

      const song = coerceSong(null);

      //! It coerces arrays
      song satisfies Song;
      song.title;
      const line = song.lyrics.lines[0];
      if (line) {
        line satisfies string;
        line.length;
      }
    }

    {
      const coerceSong = coercer.infer(($) => ({
        title: String,
        artist: String,
        lyrics: {
          author: $.Optional(String),
          lines: $.Array(String),
        },
      }));

      const song = coerceSong(null);

      //! It works with inferred schema
      song satisfies Song;
      song.title;
      const line = song.lyrics.lines[0];
      if (line) {
        line satisfies string;
        line.length;
      }

      //! If allows to infer schema
      type SongSchema = FromCoercer<typeof coerceSong>;
      type _a = Assert<Song, SongSchema>;
      type _b = Assert<SongSchema, Song>;
    }
  }
}
//#endregion

//#region Unions
{
  type Credentials = EmailCredentials | PhoneCredentials;

  interface EmailCredentials {
    email: string;
    password: string;
  }

  interface PhoneCredentials {
    phone: string;
  }

  interface User {
    name: string;
    credentials: Credentials;
  }

  //! It allows to specify a shape with an union
  {
    const coerceUser = coercer<User>(($) => ({
      name: String,
      credentials: $.Union(
        {
          email: String,
          password: String,
        },
        {
          phone: String,
        }
      ),
    }));

    //! It returns coerced data
    const user = coerceUser(null);
    user.credentials satisfies Credentials;
    if ("email" in user.credentials) user.credentials.password;
  }

  //! It allows to infer schema
  {
    const coerceUser = coercer.infer(($) => ({
      name: String,
      credentials: $.Union(
        {
          email: String,
          password: String,
        },
        {
          phone: String,
        }
      ),
    }));

    type UserSchema = FromCoercer<typeof coerceUser>;
    type _a = Assert<User, UserSchema>;
    type _b = Assert<UserSchema, User>;

    //! It returns coerced data
    const user = coerceUser(null);
    user.credentials satisfies Credentials;
    if ("email" in user.credentials) user.credentials.password;
  }
}
//#endregion

//#region Primitives
{
  interface Mixed {
    type: "hello";
    flag: true;
    nope: null;
    nah: undefined;
  }

  //! It supports primitives

  {
    const coerceMixed = coercer<Mixed>({
      type: "hello",
      flag: true,
      nope: null,
      nah: undefined,
    });

    const mixed = coerceMixed(null);

    //! It returns coerced data
    mixed satisfies Mixed;
    mixed.type;
  }

  {
    const coerceMixed = coercer.infer({
      type: "hello" as const,
      flag: true as const,
      nope: null,
      nah: undefined,
    });

    const mixed = coerceMixed(null);

    //! It works with inferred schema
    mixed satisfies Mixed;
    mixed.type;

    //! If allows to infer schema
    type MixedSchema = FromCoercer<typeof coerceMixed>;
    type _a = Assert<Mixed, MixedSchema>;
    type _b = Assert<MixedSchema, Mixed>;
  }
}
//#endregion

//#region Custom coercers
{
  interface SignInForm {
    email: string;
    password: string;
    rememberMe: boolean;
  }

  function CheckboxBoolean(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    return value === "on";
  }

  //! It allows to use custom coercers
  {
    const coerceForm = coercer<SignInForm>({
      email: String,
      password: String,
      rememberMe: CheckboxBoolean,
    });

    //! It returns coerced data
    const form = coerceForm(null);
    form.rememberMe satisfies boolean;
  }

  //! It allows to infer schema
  {
    const coerceForm = coercer.infer({
      email: String,
      password: String,
      rememberMe: CheckboxBoolean,
    });

    type FormSchema = FromCoercer<typeof coerceForm>;
    type _a = Assert<SignInForm, FormSchema>;
    type _b = Assert<FormSchema, SignInForm>;

    //! It returns coerced data
    const form = coerceForm(null);
    form.rememberMe satisfies boolean;
  }
}
//#endregion

//#region Branded types
{
  const brand = Symbol();
  type Branded<Type, Brand> = Type & { readonly [brand]: Brand };

  //! It works with branded types
  {
    interface Things {
      string: Branded<string, "hello">;
      boolean: Branded<boolean, "cruel">;
      number: Branded<number, "world">;
    }

    const coerceThings = coercer<Things>({
      string: String,
      boolean: Boolean,
      number: Number,
    });

    const things = coerceThings(null);

    //! It returns coerced data
    things.string satisfies Branded<string, "hello">;
    things.boolean satisfies Branded<boolean, "cruel">;
    things.number satisfies Branded<number, "world">;
  }

  // Custom coercers might be used with branded types
  {
    function HelloString(value: unknown): Branded<string, "hello"> {
      return value as Branded<string, "hello">;
    }

    function WorldString(value: unknown): Branded<string, "world"> {
      return value as Branded<string, "world">;
    }

    function WorldNumber(value: unknown): Branded<number, "world"> {
      return value as Branded<number, "world">;
    }

    interface Things {
      string: Branded<string, "hello">;
      boolean: Branded<boolean, "cruel">;
      number: Branded<number, "world">;
    }

    coercer<Things>({
      string: HelloString,
      boolean: Boolean,
      number: WorldNumber,
    });

    interface OtherThings {
      hello: Branded<string, "hello">;
      world: Branded<string, "world">;
    }

    coercer<OtherThings>({
      hello: HelloString,
      world: WorldString,
    });

    coercer<OtherThings>({
      hello: HelloString,
      // @ts-expect-error
      world: HelloString,
    });
  }
}
//#endregion

//#region Docs
{
  const data = null as unknown;

  {
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
  }

  {
    const coerceUser = coercer.infer(($) => ({
      name: String,
      email: String,
      age: $.Optional(Number),
    }));

    const user = coerceUser(data);
    //=> { user: "Sasha", email: "" }
  }
}
//#endregion

type Assert<Type1, _Type2 extends Type1> = true;
