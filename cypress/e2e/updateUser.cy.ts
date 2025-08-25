describe('Registration Page', () => {
  beforeEach(() => {
    cy.visit('/auth');
    cy.get('input[name="userLoginId"]').type('test');
    cy.get('input[name="password"]').type('test');

    cy.get('button[type="submitLogin"]').click();

    cy.url().should('include', '/home');
    cy.contains('Profile').click();
    cy.url().should('include', '/profile');
  });

  it('should update user login, display it, be able to log out and able to log in /w new data', () => {

    cy.get('input[name="userLoginId"]').type('1');

    cy.get('button[type="saveProfile"]').click();

    cy.reload();
    cy.get('[name="userLoginId"]').should('have.value', 'test1');

    cy.get('.anticon').click(); //logout
    cy.get('.ant-modal-confirm-btns > .ant-btn-primary').click();
  
    cy.url().should('include', '/auth');

    cy.get('input[name="userLoginId"]').type('test1');
    cy.get('input[name="password"]').type('test');

    cy.get('button[type="submitLogin"]').click();

    cy.url().should('include', '/home');
  })

  it('should show warning if no changes were made', () =>{

    cy.get('button[type="saveProfile"]').click();
    cy.contains('No changes were made').should('be.visible');
  })
})