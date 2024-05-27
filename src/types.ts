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
       * Returns union type coercer. It wraps the constructor to signal that
       * the field is union.
       *
       * @param types Types to union.
       * @returns Union coercer.
       */
      Union<Type>(...types: Type[]): Union<Type>;
    }

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
     * Union coercer type. Wraps the constructor to signal that the field is
     * union.
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
     * Infers type share from coercerer.
     */
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
        builder: Core.Builder<Mapper.ToSchema<Shape>> | Mapper.ToSchema<Shape>
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
    export type ToSchema<Shape> = (
      Shape extends boolean // Boolean
        ? BooleanConstructor
        : Shape extends string // String
        ? StringConstructor
        : Shape extends number // Number
        ? NumberConstructor
        : Shape extends Array<infer Item> // Array
        ? ToSchema<Item>[]
        : Shape extends Record<any, any> // Object
        ? {
            [Key in keyof Shape]: true extends Utils.RequiredKey<Shape, Key>
              ? Mapper.ToSchema<Shape[Key]>
              : Core.Optional<Mapper.ToSchema<Shape[Key]>>;
          }
        : never
    ) extends infer Type
      ? // I wrap it into the union at the end to make it chance to resolve to
        // the final type to avoid false positive on the union check.
        true extends Utils.IsUnion<Type>
        ? Core.Union<Type>
        : Type
      : never;

    /**
     * Resolves type shape from coerce schema.
     */
    export type FromSchema<Schema> = Schema extends Core.Union<infer Type> // Union
      ? FromSchema<Type>
      : // ? Type extends Type
      //   ? Type
      //   : never
      Schema extends BooleanConstructor // Boolean
      ? boolean
      : Schema extends NumberConstructor // Number
      ? number
      : Schema extends StringConstructor // String
      ? string
      : Schema extends Array<infer Item> // Array
      ? FromSchema<Item>[]
      : Schema extends Core.Union<infer Type> // Union
      ? FromSchema<Type>
      : Schema extends Record<any, any> // Object
      ? Utils.Combine<
          Utils.OmitNever<
            {
              [Key in RequiredSchemaKeys<Schema>]: FromSchemaField<Schema, Key>;
            } & {
              [Key in OptionalSchemaKeys<Schema>]?: FromSchemaField<
                Schema,
                Key
              >;
            }
          >
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
    export type IsUnion<Type, Copy extends Type = Type> = (
      Type extends any ? (Copy extends Type ? false : true) : never
    ) extends false
      ? false
      : true;
  }
  //#endregion
}
