/**
 * The root Of Coerce! namespace. It contains all the Of Coerce! types.
 */
export namespace OfCoerce {
  //#region Core
  /**
   * The core types defining the high level types.
   */
  export namespace Core {
    /**
     * Builder function that returns the schema for the defined coercer.
     */
    export interface Builder<Schema> {
      /**
       * Builds the coerce schema with helpers.
       *
       * @param helpers Helper methods to build the schema.
       * @returns Coerce schema.
       */
      (helpers: BuilderHelpers): Schema;
    }

    /**
     * Coercer function. It accepts any data and coerces it to the expected
     * shape.
     */
    export interface Coercer<Shape> {
      /**
       * Coerces the data to the expected shape. It ensures that the data is
       * correctly shaped.
       *
       * @param data Data to coerce.
       * @returns Coerced data.
       */
      (data: unknown): Shape;
    }

    /**
     * Methods helping to build the coercer schema.
     */
    export interface BuilderHelpers {
      /**
       * Returns optional type coercer. It wraps the constructor to signal that
       * the field is optional.
       *
       * @param type Type to make optional.
       * @returns Optional coercer.
       */
      Optional<Type>(type: Type): Optional<Type>;

      /**
       * Returns array type coercer. It wraps the constructor to signal that
       * the field is an array.
       *
       * @param type Array item type.
       * @returns Array coercer.
       */
      Array<Type>(type: Type): Array<Type>;

      /**
       * Returns union type coercer. It wraps the constructor to signal that
       * the field is a union.
       *
       * @param types Types to union.
       * @returns Union coercer.
       */
      Union<Type extends any[]>(
        // Right now only literal unions are supported, as coersing object
        // unions is not a straightforward task.
        ...types: true extends Utils.IsLiteral<Type[number]> ? Type : never
      ): Union<Utils.UnionFromArray<Type>>;
    }

    type Test1 = Utils.IsLiteral<any>;

    /**
     * Optional coercer type. Wraps the constructor to signal that the field is
     * optional.
     */
    export interface Optional<Type> {
      /** Assigned type. */
      [OptionalSymbol]: Type;
    }

    /**
     * Symbol that helps to access the optional type.
     */
    export declare const OptionalSymbol: unique symbol;

    /**
     * Array coercer type. Wraps the constructor to signal that the field is
     * an array.
     */
    export interface Array<Type> {
      /** Assigned type. */
      [ArraySymbol]: Type;
    }

    /**
     * Symbol that helps to access the union type.
     */
    export declare const ArraySymbol: unique symbol;

    /**
     * Union coercer type. Wraps the constructor to signal that the field is
     * a union.
     */
    export interface Union<Type> {
      /** Assigned type. */
      [UnionSymbol]: Type;
    }

    /**
     * Symbol that helps to access the union type.
     */
    export declare const UnionSymbol: unique symbol;

    /**
     * Resolves the type shape from the coercer schema.
     */
    export type FromCoercer<Coercer_> = Coercer_ extends Coercer<infer Schema>
      ? Schema
      : never;
  }
  //#endregion

  //#region Factory
  export namespace Factory {
    /**
     * Factory unifing defined and inferred factories.
     */
    export interface Factory extends Factory.Defined {
      /** Inferred version of the coercer factory. It infers the type from
       * the schema returned from the builder function. */
      infer: Factory.Inferred;
    }

    /**
     * Defined coercer factory. It accepts the type shape as the generic and
     * type checks the schema returned from the builder function against
     * the shape.
     */
    export interface Defined {
      /**
       * Creates coercer for the given shape. It returns a function that
       * coerces any data to the defined shape.
       *
       * @param builder Schema builder that returns coerce schema.
       * @returns Coercer function.
       */
      <Shape>(
        builder:
          | Core.Builder<Mapper.ToSchema<Shape, "root">>
          | Mapper.ToSchema<Shape, "root">
      ): Core.Coercer<Shape>;
    }

