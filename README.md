# WIP

## TODO
- right now it just grabs `input-schema-mtg.graphql` and outputs `output.ts`, so make this configurable
- fix `Block-scoped variable 'XYZ' used before its declaration.` errors in the generated code by ordering the declarations (for example see `output.ts`)
- create codegen plugin out of this
- clean up this repo & improve build process
- add documentation for the custom directives
- fix TS errors

## Schema requirements

Add these definitions to your schema so you can use the directives

```graphql
  directive @references(
    entity: String!,
    fieldName: String
  ) on FIELD_DEFINITION

  directive @entity(
    name: String
  ) on OBJECT

  directive @ignore on FIELD_DEFINITION
  
  directive @default(
    numberValue: Float,
    stringValue: String
  ) on ENUM_VALUE | FIELD_DEFINITION

  directive @private on FIELD_DEFINITION

  directive @noSelect on FIELD_DEFINITION
```

## What you need to run the generated code

Install dependencies
```
npm install mongoose --save
npm install @types/mongoose --save-dev
npm install @types/mongodb --save-dev
```

## Known issues with mongoose

### Required field of type string
Mongoose (at least version 5.4.19 and earlier) throws an error when a field of type `string` is required but the passed value is an empty string. You can read more about it [here](https://github.com/graphql/graphql-js/issues/480). The easiest way how to work around this is setting default value of the field to an empty string like this:

```
  type A {
    field: String! @default(stringValue: "")
  }
```
