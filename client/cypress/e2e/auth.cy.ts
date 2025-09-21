describe('Authentication Flow', () => {
    const testUser = {
      username: 'testuser',
      email: 'testuser@test.com',
      password: 'Password123!'
    }
  
    beforeEach(() => {
      cy.visit('/')
      // Clear localStorage before each test
      cy.window().then((win) => {
        win.localStorage.clear()
      })
    })
  
    it('shows about page when user is not logged in', () => {
      cy.get('.hero-title').should('contain', 'Total Player Knowledge')
      cy.get('.hero-subtitle').should('contain', 'About')
    })
  
    it('opens auth modal and switches between login and signup', () => {
      // Click login/signup button
      cy.get('.nav-auth-link').click({ force: true })
  
      // Modal should be visible
      cy.get('.modal').should('be.visible')
  
      // Check initial login view - ensure we're looking within the active tab
      cy.get('.tab-content .active input[name="email"]').should('exist')
      cy.get('.tab-content .active input[name="password"]').should('exist')
  
      // Switch to signup
      cy.get('.modal-title .nav-link').contains('Sign Up').click({ force: true })
      cy.get('.tab-content .active input[name="username"]').should('exist')
      cy.get('.tab-content .active input[name="email"]').should('exist')
      cy.get('.tab-content .active input[name="password"]').should('exist')
  
      // Switch back to login
      cy.get('.modal-title .nav-link').contains('Login').click({ force: true })
      cy.get('.tab-content .active input[name="username"]').should('not.exist')
    })
  
    it('allows user to sign up and redirects to my characters', () => {
      // Click login/signup button
      cy.get('.nav-auth-link').click({ force: true })
  
      // Switch to signup and wait for tab content to be active
      cy.get('.modal-title .nav-link').contains('Sign Up').click({ force: true })
      cy.get('.tab-content .active').should('be.visible')
  
      // Fill in signup form within the active tab
      cy.get('.tab-content .active input[name="username"]').type(testUser.username)
      cy.get('.tab-content .active input[name="email"]').type(testUser.email)
      cy.get('.tab-content .active input[name="password"]').type(testUser.password)
  
      // Submit form
      cy.get('.tab-content .active button[type="submit"]').click()

      cy.wait(1000);
  
      // Wait for token to be set in localStorage
      // cy.window().its('localStorage').invoke('getItem', 'id_token').then((token) => {
      //   cy.log('Token in localStorage:', token);
      //   expect(token).to.exist
      // })
  
      // Then check redirect
      cy.location('pathname', { timeout: 10000 }).should('eq', '/')
  
      // // Logout to prepare for login test
      // cy.get('.nav-logout').click()
    })
  
    it('allows user to login with created account and redirects to my characters', () => {
      // Click login/signup button
      cy.get('.nav-auth-link').click({ force: true })
  
      // Wait for login tab content to be active
      cy.get('.tab-content .active').should('be.visible')
  
      // Fill in login form within the active tab
      cy.get('.tab-content .active input[name="email"]').type(testUser.email)
      cy.get('.tab-content .active input[name="password"]').type(testUser.password)
  
      // Submit form
      cy.get('.tab-content .active button[type="submit"]').click()
  
      // Wait for token to be set in localStorage
      cy.window().its('localStorage').invoke('getItem', 'id_token').should('exist')
      
      // Then check redirect
      cy.location('pathname', { timeout: 10000 }).should('eq', '/my-characters')
    })
  })