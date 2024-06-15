# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning].

This change log follows the format documented in [Keep a CHANGELOG].

[semantic versioning]: http://semver.org/
[keep a changelog]: http://keepachangelog.com/

## v0.7.0 - 2024-06-15

### Added

- Added literal unions support via `$.Union("draft", "published")` helper.

## v0.6.0 - 2024-06-02

### Added

- Added support for branded types that now accept corresponding built-in coercer or custom coercer returning the branded type.

## v0.5.0 - 2024-05-28

### Added

- Added support for custom coercers `<Type>(input: unknown): Type`.

## v0.4.0 - 2024-05-28

### Changed

- **BREAKING**: Changed array API from `Array(String)` to `$.Array(String)` to enable literal arrays support `[Number, String]`.

### Added

- Added primitive literal types support (`"hello"`, `42`, `true`, `undefined`, `null`).

## v0.3.0 - 2024-05-27

### Fixed

- Fixed `FromCoercer` type to properly resolve the type shape.

### Added

- Added support for arrays (`Array(String)`).

### Changed

- Imporoved support for nested objects.

## v0.2.0 - 2024-05-27

### Fixed

- Fixed the inferred coerce function types.

### Added

- Added support for nested types.

## v0.1.0 - 2024-05-27

Initial version
