# What you need to run the generated code

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