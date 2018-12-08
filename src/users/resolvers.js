import { generalRequest, getRequest } from '../utilities';
import { user_url, user_port, user_entryPoint } from './server';

const URL = `http://${user_url}:${user_port}/${user_entryPoint}`;

const resolvers = {
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
			getRequest(`${URL}/me`, '')		
	},
	Mutation: {
		registerUser: (_, {user}) =>
			generalRequest(`${URL}/register`, 'POST', user),
		loginUser: (_, {login}) =>
			generalRequest(`${URL}/login`, 'POST', login)
		// createCourse: (_, { course }) =>
		// 	generalRequest(`${URL}`, 'POST', course),
		// updateCourse: (_, { code, course }) =>
		// 	generalRequest(`${URL}/${code}`, 'PUT', course),
		// deleteCourse: (_, { code }) =>
		// 	generalRequest(`${URL}/${code}`, 'DELETE')
	}
};

export default resolvers;