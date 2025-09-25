describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/auth');
  });

  it('should display login form', () => {

    cy.get('input[name="userLoginId"]').should('exist');
    cy.get('input[name="password"]').should('exist');
  });

  it('should login with valid credentials', () => {

    cy.get('input[name="userLoginId"]').type('test');
    cy.get('input[name="password"]').type('test');

    cy.get('button[type="submitLogin"]').click();


    cy.url().should('include', '/home');
  });

  it('should show error for invalid credentials and stay on /auth', () => {

    cy.get('input[name="userLoginId"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');

    cy.get('button[type="submitLogin"]').click();

    cy.contains('Invalid credentials').should('be.visible');
    cy.url().should('include', '/auth');
  });

  it('should login and not be able to go back to /auth', ()=>{

    cy.get('input[name="userLoginId"]').type('test');
    cy.get('input[name="password"]').type('test');

    cy.get('button[type="submitLogin"]').click();

    cy.url().should('include', '/home'); //first home redirect after auth

    cy.visit('/auth'); //trying to access auth while logged in

    cy.url().should('include', '/home'); //redirects back to /home
  })

  afterEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });
});