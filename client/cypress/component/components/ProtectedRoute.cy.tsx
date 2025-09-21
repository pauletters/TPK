import { mount } from 'cypress/react18'
import ProtectedRoute from '../../../src/components/ProtectedRoute'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AuthService from '../../../src/utils/auth'

describe('ProtectedRoute Component', () => {
  const TestComponent = () => (
    <div data-testid="protected-content">Protected Content</div>
  )

  const mountProtectedRoute = () => {
    return cy.mount(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders children when logged in', () => {
    // Mock the logged in state before mounting
    cy.stub(AuthService, 'loggedIn').returns(true)
    
    mountProtectedRoute()
    
    // Verify protected content is visible
    cy.get('[data-testid="protected-content"]').should('be.visible')
  })

  it('redirects to home when not logged in', () => {
    // Mock the logged out state before mounting
    cy.stub(AuthService, 'loggedIn').returns(false)
    
    mountProtectedRoute()
    
    // Verify we're redirected and protected content is not visible
    cy.get('[data-testid="protected-content"]').should('not.exist')
    cy.get('div').should('contain', 'Home Page')
  })
})