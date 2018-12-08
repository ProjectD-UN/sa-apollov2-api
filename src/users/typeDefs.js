export const usersTypeDef = `
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

export const usersQueries = `
    me: Me!    
`;

export const usersMutations = `
    registerUser(user: UserRegistration): Token
    loginUser(login: Login): ReplyUsers
`;
