describe('Navigation', () => {
    const testUser = {
      email: 'testuser@test.com',
      password: 'Password123!'
    }
  
    beforeEach(() => {
      cy.visit('/')
      
      // Click login button and wait for modal
      cy.get('.nav-auth-link').click({ force: true })
      cy.get('.modal').should('be.visible')
  
      // Wait for tab content to be active
      cy.get('.tab-pane.active').should('be.visible')
  
      // Fill in login form in active tab
      cy.get('.tab-pane.active input[name="email"]').should('be.visible').type(testUser.email)
      cy.get('.tab-pane.active input[name="password"]').should('be.visible').type(testUser.password)
      cy.get('.tab-pane.active button[type="submit"]').click()
  
      // Wait for redirect after login
      cy.url().should('include', '/my-characters')
    })
  
    it('navigates to all pages correctly', () => {
      // Test My Characters navigation
      cy.contains('.user-menu .nav-link', 'My Characters').click()
      cy.url().should('include', '/my-characters')
      cy.get('h1').should('contain', 'My Characters')
  
      // Test My Campaigns navigation
      cy.contains('.user-menu .nav-link', 'My Campaigns').click()
      cy.url().should('include', '/my-campaigns')
      cy.get('h1').should('contain', 'My Campaigns')
  
      // Test About navigation
      cy.contains('.navbar .nav-link', 'About').click()
      cy.url().should('include', '/about')
      cy.get('.hero-title').should('contain', 'Total Player Knowledge')
    })
  
    it('logs out and redirects to about page', () => {
      // Click logout and wait for redirect
      cy.get('.nav-logout').click()
      
      // Wait for storage to be cleared
      cy.window().its('localStorage').invoke('getItem', 'id_token').should('be.null')
      
      // Wait for URL to update
      cy.location('pathname').should('eq', '/')
      
      // Verify we're on the about page
      cy.get('.hero-title').should('contain', 'Total Player Knowledge')
  
      // Login button should be visible again
      cy.get('.nav-auth-link').should('exist')
    })
  })