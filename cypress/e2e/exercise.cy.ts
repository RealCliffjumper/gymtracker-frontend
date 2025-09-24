describe('Exercise interactions', () => {

   beforeEach(() => {
    cy.visit('/auth');
    cy.get('input[name="userLoginId"]').type('test');
    cy.get('input[name="password"]').type('test');

    cy.get('button[type="submitLogin"]').click();

    cy.url().should('include', '/home');
    cy.contains('Profile').click();
    cy.url().should('include', '/profile');
  })

  it('should create an exercise from profile page and display it on reload', ()=>{
    cy.get('.addExerciseBtn').click();
    cy.contains('Create New Exercise').should('exist');

    cy.get('.exerciseName').type('cypressExercise', {force:true});
    cy.get('.exerciseDesc').type('a cypress exercise');
    cy.get('.exerciseGroup').click()
    cy.contains('Legs').click();
    cy.get('.exerciseEquip').click();
    cy.contains('Machine').click();

    cy.get('.save-exercise-btn').click();
    cy.reload();

    cy.get('.exercises-panel').contains('cypressExercise');
  })

   it('should update the exercise and persist the changes', ()=>{
    cy.get('.exercises-panel').contains('cypressExercise').click();

    cy.get('.exerciseName').clear()
    cy.get('.exerciseName').type('updatedExercise');
    cy.get('.exerciseDesc').clear()
    cy.get('.exerciseDesc').type('an updated exercise');
    
    cy.get('.exerciseGroup').click()
    cy.contains('Chest').click();
    cy.get('.exerciseEquip').click();
    cy.contains('Barbell').click();

    cy.get('.save-exercise-btn').click();
    cy.reload();

    cy.get('.exerciseName').should('have.value', 'updatedExercise');
    cy.get('.exerciseDesc').should('have.value', 'an updated exercise');
    cy.get('.exerciseGroup').should('contain', 'Chest')
    cy.get('.exerciseEquip').should('contain', 'Barbell')
  })

  it('should delete the exercise and not display it', ()=>{
    cy.get('.exercises-panel').contains('updatedExercise').click();
    
    cy.get('.delete-exercise-btn').click()
    cy.contains('Yes').click()

    cy.get('.exercises-panel').should('not.have','updatedExercise');
    
  })

  it('should create an exercise on workout page and display it on profile and in list', ()=>{
    cy.visit('/workouts');
    cy.contains('test').click();

    cy.get('.searchBar').click();
    cy.contains('create an exercise', {matchCase:false}).click();

    cy.contains('Create New Exercise').should('exist');

    cy.get('.exerciseName').type('cypressExercise', {force:true});
    cy.get('.exerciseDesc').type('a cypress exercise');
    cy.get('.exerciseGroup').click()
    cy.contains('Legs').click();
    cy.get('.exerciseEquip').click();
    cy.contains('Machine').click();

    cy.get('.save-exercise-btn').click();

    cy.get('.searchBar').click();
    cy.contains('cypressExercise');

    cy.visit('/profile');
    cy.get('.exercises-panel').contains('cypressExercise');

    //and just delete it in here until I mock the db
    cy.get('.exercises-panel').contains('cypressExercise').click();
    cy.get('.delete-exercise-btn').click()
    cy.contains('Yes').click()

  })
});
