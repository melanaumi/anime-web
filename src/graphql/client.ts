import { ApolloClient, InMemoryCache } from '@apollo/client';
import { LIST_API_URL } from '../config';

const client = new ApolloClient({
    uri: LIST_API_URL,
    cache: new InMemoryCache(),
});

export default client;

export {};
