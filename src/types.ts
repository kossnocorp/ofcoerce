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
     * Infers type share from coercerer.
     */
    /**
     * Resolves the type shape from the coercer schema.
     */
    export type FromCoercer<Coercer_> = Coercer_ extends Coercer<infer Schema>
      ? Inferred.Infer<Schema>
      : never;
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
      <Shape>(
        builder: Core.Builder<CoerceSchema<Shape>> | CoerceSchema<Shape>
      ): Core.Coercer<Shape>;
    }

    /**
     * Resolves the schema from the given shape.
     */
    export type CoerceSchema<Shape> = {
      [Key in keyof Shape]: true extends Utils.RequiredKey<Shape, Key>
        ? Mapper.ToConstructor<Shape[Key]>
        : Core.Optional<Mapper.ToConstructor<Shape[Key]>>;
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
      <Schema>(schema: Core.Builder<Schema> | Schema): Core.Coercer<
        Infer<Schema>
      >;
    }

    /**
     * Resolves the type shape from the coercer schema.
     */
    export type Infer<Schema> = Utils.Combine<
      {
        [Key in RequiredKeys<Schema>]: InferField<Schema, Key>;
      } & {
        [Key in OptionalKeys<Schema>]?: InferField<Schema, Key>;
      }
    >;

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
      : Type extends Record<any, any>
      ? { [Key in keyof Type]: ToConstructor<Type[Key]> }
      : never;

    /**
     * Resolves type from constructor.
     */
    export type FromConstructor<Type> = Type extends BooleanConstructor
      ? boolean
      : Type extends NumberConstructor
      ? number
      : Type extends StringConstructor
      ? string
      : Type extends Record<any, any>
      ? { [Key in keyof Type]: FromConstructor<Type[Key]> }
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
