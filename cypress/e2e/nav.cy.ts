describe('Navigation tests', () => {
  it('should navigate to correct pages from clicking tabs in navbar', () =>{
    //login
    cy.visit('/auth');
    cy.get('input[name="userLoginId"]').type('test');
    cy.get('input[name="password"]').type('test');

    cy.get('button[type="submitLogin"]').click();

    cy.url().should('include', '/home');

    //tabs check
    const navLinks = [
    { text: 'Home', route: '/home' },
    { text: 'Profile', route: '/profile' },
    { text: 'My Workouts', route: '/workouts' },
    { text: 'My Plans', route: '/plans' }
    ];

    navLinks.forEach(link => {
      cy.contains(link.text).click();
      cy.url().should('include', link.route);
    });
  });

  it('should not be able to visit pages without authorization',()=>{
  const protectedRoutes = ['/home', '/workouts', '/profile', '/plans'];

  protectedRoutes.forEach(route => {
      cy.visit(route);
      cy.url().should('include', '/auth');
      cy.contains('Please login first').should('be.visible');
    });
  })

  it('should redirect to not-found if page doesnt exist then /home if user authenticated ', ()=>{
    //authenticate
    cy.visit('/auth');
    cy.get('input[name="userLoginId"]').type('test');
    cy.get('input[name="password"]').type('test');

    cy.get('button[type="submitLogin"]').click();

    cy.url().should('include', '/home');

    //check not-foundf
    cy.visit('randompage');
    cy.url().should('include', '/not-found');

    cy.get('[name="homeLink"]').click();
    cy.url().should('include', '/home');
  })

  it('should redirect to not-found if page doesnt exist then /auth if user !authenticated', ()=>{
    cy.visit('randompage');
    cy.url().should('include', '/not-found');

    cy.get('[name="homeLink"]').click();
    cy.url().should('include', '/auth');
    cy.contains('Please login first').should('be.visible');
  })
})