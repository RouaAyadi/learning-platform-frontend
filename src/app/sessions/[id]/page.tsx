"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/navbar";
import { useAuthStore } from "@/store/auth";
import { sessionsApi } from "@/lib/api";
import SocketIOChat from "@/components/chat/SocketIOChat";

interface Instructor {
	id: number;
	name: string;
	email: string;
	role: string;
}

interface Session {
  id: number
  title: string
  description: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'live' | 'ended'
  isLive: boolean
  instructor: {
    id: number
    name: string
  }
  courseId: number
  courseName: string
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
	const [alertSubscriptions, setAlertSubscriptions] = useState<{
		[key: string]: { subscribed: boolean; threshold: number };
	}>({
		student_inactivity: { subscribed: false, threshold: 10 },
		low_participation: { subscribed: false, threshold: 30 },
		question_failure_rate: { subscribed: false, threshold: 70 },
	});
	const [alertEventSource, setAlertEventSource] =
		useState<EventSource | null>(null);

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

	const handleAlertSubscription = async (
		alertType: string,
		threshold: number
	) => {
		try {
			if (!user?.id) return;
			await sessionsApi.subscribeToAlert(
				sessionId,
				user.id,
				alertType,
				threshold
			);
			setAlertSubscriptions((prev) => {
				const newState = {
					...prev,
					[alertType]: {
						subscribed: true,
						threshold,
					},
				};
				// Check if this is the first alert subscription
				const hasActiveAlerts = Object.values(
					newState
				).some((alert) => alert.subscribed);
				if (hasActiveAlerts && !alertEventSource) {
					const newAlertEventSource =
						sessionsApi.subscribeToAlertStream(
							sessionId
						);
					newAlertEventSource.onmessage = (
						event
					) => {
						const notification = event.data;
						window.dispatchEvent(
							new CustomEvent(
								"sse-notification",
								{
									detail: notification,
								}
							)
						);
					};
					setAlertEventSource(
						newAlertEventSource
					);
				}
				return newState;
			});
		} catch (error) {
			console.error("Failed to subscribe to alert:", error);
		}
	};

	const handleAlertUnsubscription = async (alertType: string) => {
		try {
			if (!user?.id) return;
			await sessionsApi.unsubscribeFromAlert(
				sessionId,
				user.id,
				alertType
			);
			setAlertSubscriptions((prev) => {
				const newState = {
					...prev,
					[alertType]: {
						...prev[alertType],
						subscribed: false,
					},
				};
				// Check if no alerts are active anymore
				const hasActiveAlerts = Object.values(
					newState
				).some((alert) => alert.subscribed);
				if (!hasActiveAlerts && alertEventSource) {
					alertEventSource.close();
					setAlertEventSource(null);
				}
				return newState;
			});
		} catch (error) {
			console.error(
				"Failed to unsubscribe from alert:",
				error
			);
		}
	};

	const handleThresholdChange = (
		alertType: string,
		threshold: number
	) => {
		setAlertSubscriptions((prev) => ({
			...prev,
			[alertType]: { ...prev[alertType], threshold },
		}));
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
			if (alertEventSource) {
				alertEventSource.close();
			}
		};
	}, [sessionId, isAuthenticated, router]);

	if (!isAuthenticated) {
		return null;
	}

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </>
    )
  }

	if (error || !session) {
		return (
      <>
        <Navbar />
  			<div className="container mx-auto p-4">
  				<div className="alert alert-error">
  					<span>
						{error || "Session not found"}
					</span>
  				</div>
  			</div>
      </>
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

						{/* Alert Configuration - Instructor Only */}
						{isInstructor && (
							<div className="card bg-base-200 mt-4">
								<div className="card-body p-4">
									<h3 className="text-base font-semibold mb-3 flex items-center gap-2">
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={
													2
												}
												d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zM12 12l8-8M4 4l16 16"
											/>
										</svg>
										Alert
										Configuration
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
										{Object.entries(
											alertSubscriptions
										).map(
											([
												alertType,
												config,
											]) => {
												const alertInfo =
													{
														student_inactivity:
															{
																label: "Student Inactivity",
																icon: "👤",
																desc: "Inactive students",
															},
														low_participation:
															{
																label: "Low Participation",
																icon: "📊",
																desc: "Low engagement",
															},
														question_failure_rate:
															{
																label: "Question Failures",
																icon: "❌",
																desc: "High failure rate",
															},
													};
												const info =
													alertInfo[
														alertType as keyof typeof alertInfo
													];

												return (
													<div
														key={
															alertType
														}
														className="bg-base-100 rounded-lg p-3 border border-base-300"
													>
														<div className="flex items-center justify-between mb-2">
															<div className="flex items-center gap-2">
																<span className="text-lg">
																	{
																		info.icon
																	}
																</span>
																<div>
																	<div className="text-sm font-medium">
																		{
																			info.label
																		}
																	</div>
																	<div className="text-xs text-base-content/60">
																		{
																			info.desc
																		}
																	</div>
																</div>
															</div>
															<button
																onClick={() => {
																	if (
																		config.subscribed
																	) {
																		handleAlertUnsubscription(
																			alertType
																		);
																	} else {
																		handleAlertSubscription(
																			alertType,
																			config.threshold
																		);
																	}
																}}
																className={`btn btn-xs ${
																	config.subscribed
																		? "btn-success"
																		: "btn-outline"
																}`}
															>
																{config.subscribed
																	? "ON"
																	: "OFF"}
															</button>
														</div>
														<div className="flex items-center gap-2 text-xs">
															<span>
																Threshold:
															</span>
															<input
																type="range"
																min="0"
																max="100"
																value={
																	config.threshold
																}
																className="range range-xs range-primary flex-1"
																onChange={(
																	e
																) =>
																	handleThresholdChange(
																		alertType,
																		parseInt(
																			e
																				.target
																				.value
																		)
																	)
																}
															/>
															<span className="font-medium w-8">
																{
																	config.threshold
																}

																%
															</span>
														</div>
													</div>
												);
											}
										)}
									</div>
								</div>
							</div>
						)}
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