    /**
     * Inferred coercer factory. It infers the type from the schema returned
     * from the builder function.
     */
    export interface Inferred {
      /**
       * Creates coercer from the coercer schema. It returns a function that
       * coerces any data to the defined shape.
       *
       * @param schema Schema or schema builder.
       * @returns Coercer function.
       */
      <Schema>(schema: Core.Builder<Schema> | Schema): Core.Coercer<
        Mapper.FromSchema<Schema>
      >;
    }
  }
  //#endregion

  //#region Mapper
  /**
   * Mapper namespaces. It contains types that helping to map constructors to
   * types and vice versa.
   */
  export namespace Mapper {
    /**
     * Resolves coerce schema from type shape.
     */
    export type ToSchema<Shape, Flag extends "root" | undefined = undefined> = (
      true extends Utils.IsLiteral<
        Utils.Debrand<Shape> // Branded types are detected as literal
      > // Literal
        ? SchemaPair<Shape>
        : Utils.Debrand<Shape> extends boolean // Boolean
        ? SchemaPair<Shape, BooleanConstructor>
        : Utils.Debrand<Shape> extends string // String
        ? SchemaPair<Shape, StringConstructor>
        : Utils.Debrand<Shape> extends number // Number
        ? SchemaPair<Shape, NumberConstructor>
        : Shape extends Array<infer Item> // Array
        ? SchemaPair<Shape, Core.Array<ToSchema<Item>>>
        : Shape extends Record<any, any> // Object
        ? SchemaPair<
            Shape,
            {
              [Key in keyof Shape]: true extends Utils.RequiredKey<Shape, Key>
                ? ToSchema<Shape[Key]>
                : Core.Optional<
                    // Exclude undefined from the field if it's not explicitly
                    // defined as such.
                    true extends Utils.IsUndefined<Shape, Key>
                      ? ToSchema<Shape[Key]>
                      : ToSchema<Exclude<Shape[Key], undefined>>
                  >;
            }
          >
        : never
    ) extends infer Type
      ? // Unions come in two flavors: one is union of SchemaPairs and the other
        // there ths SchemaPair's type (first element) is a union. So we need to
        // treat them separately.
        true extends Utils.IsUnion<Type>
        ? // Resolve union
          // First add the defined coercer (String, Number, etc.)
          | Core.Union<
                Type extends SchemaPair<any, infer Coercer> ? Coercer : never
              >
            // Now add the custom coercer
            | (Flag extends "root"
                ? never
                : Type extends SchemaPair<infer Type, any>
                ? Core.Coercer<Type>
                : never)
        : Type extends SchemaPair<infer Type, infer Coercer>
        ?
            | // I wrap it into the union at the end to make it chance to resolve to
            // the final type to avoid false positive on the union check.
            (true extends Utils.IsUnion<Type> ? Core.Union<Coercer> : Coercer)
            // Add custom coercer
            | (Flag extends "root" ? never : Core.Coercer<Type>)
        : never
      : never;

    /**
     * Combines the original type and its coercer. It allows to detect union
     * type in {@link ToSchema} before the final coercer is unioned with
     * custom coercer function.
     */
    export type SchemaPair<Type, Coercer = Type> = [Type, Coercer];

    /**
     * Resolves type shape from coerce schema.
     */
    export type FromSchema<Schema> = Schema extends Core.Union<infer Type> // Union
      ? FromSchema<Type>
      : true extends Utils.IsLiteral<Schema> // Literal
      ? Schema
      : Schema extends BooleanConstructor // Boolean
      ? boolean
      : Schema extends NumberConstructor // Number
      ? number
      : Schema extends StringConstructor // String
      ? string
      : Schema extends Core.Array<infer Item> // Array
      ? FromSchema<Item>[]
      : Schema extends Core.Union<infer Type> // Union
      ? FromSchema<Type>
      : Schema extends Core.Coercer<infer Type> // Coercer
      ? Type
      : Schema extends Record<any, any> // Object
      ? Utils.Combine<
          {
            [Key in RequiredSchemaKeys<Schema>]: FromSchemaField<Schema, Key>;
          } & {
            [Key in OptionalSchemaKeys<Schema>]?: FromSchemaField<Schema, Key>;
          }
        >
      : never;

