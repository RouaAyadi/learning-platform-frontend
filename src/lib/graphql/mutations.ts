import { gql } from '@apollo/client'

export const CREATE_COURSE = gql`
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      id
      title
      description
      instructor {
        id
        name
      }
      enrolledStudents
      startDate
      endDate
      status
    }
  }
`

export const CREATE_SESSION = gql`
  mutation CreateSession($input: CreateSessionInput!) {
    createSession(createSessionInput: $input) {
      id
      title
      startTime
      isLive
      instructor {
        id
        name
        email
        role
      }
      course {
        id
        title
        description
      }
    }
  }
`

export const START_LIVE_SESSION = gql`
  mutation StartLiveSession($id: Int!) {
    startLiveSession(id: $id) {
      id
      title
      startTime
      isLive
    }
  }
`

export const END_LIVE_SESSION = gql`
  mutation EndLiveSession($id: Int!) {
    endLiveSession(id: $id) {
      id
      title
      startTime
      isLive
    }
  }
`

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(createMessageInput: $input) {
      id
      content
      timestamp
      sender {
        id
        name
        email
        role
      }
    }
  }
`

export const CREATE_QUIZ = gql`
  mutation CreateQuiz($input: CreateQuizInput!) {
    createQuiz(createQuizInput: $input) {
      id
      title
      questions {
        id
        questionText
        options
        correctAnswerIndex
      }
    }
  }
`

export const CREATE_QUIZ_QUESTION = gql`
  mutation CreateQuizQuestion($quizId: Int!, $input: CreateQuizQuestionInput!) {
    createQuizQuestion(quizId: $quizId, createQuizQuestionInput: $input) {
      id
      questionText
      options
      correctAnswerIndex
    }
  }
`

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: CreateMessageInput!) {
    createMessage(createMessageInput: $input) {
      id
      content
      timestamp
      sender {
        id
        name
      }
    }
  }
`

export const SET_REMINDER = gql`
  mutation SetReminder($input: SetReminderInput!) {
    setReminder(input: $input) {
      id
      sessionId
      userId
      reminderTime
    }
  }
`

export const JOIN_SESSION = gql`
  mutation JoinSession($sessionId: Int!) {
    joinSession(sessionId: $sessionId) {
      id
      participants
    }
  }
`