import { generalRequest, getRequest } from '../utilities';
import { center_url, center_port , center_entryPoint } from './server';

const URL = `http://${center_url}:${center_port}/${center_entryPoint}`;

const resolvers = {
	Query: {
		allCenters: (_) =>
			getRequest(`${URL}`, ''),
		centerById: (_, { code }) =>
			generalRequest(`${URL}/${code}`, 'GET'),
		
	},
	Mutation: {
		saveCenter: (_, {center}) =>
			generalRequest(`${URL}`, 'POST', center)
	}

};

export default resolvers;
