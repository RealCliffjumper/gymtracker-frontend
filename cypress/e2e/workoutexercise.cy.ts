describe('template spec', () => {
  beforeEach(() => {
    cy.visit('/auth');
    cy.get('input[name="userLoginId"]').type('test');
    cy.get('input[name="password"]').type('test');

    cy.get('button[type="submitLogin"]').click();

    cy.url().should('include', '/home');
    cy.contains('My Workouts').click();
    cy.url().should('include', '/workouts');
    cy.contains('test2').click();
  });


  
function addExercise(exerciseName: string, reps: string, weight: string) {
  cy.get('.searchBar').click();
  cy.get('.cdk-overlay-container')
    .contains('.ant-select-item-option', exerciseName)
    .click();

  cy.get('.add-btn').click();
  cy.get('.reps').type(reps, { force: true });
  cy.get('.weight').type(weight, {force: true});
  cy.get('.saveExerciseBtn').click();
}

it('should only show filtered exercises', ()=>{
  cy.get('.muscleGroup').click();
  cy.contains('Chest').click();
  cy.get('.muscleGroup').click();

  cy.get('.searchBar').click();
  cy.get('.cdk-overlay-container')
    .contains('.ant-select-item-option', 'chest hit').should('exist')
  cy.get('.cdk-overlay-container')
    .contains('.ant-select-item-option', 'back hit').should('not.exist') //for now I dont have that many exercises loaded in so later this test will be iterating over an array of filters and exercises to check for multiple cases

})

it('should add an exercise with one set to a workout and display it',()=>{
    cy.get('.searchBar').click();
    cy.get('.cdk-overlay-container')
    .contains('.ant-select-item-option', 'back hit')
    .click();
    cy.get('.add-btn').click();

    cy.get('.reps').type('10', {force: true});
    cy.get('.weight').type('20', {force: true});

    cy.get('.saveExerciseBtn').click();

    cy.get('.exercise-list').contains('back hit');

    //quickly delete it here for the next test until I mock the db
    cy.get('.removeExercise').click()
  })

  it('should add two exercises and only show the superset icon after',()=>{
    addExercise('back hit', '10', '20');

    cy.get('.supersetBtn').should('not.exist')

    addExercise('chest hit', '12', '50');

    cy.get('.supersetBtn');

  })

  it('should add a set, edit reps and weight for an existing one and persist the changes', ()=>{
    cy.get('.editExercise').first().click()
    cy.contains('edit exercise in workout', {matchCase:false});

    cy.get('.reps').eq(0).clear();
    cy.get('.reps').eq(0).type('12', {force: true});
    cy.get('.weight').eq(0).clear();
    cy.get('.weight').eq(0).type('25', {force: true}); 

    cy.get('.addSet').click();
    cy.contains('set 2', {matchCase: false});

    cy.get('.reps').eq(1).type('12', {force: true});
    cy.get('.weight').eq(1).type('22', {force: true}); //if doing more than two set elements could look into making a function

    cy.get('.saveExerciseBtn').click();

    cy.get('.editExercise').first().click()
    cy.contains('edit exercise in workout', {matchCase:false});

    cy.get('.reps').eq(0).should('have.value', '12');
    cy.get('.weight').eq(0).should('have.value','25'); 

    cy.get('.reps').eq(1).should('have.value', '12');
    cy.get('.weight').eq(1).should('have.value','22');

    cy.contains('Cancel').click()

    
  })

  it('should superset group exercsises and display a colour', ()=>{
    cy.get('.supersetBtn').eq(0).click();
    cy.get('.supersetBtn').eq(1).click();

    cy.get('.exercise-item').eq(0).should('have.css', 'border-left').and('match', /4px solid rgb/);
    cy.get('.exercise-item').eq(1).should('have.css', 'border-left').and('match', /4px solid rgb/);

  })

  it('should unlink supersets if clicked on icons again and have no colour', ()=>{
    cy.get('.supersetBtn').eq(0).click();
    cy.get('.supersetBtn').eq(1).click();

    cy.get('.exercise-item').eq(0).should('have.css', 'border-left', '4px solid rgba(0, 0, 0, 0)')
    cy.get('.exercise-item').eq(1).should('have.css', 'border-left', '4px solid rgba(0, 0, 0, 0)')

    //delete the exercises
    cy.get('.removeExercise').eq(0).click();
    cy.get('.removeExercise').eq(0).click(); //have to do like this because the page gets rebuilt and only one clickable element remains hence 0
  })
})
