import axios from 'axios';
import type { AuthResponse, User } from '@/store/auth';

interface Instructor {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Session {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'live' | 'ended';
  isLive: boolean;
  instructor: Instructor;
  participants: number;
  courseId: number;
  courseName: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: Instructor;
  enrolledStudents: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'in-progress' | 'completed';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3300';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API endpoints
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/user/login', { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/user', { name, email, password });
    return response.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/user/');
    return response.data;
  },
};

// Sessions API endpoints
export const sessionsApi = {
  getAllSessions: async (): Promise<Session[]> => {
    const response = await api.get<Session[]>('/sessions');
    return response.data;
  },
  getCoursesSessions: async (courseId: number): Promise<Session[]> => {
    const response = await api.get<Session[]>(`/courses/${courseId}/sessions`);
    return response.data;
  },
  getSession: async (sessionId: number): Promise<Session> => {
    const response = await api.get<Session>(`/sessions/${sessionId}`);
    return response.data;
  },
}; 