    /**
     * Resolves the type of the field from the schema.
     */
    export type FromSchemaField<
      Schema,
      Key extends keyof Schema
    > = Schema[Key] extends Core.Optional<infer Type>
      ? Mapper.FromSchema<Type>
      : Mapper.FromSchema<Schema[Key]>;

    /**
     * Resolves the required schema keys.
     */
    export type RequiredSchemaKeys<Schema> = Exclude<
      keyof Schema,
      OptionalSchemaKeys<Schema>
    >;

    /**
     * Resolves the optional schema keys.
     */
    export type OptionalSchemaKeys<Schema> =
      keyof Schema extends infer Key extends keyof Schema
        ? Key extends Key
          ? Schema[Key] extends Core.Optional<any>
            ? Key
            : never
          : never
        : never;
  }
  //#endregion

  //#region Utils
  /**
   * Utils namespace with types not related to the functionality.
   */
  export namespace Utils {
    /**
     * Resolves true if the passed key is a required field of the given type.
     */
    export type RequiredKey<Type, Key extends keyof Type> = StaticKey<
      Type,
      Key
    > extends true
      ? Partial<Pick<Type, Key>> extends Pick<Type, Key>
        ? false
        : true
      : false;

    /**
     * Resolves true if the given key is statically defined in the given type.
     */
    export type StaticKey<
      Type,
      Key extends keyof Type
    > = Key extends keyof WithoutIndexed<Type> ? true : false;

    /**
     * Removes indexed fields leaving only statically defined.
     */
    export type WithoutIndexed<Type> = {
      [Key in keyof Type as string extends Key
        ? never
        : number extends Key
        ? never
        : symbol extends Key
        ? never
        : Key]: Type[Key];
    };

    /**
     * Omits never fields.
     */
    export type OmitNever<Type> = Pick<
      Type,
      { [Key in keyof Type]: Type[Key] extends never ? never : Key }[keyof Type]
    >;

    /**
     * Converts union to an intersection.
     * See: https://stackoverflow.com/a/50375286/75284
     */
    export type UnionToIntersection<Union> = (
      Union extends any ? (x: Union) => void : never
    ) extends (x: infer X) => void
      ? X
      : never;

    /**
     * The type resolves simplified intersection type.
     */
    export type Combine<Type> = {
      [Key in keyof Type]: Type[Key];
    };

    /**
     * Resolves true if the given type is a union.
     */
    export type IsUnion<Type, Copy extends Type = Type> =
      // Booleans are technically unions, but we don't want to treat them as such.
      // Debranding first helps to avoid false positives.
      boolean extends Debrand<Type>
        ? Exclude<Debrand<Type>, boolean> extends never
          ? false
          : true
        : (
            Type extends any ? (Copy extends Type ? false : true) : never
          ) extends false
        ? false
        : true;

    /**
     * Resolves true if the given type is a literal (i.e. true rather than boolean).
     */
    export type IsLiteral<Type> = string extends Type
      ? false
      : number extends Type
      ? false
      : boolean extends Type
      ? false
      : Type extends boolean | number | string | undefined | null
      ? true
      : false;

    /**
     * Resolves true if the passed field is undefined union and not optionally
     * undefined.
     */
    export type IsUndefined<
      Type,
      Key extends keyof Type
    > = undefined extends Required<Type>[Key] ? true : false;

    /**
     * Resolves union from the passed array.
     */
    export type UnionFromArray<Type extends any[]> = Type[number];

    /**
     * Any brand shape.
     */
    export type AnyBrand = {
      [key: string | number | symbol]: any;
    };

    /**
     * Resolves type with brand excluded.
     */
    export type Debrand<Type> = Type extends boolean & AnyBrand
      ? boolean
      : Type extends string & AnyBrand
      ? string
      : Type extends number & AnyBrand
      ? number
      : Type;
  }
  //#endregion
}
