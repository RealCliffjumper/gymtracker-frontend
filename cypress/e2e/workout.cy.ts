describe('Workout interactions', () => {
   beforeEach(() => {
    cy.visit('/auth');
    cy.get('input[name="userLoginId"]').type('test');
    cy.get('input[name="password"]').type('test');

    cy.get('button[type="submitLogin"]').click();

    cy.url().should('include', '/home');
    cy.contains('My Workouts').click();
    cy.url().should('include', '/workouts');
  });

  it('should create a workout, move back to workouts and display it', ()=>{
    cy.get('.add-workout-btn').click();

    cy.url().should('include', 'new-workout');
    cy.get('.workoutName').should('have.value','New Workout');
    cy.get('.exercise-list').should('not.exist');

    cy.get('.workoutName').clear();
    cy.get('.workoutName').type('cypressWorkout');
    cy.get('.save-btn').click();

    cy.url().should('include', 'cypressWorkout');
    cy.get('.delete-btn').should('exist');
    cy.get('.exercise-list').should('exist');

    cy.visit('/workouts')
    cy.contains('cypressWorkout');
  })

  it('should update the created workout and display the changes', ()=>{
    cy.contains('cypressWorkout').click();
    cy.get('.workoutName').clear();
    cy.get('.workoutName').type('updatedWorkout');
    cy.get('.save-btn').click();
    cy.contains('Applied changes to workout');

    cy.reload()
    cy.url().should('include', 'updatedWorkout');

    cy.visit('/workouts');
    cy.contains('updatedWorkout');
  })
  
  it('should delete the workout and not display it', ()=>{
    cy.contains('updatedWorkout').click();
    cy.get('.delete-btn').click()
    cy.contains('Ok').click()

    cy.url().should('include', 'workouts')
    cy.contains('updatedWorkout').should('not.exist')
  })
})