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
  ValueNode,
} from 'graphql';
import {
  Config,
  IncomingConfig,
  Maybe,
  Context,
  defaultConfig,
} from './helpers';
import { getFieldTypeInfo } from './getFieldTypeInfo';
import {
  getDirective,
  ENTITY_DIRECTIVE_KEY,
  REFERENCES_DIRECTIVE_KEY,
  IGNORE_DIRECTIVE_KEY,
  DEFAULT_DIRECTIVE_KEY,
  NO_SELECT_DIRECTIVE_KEY,
  IgnoreDirective,
  NoSelectDirective,
  DefaultDirective,
  EntityDirective,
  ReferencesDirective,
} from './directives';

import {
  graphqlScalarToTsScalar,
  createTsEnumTypeName,
  createTsInputTypeName,
  createTsDocumentTypeName,
  printTsEnum,
  getTsTypeInfo,
  printTsType,
} from './codegen/typescript';

import {
  graphqlScalarToMongooseScalar,
  createSchemaName,
  createModelName,
  createMongooseSchemaDefinition,
} from './codegen/mongoose';

import {
  printFieldName,
  stringifyJsonWithoutEscaping,
  defineMaybe,
  asString,
  asMaybe,
  asArray,
} from './codegen/common';

const skipTypes = ['Query', 'Mutation', 'Subscription'];

type EnumTypeDefinitionTransformed = string;

const run = (/*schema, documents, config*/) => {
  const printedSchema = fs.readFileSync('./input-schema-mtg.graphql', { encoding: 'utf8' });

  const astNode = parse(printedSchema); // Transforms the string into ASTNode


  const context: Context = {
    astRoot: astNode,
    config: { ...defaultConfig }
  }

  // Use AST visualiser to see the graph
  // https://astexplorer.net/

  const visitor = {
    DirectiveDefinition: {
      enter: () => null
    },
    InputObjectTypeDefinition: {
      enter: () => null,
    },
    ScalarTypeDefinition: {
      enter: () => null,
    },
    InterfaceTypeDefinition: {
      enter: () => null,
    },
    EnumTypeDefinition: {
      leave: (node: EnumTypeDefinitionNode): EnumTypeDefinitionTransformed => {
        return printTsEnum(context)(node);
      },
    },
    /*
    FieldDefinition: {
      leave: (node: FieldDefinitionNode) => {
        // This function triggered per each field
        return node.name.value;
      },
    },
    */
    ObjectTypeDefinition: {
      enter: (node: ObjectTypeDefinitionNode) => {
        if (skipTypes.indexOf(node.name.value) > -1) {
          // Remove this node from the AST
          return null;
        }
      },
      leave: (node: ObjectTypeDefinitionNode) => {
        // "node.fields" is an array of strings, because we transformed it using "FieldDefinition".
        const mongooseSchema = createMongooseSchemaDefinition(context)(node);
        const schemaVariableName = createSchemaName(context)(node.name.value);
        const entityDirective = getDirective<EntityDirective>(ENTITY_DIRECTIVE_KEY, node);
        let modelDefinition = '';

        if (entityDirective) {
          const entityName = entityDirective.name ? entityDirective.name.value : node.name.value;
          const modelName = createModelName(context)(entityName);
          modelDefinition = `
          export const ${modelName}: Model<${createTsDocumentTypeName(context)(entityName)}> =
            mongoose.model<${createTsDocumentTypeName(context)(entityName)}>('${entityName}', ${schemaVariableName});    
          `
        }

        const tsDef = printTsType(context)(node);

        return [mongooseSchema, modelDefinition, tsDef].join('\n');
      }
    },
  };

  // https://graphql.org/graphql-js/language/#visit

  const result = visit(astNode, visitor);

  const head = [
    `import mongoose, { Document, Schema, Model, Types } from 'mongoose';`,
  ].join('\n');

  const output = [
    head,
    defineMaybe(),
    result.definitions.join('\n'),
  ].join('\n');

  fs.writeFileSync('./generated-code.ts', output, { encoding: 'utf8' });

  console.log('Output is written to file generated-code.ts');
};

run();