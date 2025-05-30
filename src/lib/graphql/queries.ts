import { gql } from '@apollo/client'

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
      }
      course {
        id
        title
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
      }
      course {
        id
        title
      }
      messages {
        id
        content
        timestamp
        sender {
          id
          name
        }
      }
      quizzes {
        id
        title
        questions {
          id
          questionText
          options
        }
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

export const GET_COURSES = gql`
  query GetCourses {
    courses {
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