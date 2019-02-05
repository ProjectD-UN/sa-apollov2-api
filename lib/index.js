'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Koa = _interopDefault(require('koa'));
var KoaRouter = _interopDefault(require('koa-router'));
var koaLogger = _interopDefault(require('koa-logger'));
var koaBody = _interopDefault(require('koa-bodyparser'));
var koaCors = _interopDefault(require('@koa/cors'));
var apolloServerKoa = require('apollo-server-koa');
var merge = _interopDefault(require('lodash.merge'));
var GraphQLJSON = _interopDefault(require('graphql-type-json'));
var graphqlTools = require('graphql-tools');
var request = _interopDefault(require('request-promise-native'));
var graphql = require('graphql');

/**
 * Creates a request following the given parameters
 * @param {string} url
 * @param {string} method
 * @param {object} [body]
 * @param {boolean} [fullResponse]
 * @return {Promise.<*>} - promise with the error or the response object
 */
async function generalRequest(url, method, body, fullResponse) {
	const parameters = {
		method,
		uri: encodeURI(url),
		body,
		json: true,
		resolveWithFullResponse: fullResponse
	};
	if (process.env.SHOW_URLS) {
		// eslint-disable-next-line
		console.log(url);
	}

	try {
		return await request(parameters);
	} catch (err) {
		return err;
	}
}

/**
 * Adds parameters to a given route
 * @param {string} url
 * @param {object} parameters
 * @return {string} - url with the added parameters
 */
function addParams(url, parameters) {
	let queryUrl = `${url}?`;
	for (let param in parameters) {
		// check object properties
		if (
			Object.prototype.hasOwnProperty.call(parameters, param) &&
			parameters[param]
		) {
			if (Array.isArray(parameters[param])) {
				queryUrl += `${param}=${parameters[param].join(`&${param}=`)}&`;
			} else {
				queryUrl += `${param}=${parameters[param]}&`;
			}
		}
	}
	return queryUrl;
}

/**
 * Generates a GET request with a list of query params
 * @param {string} url
 * @param {string} path
 * @param {object} parameters - key values to add to the url path
 * @return {Promise.<*>}
 */
function getRequest(url, path, parameters) {
	const queryUrl = addParams(`${url}/${path}`, parameters);
	return generalRequest(queryUrl, 'GET');
}

/**
 * Merge the schemas in order to avoid conflicts
 * @param {Array<string>} typeDefs
 * @param {Array<string>} queries
 * @param {Array<string>} mutations
 * @return {string}
 */
function mergeSchemas(typeDefs, queries, mutations) {
	return `${typeDefs.join('\n')}
    type Query { ${queries.join('\n')} }
    type Mutation { ${mutations.join('\n')} }`;
}

function formatErr(error) {
	const data = graphql.formatError(error);
	const { originalError } = error;
	if (originalError && originalError.error) {
		const { path } = data;
		const { error: { id: message, code, description } } = originalError;
		return { message, code, description, path };
	}
	return data;
}

const coursesTypeDef = `
type Course {
    code: Int!
    name: String!
    credits: Int!
    professor: String!
}
input CourseInput {
    name: String!
    credits: Int!
    professor: String!
}`;

const coursesQueries = `
    allCourses: [Course]!
    courseByCode(code: Int!): Course!
`;

const coursesMutations = `
    createCourse(course: CourseInput!): Course!
    deleteCourse(code: Int!): Int
    updateCourse(code: Int!, course: CourseInput!): Course!
`;

const courses_url = process.env.URL;
const courses_port = process.env.COURSES_PORT;
const courses_entryPoint = process.env.COURSES_ENTRY;

const URL = `http://${courses_url}:${courses_port}/${courses_entryPoint}`;

const resolvers = {
	Query: {
		allCourses: (_) =>
			getRequest(URL, ''),
		courseByCode: (_, { code }) =>
			generalRequest(`${URL}/${code}`, 'GET'),
	},
	Mutation: {
		createCourse: (_, { course }) =>
			generalRequest(`${URL}`, 'POST', course),
		updateCourse: (_, { code, course }) =>
			generalRequest(`${URL}/${code}`, 'PUT', course),
		deleteCourse: (_, { code }) =>
			generalRequest(`${URL}/${code}`, 'DELETE')
	}
};

const usersTypeDef = `
input UserRegistration {
    name: String!
    email: String!
    password: String!    
}
input Login {
    email: String!
    password: String!
}
interface ReplyUsers {
    auth: Boolean!
}
type Token implements ReplyUsers {
    auth: Boolean!
    token: String!
    expiresIn: Int!
}
type FailedToken implements ReplyUsers {
    auth: Boolean!
    message: String!    
}
type Me {
    id: String
    name: String!
    email: String!
    v: Int
}
`;

const usersQueries = `
    me: Me!    
`;

const usersMutations = `
    registerUser(user: UserRegistration): Token
    loginUser(login: Login): ReplyUsers
`;

const user_url = process.env.USERS_URL;
const user_port = process.env.USERS_PORT;
const user_entryPoint = process.env.USERS_ENTRY;

const URL$1 = `http://${user_url}:${user_port}/${user_entryPoint}`;

