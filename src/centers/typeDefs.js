export const centersTypeDef = `
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

export const centersQueries = `
    allCenters: [CenterCreated]!
    centerById(code:Int!): CenterCreated
`;

export const centersMutations = `
    saveCenter(center: Center!): CenterCreated!
`;
