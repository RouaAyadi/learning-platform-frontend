import { gql } from '@apollo/client'

// export const MESSAGE_SENT = gql`
//   subscription OnMessageSent($sessionId: ID!) {
//     messageSent(sessionId: $sessionId) {
//       id
//       content
//       timestamp
//       sender {
//         id
//         name
//       }
//     }
//   }
// `

export const SESSION_UPDATED = gql`
  subscription OnSessionUpdated($sessionId: ID!) {
    sessionUpdated(sessionId: $sessionId) {
      id
      status
      participants
    }
  }
`

export const COURSE_UPDATED = gql`
  subscription OnCourseUpdated($courseId: ID!) {
    courseUpdated(courseId: $courseId) {
      id
      enrolledStudents
      status
    }
  }
`