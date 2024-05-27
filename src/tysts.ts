import { FromCoercer, coercer } from ".";
import { OfCoerce } from "./types";

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
    type _ = Assert<User, UserSchema>;

    //! It returns coerced data
    const user = coerceUser(null);
    user satisfies User;
    user.name;

    // [TODo] Remove debug code vvvvvv

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

    // type User = FromCoercer<typeof userCoercer>;

    const user = coerceUser(data);
    //=> { user: "Sasha", email: "" }
  }
}
//#endregion

type Assert<Type1, _Type2 extends Type1> = true;
