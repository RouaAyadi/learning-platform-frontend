"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/navbar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useAuthStore } from "@/store/auth";
import { sessionsApi } from "@/lib/api";

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
	instructor: Instructor;
	participants: number;
}

export default function SessionPage() {
	const params = useParams();
	const router = useRouter();
	const { isAuthenticated, getUser } = useAuthStore();
	const sessionId = parseInt(params.id as string, 10);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [eventSource, setEventSource] = useState<EventSource | null>(
		null
	);

	const user = getUser();
	const isInstructor = user?.role === "instructor";

	const handleSubscribeToNotifications = () => {
		if (eventSource) {
			eventSource.close();
		}
		const newEventSource =
			sessionsApi.subscribeToSessionEvents(sessionId);

		newEventSource.onmessage = (event) => {
			const notification = event.data;
			window.dispatchEvent(
				new CustomEvent("sse-notification", {
					detail: notification,
				})
			);
		};

		setEventSource(newEventSource);
		setIsSubscribed(true);
	};

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
			return;
		}

		const fetchSession = async () => {
			try {
				const data = await sessionsApi.getSession(
					sessionId
				);
				setSession(data as Session);
				setLoading(false);
			} catch (err) {
				setError("Failed to load session");
				setLoading(false);
			}
		};

		fetchSession();

		// Poll for session updates every 30 seconds
		const interval = setInterval(fetchSession, 30000);
		return () => {
			clearInterval(interval);
			if (eventSource) {
				eventSource.close();
			}
		};
	}, [sessionId, isAuthenticated, router]);

	if (!isAuthenticated) {
		return null;
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-base-100 flex items-center justify-center">
				<div className="loading loading-spinner loading-lg"></div>
			</div>
		);
	}

	if (error || !session) {
		return (
			<div className="min-h-screen bg-base-100 flex items-center justify-center">
				<div className="alert alert-error">
					<span>
						{error || "Session not found"}
					</span>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-base-100">
			<Navbar />
			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Session Content */}
					<div className="lg:col-span-2">
						<div className="card bg-base-200">
							<div className="card-body">
								<div className="flex items-center justify-between">
									<h2 className="card-title">
										{
											session.title
										}
									</h2>
									<div className="flex items-center gap-2">
										<span
											className={`badge ${
												session.status ===
												"live"
													? "badge-success"
													: "badge-warning"
											}`}
										>
											{
												session.status
											}
										</span>
										{isInstructor && (
											<button
												onClick={
													handleSubscribeToNotifications
												}
												className={`btn btn-sm ${
													isSubscribed
														? "btn-success"
														: "btn-primary"
												}`}
												disabled={
													isSubscribed
												}
											>
												{isSubscribed
													? "Subscribed to Notifications"
													: "Subscribe to Notifications"}
											</button>
										)}
									</div>
								</div>
								<p className="text-base-content/70">
									{
										session.description
									}
								</p>
								<div className="flex items-center gap-4 mt-4 text-sm text-base-content/70">
									<div>
										<span className="font-medium">
											Instructor:
										</span>{" "}
										{
											session
												.instructor
												.name
										}
									</div>
									<div>
										<span className="font-medium">
											Participants:
										</span>{" "}
										{
											session.participants
										}
									</div>
									<div>
										<span className="font-medium">
											Duration:
										</span>{" "}
										{new Date(
											session.startTime
										).toLocaleTimeString()}{" "}
										-{" "}
										{new Date(
											session.endTime
										).toLocaleTimeString()}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Chat Window */}
					<div className="lg:col-span-1">
						<ChatWindow
							sessionId={sessionId.toString()}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}
