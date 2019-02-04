import { generalRequest, getRequest } from '../utilities';
import { newsletter_url, newsletter_port } from './server';

const URL = `http://${newsletter_url}:${newsletter_port}/`;

const resolvers = {
	Query: {
		allNewsletters: (_) =>
			getRequest(`${URL}newsletters`, ''),
		allTopics: (_) =>
			getRequest(`${URL}topics`, '')
	},
	Mutation: {
		saveUser: (_, {user}) =>
			generalRequest(`${URL}users`, 'POST', user),
		saveUserTopic: (_, {userTopic}) =>
			generalRequest(`${URL}user_topics`, 'POST', userTopic),
		saveNewsletter: (_, {newsletter}) =>
			generalRequest(`${URL}newsletters`, 'POST', newsletter)
	}

};

export default resolvers;
