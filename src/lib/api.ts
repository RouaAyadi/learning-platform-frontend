import axios from "axios";
import type { AuthResponse, User } from "@/store/auth";
import { getAuthToken } from '@/lib/auth';

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
	status: "scheduled" | "live" | "ended";
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
	status: "upcoming" | "in-progress" | "completed";
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3300";

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("auth-token");
	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Auth API endpoints
export const authApi = {
	login: async (
		email: string,
		password: string
	): Promise<AuthResponse> => {
		try {
			const payload = {
				username: email,
				password,
			};
			console.log("Login payload:", payload);
			const response = await api.post<AuthResponse>(
				"/user/login",
				payload
			);
			return response.data;
		} catch (error: any) {
			console.error("Login error details:", {
				response: error.response?.data,
				status: error.response?.status,
				headers: error.response?.headers,
			});
			throw error;
		}
	},
	register: async (
		name: string,
		email: string,
		password: string
	): Promise<AuthResponse> => {
		try {
			const payload = {
				name,
				email,
				password,
			};
			console.log("Registration payload:", payload);
			const response = await api.post<AuthResponse>(
				"/user",
				payload
			);
			return response.data;
		} catch (error: any) {
			console.error("Registration error details:", {
				response: error.response?.data,
				status: error.response?.status,
				headers: error.response?.headers,
			});
			throw error;
		}
	},
	getCurrentUser: async (): Promise<User> => {
		const response = await api.get<User>("/user/");
		return response.data;
	},
};

// Sessions API endpoints
export const sessionsApi = {
	getAllSessions: async (): Promise<Session[]> => {
		const response = await api.get<Session[]>("/sessions");
		return response.data;
	},
	getCoursesSessions: async (courseId: number): Promise<Session[]> => {
		const response = await api.get<Session[]>(
			`/courses/${courseId}/sessions`
		);
		return response.data;
	},
	getSession: async (sessionId: number): Promise<Session> => {
		const response = await api.get<Session>(
			`/sessions/${sessionId}`
		);
		return response.data;
	},
	subscribeToSessionEvents: (sessionId: number): EventSource => {
		const url = `${API_BASE_URL}/analytics/events?sessionId=${sessionId}`;
		const eventSource = new EventSource(url);
		return eventSource;
	},
	subscribeToAlert: async (
		sessionId: number,
		instructorId: number,
		alertType: string,
		threshold?: number
	) => {
		const response = await api.post("/analytics/alerts/subscribe", {
			sessionId: sessionId.toString(),
			instructorId: instructorId.toString(),
			alertType,
			...(threshold && { threshold }),
		});
		return response.data;
	},
	unsubscribeFromAlert: async (
		sessionId: number,
		instructorId: number,
		alertType: string
	) => {
		const response = await api.delete(
			`/analytics/alerts/unsubscribe/${sessionId}/${instructorId}/${alertType}`
		);
		return response.data;
	},
  subscribeToAlertStream: (sessionId: number): EventSource => {
		const url = `${API_BASE_URL}/analytics/alerts/stream?sessionId=${sessionId}`;
		const eventSource = new EventSource(url);
		return eventSource;
	},
};

export const coursesApi = {
  async getCourse(courseId: number) {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course');
    }

    return response.json();
  },

  async getCourses() {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    return response.json();
  },

  async createCourse(data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create course');
    }

    return response.json();
  },
	subscribeToAlertStream: (sessionId: number): EventSource => {
		const url = `${API_BASE_URL}/analytics/alerts/stream?sessionId=${sessionId}`;
		const eventSource = new EventSource(url);
		return eventSource;
	},
};
