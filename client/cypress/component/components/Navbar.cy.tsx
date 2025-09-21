import { mount } from 'cypress/react18'
import Navbar from '../../../src/components/Navbar'
import { BrowserRouter } from 'react-router-dom'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import AuthService from '../../../src/utils/auth'

describe('Navbar Component', () => {
  const mockClient = new ApolloClient({
    cache: new InMemoryCache(),
    uri: 'http://localhost:3001/graphql',
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
      },
      query: {
        fetchPolicy: 'no-cache',
      },
    },
  })

  beforeEach(() => {
    // Mock localStorage methods
    cy.window().then((win) => {
      win.localStorage.clear()
    })
  })

  const mountNavbar = () => {
    cy.mount(
      <ApolloProvider client={mockClient}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </ApolloProvider>
    )
  }

  it('renders the logo', () => {
    mountNavbar()
    cy.get('.navbar-brand img').should('exist')
    cy.get('.navbar-brand').should('have.attr', 'href', '/about')
  })

  it('shows login/signup when logged out', () => {
    cy.stub(AuthService, 'loggedIn').returns(false)
    mountNavbar()
    
    cy.get('.nav-auth-link').should('exist')
    cy.get('.nav-auth-link').should('contain', 'Login/Sign Up')
    cy.get('.nav-logout').should('not.exist')
  })

  it('shows logout when logged in', () => {
    cy.stub(AuthService, 'loggedIn').returns(true)
    mountNavbar()
    
    cy.get('.nav-auth-link').should('not.exist')
    cy.get('.nav-logout').should('exist')
  })

  it('opens auth modal on login/signup click', () => {
    cy.stub(AuthService, 'loggedIn').returns(false)
    mountNavbar()
    
    cy.get('.nav-auth-link').click({ force: true })
    cy.get('.modal').should('be.visible')
    cy.get('.modal-title').should('exist')
    
    // Check both login and signup tabs exist
    cy.get('.nav-link').contains('Login').should('exist')
    cy.get('.nav-link').contains('Sign Up').should('exist')
  })

  it('handles logout click', () => {
    cy.stub(AuthService, 'loggedIn').returns(true)
    cy.stub(AuthService, 'logout').as('logoutStub')
    mountNavbar()
    
    cy.get('.nav-logout').click()
    cy.get('@logoutStub').should('have.been.called')
  })
})