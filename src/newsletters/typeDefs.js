export const newsletterTypeDef = `
input User {
    name: String!    
    email: String!
}
input UserTopic{
    user_id: Int!
    topic_id: Int!
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

export const newsletterQueries = `
    allNewsletters: [Newsletter]!
    allTopics: [Topic]!
`;

export const newsletterMutations = `
    saveUser(user: User!): UserCreated!
    saveUserTopic(userTopic: UserTopic!): UserTopicCreated!
`;