const resolvers$1 = {
	ReplyUsers: {
		__resolveType(obj, args, context, info){
			if(obj.auth === true) {
				return 'Token'
			} else {
				return 'FailedToken'
			}						
		}
	},
	Query: {
		me: (_) =>
			getRequest(`${URL$1}/me`, '')		
	},
	Mutation: {
		registerUser: (_, {user}) =>
			generalRequest(`${URL$1}/register`, 'POST', user),
		loginUser: (_, {login}) =>
			generalRequest(`${URL$1}/login`, 'POST', login)
		// createCourse: (_, { course }) =>
		// 	generalRequest(`${URL}`, 'POST', course),
		// updateCourse: (_, { code, course }) =>
		// 	generalRequest(`${URL}/${code}`, 'PUT', course),
		// deleteCourse: (_, { code }) =>
		// 	generalRequest(`${URL}/${code}`, 'DELETE')
	}
};

const newsletterTypeDef = `
input User {
    name: String!    
    email: String!
}
input UserTopic{
    user_id: Int!
    topic_id: Int!
}
input InNewsletter {
    title: String!
    description: String!
    url_to_image: String!
    topics: [Int!]
}
type UserCreated {
    id: Int
    name: String!
    email: String!
    created_at: String!
    updated_at: String!
    url: String!
}
type UserTopicCreated{
    user_id: Int
    topic_id: Int
}
type Newsletter {
    title: String!    
    description: String!
    url_to_image: String!
    topics: [Topic!]
}
type Topic {
    name: String!    
    img_id: Int!
}
`;

const newsletterQueries = `
    allNewsletters: [Newsletter]!
    allTopics: [Topic]!
`;

const newsletterMutations = `
    saveUser(user: User!): UserCreated!
    saveUserTopic(userTopic: UserTopic!): UserTopicCreated!
    saveNewsletter(newsletter: InNewsletter!): Newsletter!
`;

const newsletter_url = process.env.NEWSLETTERS_URL;
const newsletter_port = process.env.NEWSLETTERS_PORT;

const URL$2 = `http://${newsletter_url}:${newsletter_port}/`;

const resolvers$2 = {
	Query: {
		allNewsletters: (_) =>
			getRequest(`${URL$2}newsletters`, ''),
		allTopics: (_) =>
			getRequest(`${URL$2}topics`, '')
	},
	Mutation: {
		saveUser: (_, {user}) =>
			generalRequest(`${URL$2}users`, 'POST', user),
		saveUserTopic: (_, {userTopic}) =>
			generalRequest(`${URL$2}user_topics`, 'POST', userTopic),
		saveNewsletter: (_, {newsletter}) =>
			generalRequest(`${URL$2}newsletters`, 'POST', newsletter)
	}

};

const centersTypeDef = `
input Center {
    name: String!    
    email: String
    city: String!
    address: String!
    lat: Float!
    lng: Float!
}
type CenterCreated {
    code: Int!
    name: String!    
    email: String
    city: String!
    address: String!
    lat: Float!
    lng: Float!
}

`;

const centersQueries = `
    allCenters: [CenterCreated]!
    centerById(code:Int!): CenterCreated
`;

const centersMutations = `
    saveCenter(center: Center!): CenterCreated!
`;

const center_url = process.env.CENTERS_URL;
const center_entryPoint = process.env.CENTERS_ENTRY;
const center_port = process.env.CENTERS_PORT;

const URL$3 = `http://${center_url}:${center_port}/${center_entryPoint}`;

const resolvers$3 = {
	Query: {
		allCenters: (_) =>
			getRequest(`${URL$3}`, ''),
		centerById: (_, { code }) =>
			generalRequest(`${URL$3}/${code}`, 'GET'),
		
	},
	Mutation: {
		saveCenter: (_, {center}) =>
			generalRequest(`${URL$3}`, 'POST', center)
	}

};

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
var graphQLSchema = graphqlTools.makeExecutableSchema({
	typeDefs: mergedTypeDefs,
	resolvers: merge(
		{ JSON: GraphQLJSON }, // allows scalar JSON
		resolvers,
		resolvers$1,
		resolvers$2,
		resolvers$3
	)
});

const app = new Koa();
const router = new KoaRouter();
const PORT = process.env.PORT || 5000;

app.use(koaLogger());
app.use(koaCors());

// read token from header
app.use(async (ctx, next) => {
	if (ctx.header.authorization) {
		const token = ctx.header.authorization.match(/Bearer ([A-Za-z0-9]+)/);
		if (token && token[1]) {
			ctx.state.token = token[1];
		}
	}
	await next();
});

// GraphQL
const graphql$1 = apolloServerKoa.graphqlKoa((ctx) => ({
	schema: graphQLSchema,
	context: { token: ctx.state.token },
	formatError: formatErr
}));
router.post('/graphql', koaBody(), graphql$1);
router.get('/graphql', graphql$1);

// test route
router.get('/graphiql', apolloServerKoa.graphiqlKoa({ endpointURL: '/graphql' }));

app.use(router.routes());
app.use(router.allowedMethods());
// eslint-disable-next-line
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
