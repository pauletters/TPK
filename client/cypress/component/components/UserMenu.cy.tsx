import UserMenu from '../../../src/components/UserMenu'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AuthService from '../../../src/utils/auth'

describe('UserMenu Component', () => {
  beforeEach(() => {
    // Mock the logged in state for each test
    cy.stub(AuthService, 'loggedIn').returns(true)
  })

  const mountUserMenu = (initialPath = '/') => {
    return cy.mount(
      <MemoryRouter initialEntries={[initialPath]}>
        <UserMenu />
      </MemoryRouter>
    )
  }

  it('renders all navigation links', () => {
    mountUserMenu()
    
    // Debug: log the rendered content
    cy.get('body').then($body => {
      console.log('Body content:', $body.html())
    })
    
    // Use more specific selectors and force visibility check
    cy.get('.user-menu .nav-link').should('have.length.at.least', 2)
    cy.get('.user-menu .nav-link').contains('My Characters').should('be.visible')
    cy.get('.user-menu .nav-link').contains('My Campaigns').should('be.visible')
  })

  it('applies active class based on current route', () => {
    // Test My Characters route
    mountUserMenu('/my-characters')
    cy.get('.user-menu .nav-link').contains('My Characters')
      .should('have.class', 'active')
      .should('be.visible')

    // Test My Campaigns route
    mountUserMenu('/my-campaigns')
    cy.get('.user-menu .nav-link').contains('My Campaigns')
      .should('have.class', 'active')
      .should('be.visible')
  })

  it('has working navigation links', () => {
    mountUserMenu()

    // Click and verify each link
    cy.get('.user-menu .nav-link').contains('My Characters')
      .should('be.visible')
      .click()
      .should('have.class', 'active')

    cy.get('.user-menu .nav-link').contains('My Campaigns')
      .should('be.visible')
      .click()
      .should('have.class', 'active')
  })
})