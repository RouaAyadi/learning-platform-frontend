export type Course = {
  id: string
  title: string
  description: string
  instructor: {
    id: number
    name: string
  }
  enrolledStudents: number
  startDate: string
  endDate: string
  status: 'upcoming' | 'in-progress' | 'completed'
}

export type Session = {
  id: string
  title: string
  courseId: string
  startTime: string
  endTime: string
  instructor: {
    id: number
    name: string
  }
  participants: number
  status: 'scheduled' | 'live' | 'ended'
  description: string
}

export type Reminder = {
  id: string
  sessionId: string
  userId: number
  reminderTime: string
} 