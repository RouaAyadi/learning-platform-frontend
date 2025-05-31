import { gql } from '@apollo/client'

export const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      title
      description
      instructor {
        id
        name
        email
        role
      }
      sessions {
        id
        title
        startTime
        isLive
      }
    }
  }
`

export const GET_COURSE = gql`
  query GetCourse($id: Int!) {
    course(id: $id) {
      id
      title
      description
      instructor {
        id
        name
      }
      sessions {
        id
        title
        startTime
        isLive
      }
    }
  }
`

export const GET_SESSIONS = gql`
  query GetSessions {
    sessions {
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
      messages {
        id
        content
        timestamp
      }
      quizzes {
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
  }
`

export const GET_SESSION = gql`
  query GetSession($id: Int!) {
    session(id: $id) {
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
      messages {
        id
        content
        timestamp
      }
      quizzes {
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
  }
`

export const GET_MESSAGES = gql`
  query GetMessages($sessionId: Int!) {
    messagesBySession(sessionId: $sessionId) {
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

export const GET_RECENT_MESSAGES = gql`
  query GetRecentMessages($sessionId: Int!, $limit: Int!) {
    recentMessages(sessionId: $sessionId, limit: $limit) {
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