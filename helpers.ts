import fs = require('fs');
import {
  parse,
  visit,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
  ASTNode,
  GraphQLType,
  TypeNode,
  isNonNullType,
  DocumentNode,
  EnumValueDefinitionNode,
  ArgumentNode,
  ValueNode
} from 'graphql';

export type Config = {
  // Mongoose schema names
  schemaNameTemplate: string;
  // Typescript type names
  tsInputNameTemplate: string;
  // Typescript type name of a interface that is extending mongoose.Document
  tsDocumentNameTemplate: string;
  // Typescript type name for enums
  tsEnumNameTemplate: string;
  // Model names
  modelNameTemplate: string;
  // One unit to be used for indentation
  indentation: string;
  // Identifier field name
  idFieldName: string;
  // What fields should be never included in the mongoose schema
  mongooseSkipFieldsInSchema: string[];
}

export const defaultConfig: Config = {
  schemaNameTemplate: "{{name}}Schema",
  tsInputNameTemplate: "{{name}}Input",
  tsDocumentNameTemplate: "{{name}}",
  tsEnumNameTemplate: "{{name}}",
  modelNameTemplate: "{{name}}Model",
  indentation: '  ',
  idFieldName: '_id',
  mongooseSkipFieldsInSchema: ['_id'],
}

export type IncomingConfig = {
  [K in keyof Config]?: Config[K];
}

export type Context = {
  config: Config;
  astRoot: DocumentNode;
}

export type Maybe<T> = T | undefined;

export const GRAPHQL_SCALARS = ['ID', 'String', 'Boolean', 'Int', 'Float'];

export const createNameFromTemplate = (template: string, name: string) =>
  template.replace("{{name}}", name);