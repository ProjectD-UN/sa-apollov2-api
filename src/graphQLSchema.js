import merge from 'lodash.merge';
import GraphQLJSON from 'graphql-type-json';
import { makeExecutableSchema } from 'graphql-tools';

import { mergeSchemas } from './utilities';

import {
	coursesMutations,
	coursesQueries,
	coursesTypeDef
} from './courses/typeDefs';
import coursesResolvers from './courses/resolvers';

import {
	usersMutations,
	usersQueries,
	usersTypeDef
} from './users/typeDefs';
import usersResolvers from './users/resolvers';

import {
	newsletterMutations,
	newsletterQueries,
	newsletterTypeDef
} from './newsletters/typeDefs';
import newslettersResolvers from './newsletters/resolvers';

import {
	centersMutations,
	centersQueries,
	centersTypeDef
} from './centers/typeDefs';
import centersResolvers from './centers/resolvers';
// merge the typeDefs
const mergedTypeDefs = mergeSchemas(
	[
		'scalar JSON',
		coursesTypeDef, usersTypeDef, newsletterTypeDef, centersTypeDef
	],
	[
		coursesQueries, usersQueries, newsletterQueries, centersQueries
	],
	[
		coursesMutations, usersMutations, newsletterMutations, centersMutations
	]
);

// Generate the schema object from your types definition.
export default makeExecutableSchema({
	typeDefs: mergedTypeDefs,
	resolvers: merge(
		{ JSON: GraphQLJSON }, // allows scalar JSON
		coursesResolvers,
		usersResolvers,
		newslettersResolvers,
		centersResolvers
	)
});
