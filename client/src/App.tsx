import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Outlet, useNavigate } from 'react-router-dom';
import { onError } from '@apollo/client/link/error';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Navbar from './components/Navbar';
import AuthService from './utils/auth';
import PersistentDiceRoller from './components/DiceRoller/PersistentDiceRoller';
import DiceRoller from './components/DiceRoller/DiceRoller';

// GraphQL API endpoint
const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === 'production'
    ? '/graphql'
    : 'http://localhost:3001/graphql',
  credentials: 'same-origin',
});

// Authorization link for attaching token to requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');

  // Check token expiration client-side
  if (token) {
    const decoded = jwtDecode<{ exp: number }>(token);
    if (Date.now() >= decoded.exp * 1000) {
      AuthService.logout(); // Clear expired token
      window.location.href = '/'; // Redirect to the About page
    }
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error link for handling GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ extensions }) => {
      if (extensions?.code === 'UNAUTHENTICATED') {
        console.warn('Token expired or invalid. Logging out user.');
        AuthService.logout(); // Clear token and user data
        window.location.href = '/'; // Redirect to the About page
      }
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Instantiate Apollo Client
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Character: {
        keyFields: ['_id'],
        fields: {
          basicInfo: {
            merge(_, incoming) {
              // Custom merge function for the basicInfo field
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('id_token');

    // Check token expiration on app load
    if (token) {
      const decoded = jwtDecode<{ exp: number }>(token);
      if (Date.now() >= decoded.exp * 1000) {
        AuthService.logout(); // Clear expired token
        navigate('/'); // Redirect to the About page
      } else {
        navigate('/my-characters'); // Redirect to My Characters if logged in
      }
    }
  }, [navigate]);

  return (
    <ApolloProvider client={client}>
      <Navbar />
      <div className="main-content"> {/* Scrollable container */}
        <Outlet />
      </div>
      {AuthService.loggedIn() && <PersistentDiceRoller DiceRoller={DiceRoller} />}
    </ApolloProvider>
  );
}

export default App;
