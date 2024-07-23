/// <reference types='cypress'/>

const tgBaseURL = 'https://api.tech-global-training.com/instructors'

describe('TechGlobal Student-Instructor APIs', () => {
  let newStudentID
  let instructor_id = Math.floor(Math.random() * 4 + 1)

  it('TASK-1: Get All Instructors', () => {
    cy.request({
      method: 'GET',
      url: `${tgBaseURL}`,
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.length).to.be.gte(4)
      console.log(JSON.stringify(response.body, null, 2))
      response.body.forEach((instructor, index) => {
        expect(instructor).to.have.property('INSTRUCTOR_ID')
        expect(instructor).to.have.property('FULLNAME')
        expect(instructor).to.have.property('STUDENTS')
        expect(instructor.STUDENTS).is.an('array')
        expect(instructor.INSTRUCTOR_ID).to.eq(index + 1)
      })
    })
  })

  it('TASK-2: Get A Single Instructor', () => {
    cy.request({
      method: 'GET',
      url: `${tgBaseURL}/${instructor_id}`,
    }).then((response) => {
      console.log(JSON.stringify(response.body, null, 2))

      expect(response.status).to.eq(200)
      expect(response.body.INSTRUCTOR_ID).to.eq(instructor_id)
      expect(response.body).to.have.property('FULLNAME')
      expect(response.body).to.have.property('STUDENTS')
      expect(response.body.STUDENTS).is.an('array')
    })
  })

  it('TASK-3: Create a New Student and Validate the Instructor', () => {
    let studentData = {
      DOB: '1990-12-12',
      EMAIL: 'SkriptBond@gmail.com',
      FIRST_NAME: 'Skript',
      LAST_NAME: 'Bond',
      INSTRUCTOR_ID: instructor_id,
    }

    cy.request({
      method: 'POST',
      url: `https://api.tech-global-training.com/students`,
      body: studentData,
    }).then((response) => {
      newStudentID = response.body.STUDENT_ID

      console.log(JSON.stringify(response.body, null, 2))

      expect(response.status).to.eq(201)

      // Ensure the GET request runs after the POST request has completed
      cy.request({
        method: 'GET',
        url: `${tgBaseURL}/${instructor_id}`,
      }).then((response) => {
        console.log(JSON.stringify(response.body, null, 2))

        expect(response.status).to.eq(200)

        const students = response.body.STUDENTS
        const studentExists = students.some((student) => student.STUDENT_ID === newStudentID)
        expect(studentExists).to.be.true

        cy.log(`Student ID ${newStudentID}`)

        // NESTED THEN
        cy.request({
          method: 'DELETE',
          url: `https://api.tech-global-training.com/students/${newStudentID}`,
        }).then((response) => {
          console.log(JSON.stringify(response.body, null, 2))
          cy.log(newStudentID)
          expect(response.status).to.eq(204)
        })
      })
    })
  })
})