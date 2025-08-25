describe('Registration Page', () => {
  beforeEach(() => {
    cy.visit('/auth');
    cy.contains('Signup').click();
  });

   it('should display signup form', () => {
    
    cy.get('input[name="userLoginId"]:visible').should('exist')
    cy.get('input[name="firstName"]').should('exist');
    cy.get('input[name="lastName"]').should('exist');
    cy.get('input[name="password"]:visible').should('exist');
    cy.get('input[name="confirmPassword"]').should('exist');
  });

  it('should register a new user', () => {

    cy.get('input[name="userLoginId"]:visible').type('newuser@example.com');
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="password"]:visible').type('test');
    cy.get('input[name="confirmPassword"]').type('test');

    cy.get('button[type="submitSignup"]').click();

    cy.url().should('include', '/home');
  });

  it('should show error on password mismatch',() => {
    
    cy.get('input[name="userLoginId"]:visible').type('newuser@example.com');
    cy.get('input[name="firstName"]').type('New');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="password"]:visible').type('test');
    cy.get('input[name="confirmPassword"]').type('testt');

    cy.get('button[type="submitSignup"]').click();

    cy.contains('Passwords do not match').should('be.visible');
    cy.url().should('include', '/auth');
  });

  it('should show error on username already exists', () =>{

    cy.intercept('POST', '/api/auth/registration', {
    statusCode: 409
    });

    cy.get('input[name="userLoginId"]:visible').type('test@example.com');
    cy.get('input[name="firstName"]').type('New');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="password"]:visible').type('test');
    cy.get('input[name="confirmPassword"]').type('test');

    cy.get('button[type="submitSignup"]').click();

    cy.contains('Username already exists').should('be.visible');
    cy.url().should('include', '/auth');
  })

});