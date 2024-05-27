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
     * The core factory unifing defined and inferred factories.
     */
    export interface Factory extends Defined.Factory {
      /** Inferred version of the coercer factory. It infers the type from
       * the schema returned from the builder function. */
      infer: Inferred.Factory;
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
  }
  //#endregion

  //#region Defined
  export namespace Defined {
    /**
     * Defined coercer factory. It accepts the type shape as the generic and
     * type checks the schema returned from the builder function against
     * the shape.
     */
    export interface Factory {
      /**
       * Creates coercer for the given shape. It returns a function that
       * coerces any data to the defined shape.
       *
       * @param builder Schema builder that returns coerce schema.
       * @returns Coercer function.
       */
      <Shape>(builder: Builder<Shape> | CoerceSchema<Shape>): Coercer<Shape>;
    }

    /**
     * Defined coercer function. It accepts any data and coerces it to
     * the expected shape.
     */
    export interface Coercer<Shape> {
      /**
       * Coerces the data to the defined shape. It ensures that the data is
       * correctly shaped.
       *
       * @param data Data to coerce.
       * @returns Coerced data.
       */
      (data: unknown): Shape;
    }

    /**
     * Builder function that returns the schema for the defined coercer.
     */
    export interface Builder<Schema> {
      /**
       * Builds the schema for the defined coercer.
       *
       * @param helpers Helper methods to build the schema.
       * @returns Coerce schema.
       */
      (helpers: Core.BuilderHelpers): CoerceSchema<Schema>;
    }

    export type CoerceSchema<Schema> = {
      [Key in keyof Schema]: true extends Utils.RequiredKey<Schema, Key>
        ? Mapper.ToConstructor<Schema[Key]>
        : Core.Optional<Mapper.ToConstructor<Schema[Key]>>;
    };
  }
  //#endregion

  //#region Inferred
  export namespace Inferred {
    /**
     * Inferred coercer factory. It infers the type from the schema returned
     * from the builder function.
     */
    export interface Factory {
      /**
       * Creates coercer from the coercer schema. It returns a function that
       * coerces any data to the defined shape.
       *
       * @param schema Schema or schema builder.
       * @returns Coercer function.
       */
      <Schema>(schema: Builder<Schema> | Schema): Coercer<Schema>;
    }
    /**
     * Builder function that returns the coerce schema.
     */
    export interface Builder<Schema> {
      /**
       * Builds the schema for the defined coercer.
       *
       * @param helpers Helper methods to build the schema.
       * @returns Coerce schema.
       */
      (helpers: Core.BuilderHelpers): Schema;
    }
    /**
     * Inferred coercer function. It accepts unknown data and coerces it to
     * the expected shape.
     */
    export interface Coercer<Schema> {
      /**
       * Coerces the data to the defined shape. It ensures that the data is
       * correctly shaped.
       *
       * @param data Data to coerce.
       * @returns Coerced data.
       */
      (data: unknown): Infer<Schema>;
    }

    /**
     * Resolves the type shape from the coercer schema.
     */
    export type Infer<Coercer_> = Coercer_ extends Coercer<infer Schema>
      ? Utils.Combine<
          {
            [Key in RequiredKeys<Schema>]: InferField<Schema, Key>;
          } & {
            [Key in OptionalKeys<Schema>]?: InferField<Schema, Key>;
          }
        >
      : never;

    /**
     * Resolves the type of the field from the schema.
     */
    export type InferField<
      Schema,
      Key extends keyof Schema
    > = Schema[Key] extends Core.Optional<infer Type>
      ? Mapper.FromConstructor<Type>
      : Mapper.FromConstructor<Schema[Key]>;

    /**
     * Resolves the required schema keys.
     */
    export type RequiredKeys<Schema> = Exclude<
      keyof Schema,
      OptionalKeys<Schema>
    >;

    /**
     * Resolves the optional schema keys.
     */
    export type OptionalKeys<Schema> =
      keyof Schema extends infer Key extends keyof Schema
        ? Key extends Key
          ? Schema[Key] extends Core.Optional<any>
            ? Key
            : never
          : never
        : never;
  }
  //#endregion

  //#region Mapper
  /**
   * Mapper namespaces. It contains types that helping to map constructors to
   * types and vice versa.
   */
  export namespace Mapper {
    /**
     * Resolves constructor for the given type.
     */
    export type ToConstructor<Type> = Type extends boolean
      ? BooleanConstructor
      : Type extends string
      ? StringConstructor
      : Type extends number
      ? NumberConstructor
      : never;

    /**
     * Resoles type from constructor.
     */
    export type FromConstructor<Type> = Type extends BooleanConstructor
      ? boolean
      : Type extends NumberConstructor
      ? number
      : Type extends StringConstructor
      ? string
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
  }
  //#endregion
}
