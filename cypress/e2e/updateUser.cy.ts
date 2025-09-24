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
  
  it('should show warning if no changes were made', () =>{

    cy.get('button[type="saveProfile"]').click();
    cy.contains('No changes were made').should('be.visible');
  })

  it('should update user login, display it, be able to log out and able to log in /w new data', () => {

    cy.get('input[name="userLoginId"]').clear();
    cy.get('input[name="userLoginId"]').type('testupdated');

    cy.get('button[type="saveProfile"]').click();

    cy.reload();
    cy.get('[name="userLoginId"]').should('have.value', 'testupdated');

    cy.get('.logout').click();
    cy.get('.ant-modal-confirm-btns > .ant-btn-primary').click();
  
    cy.url().should('include', '/auth');

    cy.get('input[name="userLoginId"]').type('testupdated');
    cy.get('input[name="password"]').type('test');

    cy.get('button[type="submitLogin"]').click();

    cy.url().should('include', '/home');

    //revert it like this for now until db is mocked
    cy.visit('/profile');
    cy.get('input[name="userLoginId"]').clear();
    cy.get('input[name="userLoginId"]').type('test');

    cy.get('button[type="saveProfile"]').click();
  })

  it('should update the password and be able to log back in', ()=>{
    cy.get('.openPasswordModal').click();
    
    cy.get('.oldPassword').type('test', {force: true});
    cy.get('.newPassword').type('test1');
    cy.get('.confirmPassword').type('test1');

    cy.get('.savePassword').should('be.enabled').click();

    cy.get('input[name="userLoginId"]').type('test');
    cy.get('input[name="password"]').type('test1');

    cy.get('button[type="submitLogin"]').click();

    cy.url().should('include', '/home');

    //change back the password for next tests to accomodate for beforeEach login
    cy.visit('/profile');
    cy.get('.openPasswordModal').click();
    
    cy.get('.oldPassword').type('test1', {force: true});
    cy.get('.newPassword').type('test');
    cy.get('.confirmPassword').type('test');

    cy.get('.savePassword').should('be.enabled').click();
  })

  it('should not allow to save the password if confirm does not match', ()=>{
    cy.get('.openPasswordModal').click();
    
    cy.get('.oldPassword').type('test', {force: true});
    cy.get('.newPassword').type('test1');
    cy.get('.confirmPassword').type('test2');

    cy.get('.savePassword').should('be.enabled').click();
    cy.contains('New passwords do not match', {matchCase: false});
  })

  it('should display error if old password is incorrect', ()=>{
    cy.get('.openPasswordModal').click();
    
    cy.get('.oldPassword').type('test2', {force: true});
    cy.get('.newPassword').type('test1');
    cy.get('.confirmPassword').type('test1');

    cy.get('.savePassword').should('be.enabled').click();
    cy.contains('Old password is incorrect', {matchCase: false});
  })
})