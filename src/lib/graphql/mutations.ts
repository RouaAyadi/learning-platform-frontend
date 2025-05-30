import { gql } from '@apollo/client'

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
      }
      course {
        id
        title
      }
    }
  }
`

export const START_LIVE_SESSION = gql`
  mutation StartLiveSession($id: Int!) {
    startLiveSession(id: $id) {
      id
      isLive
    }
  }
`

export const END_LIVE_SESSION = gql`
  mutation EndLiveSession($id: Int!) {
    endLiveSession(id: $id) {
      id
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