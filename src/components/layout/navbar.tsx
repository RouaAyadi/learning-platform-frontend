"use client";

import { Fragment, useState, useEffect } from "react";
import { Disclosure, Menu, MenuButton, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, BellIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useAuthStore } from "@/store/auth";

const navigation = [
	{ name: "Dashboard", href: "/dashboard" },
	{ name: "Courses", href: "/courses" },
	{ name: "Live Sessions", href: "/sessions" },
];

export default function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const { logout, getUser } = useAuthStore();
	const [notifications, setNotifications] = useState<string[]>([]);

	const handleLogout = () => {
		logout();
		router.push("/login");
	};

	const user = getUser();

	// Listen for SSE notifications from window events
	useEffect(() => {
		const handleNotification = (event: CustomEvent) => {
			setNotifications((prev) => [...prev, event.detail]);
		};

		window.addEventListener(
			"sse-notification",
			handleNotification as EventListener
		);
		return () => {
			window.removeEventListener(
				"sse-notification",
				handleNotification as EventListener
			);
		};
	}, []);

	// Get user's initials for the avatar
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const userInitials = user?.name ? getInitials(user.name) : "UN";

	return (
		<Disclosure as="nav" className="bg-base-200">
			{({ open }) => (
				<>
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="flex h-16 justify-between">
							<div className="flex">
								<div className="flex flex-shrink-0 items-center">
									<Link
										href="/"
										className="text-2xl font-bold"
									>
										Learning
										Platform
									</Link>
								</div>
								<div className="hidden sm:ml-6 sm:flex sm:space-x-8">
									{navigation.map(
										(
											item
										) => (
											<Link
												key={
													item.name
												}
												href={
													item.href
												}
												className={clsx(
													"inline-flex items-center px-1 pt-1 text-sm font-medium",
													pathname ===
														item.href
														? "border-primary border-b-2 text-primary"
														: "border-transparent text-base-content hover:border-base-content/20 hover:text-base-content/80"
												)}
											>
												{
													item.name
												}
											</Link>
										)
									)}
								</div>
							</div>
							<div className="hidden sm:ml-6 sm:flex sm:items-center">
								<Menu
									as="div"
									className="relative ml-3"
								>
									<MenuButton className="btn btn-circle btn-ghost relative">
										<BellIcon className="h-6 w-6" />
										{notifications.length >
											0 && (
											<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
												{
													notifications.length
												}
											</span>
										)}
									</MenuButton>
									<Transition
										as={
											Fragment
										}
										enter="transition ease-out duration-200"
										enterFrom="transform opacity-0 scale-95"
										enterTo="transform opacity-100 scale-100"
										leave="transition ease-in duration-75"
										leaveFrom="transform opacity-100 scale-100"
										leaveTo="transform opacity-0 scale-95"
									>
										<Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-base-100 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
											<div className="px-4 py-2 text-sm font-medium text-base-content border-b border-base-300">
												Notifications
												(
												{
													notifications.length
												}

												)
											</div>
											{notifications.length ===
											0 ? (
												<div className="px-4 py-2 text-sm text-base-content/70">
													No
													notifications
												</div>
											) : (
												<div className="max-h-60 overflow-y-auto">
													{notifications.map(
														(
															notification,
															index
														) => (
															<div
																key={
																	index
																}
																className="px-4 py-2 text-sm text-base-content border-b border-base-300 last:border-b-0"
															>
																{
																	notification
																}
															</div>
														)
													)}
												</div>
											)}
											{notifications.length >
												0 && (
												<div className="px-4 py-2 border-t border-base-300">
													<button
														onClick={() =>
															setNotifications(
																[]
															)
														}
														className="text-sm text-primary hover:text-primary/80"
													>
														Clear
														all
													</button>
												</div>
											)}
										</Menu.Items>
									</Transition>
								</Menu>
								<Menu
									as="div"
									className="relative ml-3"
								>
									<Menu.Button className="btn btn-circle btn-ghost">
										<span className="sr-only">
											Open
											user
											menu
										</span>
										<div className="avatar placeholder">
											<div className="bg-neutral text-neutral-content rounded-full w-8">
												<span className="text-xs">
													{
														userInitials
													}
												</span>
											</div>
										</div>
									</Menu.Button>
									<Transition
										as={
											Fragment
										}
										enter="transition ease-out duration-200"
										enterFrom="transform opacity-0 scale-95"
										enterTo="transform opacity-100 scale-100"
										leave="transition ease-in duration-75"
										leaveFrom="transform opacity-100 scale-100"
										leaveTo="transform opacity-0 scale-95"
									>
										<Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-base-100 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
											<div className="px-4 py-2 text-sm text-base-content border-b border-base-300">
												<div className="font-medium">
													{
														user?.name
													}
												</div>
												<div className="text-base-content/70 text-xs">
													{
														user?.email
													}
												</div>
											</div>
											<Menu.Item>
												{({
													active,
												}) => (
													<Link
														href="/profile"
														className={clsx(
															active
																? "bg-base-200"
																: "",
															"block px-4 py-2 text-sm text-base-content"
														)}
													>
														Your
														Profile
													</Link>
												)}
											</Menu.Item>
											<Menu.Item>
												{({
													active,
												}) => (
													<button
														onClick={
															handleLogout
														}
														className={clsx(
															active
																? "bg-base-200"
																: "",
															"block w-full text-left px-4 py-2 text-sm text-base-content"
														)}
													>
														Sign
														out
													</button>
												)}
											</Menu.Item>
										</Menu.Items>
									</Transition>
								</Menu>
							</div>
							<div className="-mr-2 flex items-center sm:hidden">
								<Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-base-content hover:bg-base-300 hover:text-base-content focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
									<span className="sr-only">
										Open
										main
										menu
									</span>
									{open ? (
										<XMarkIcon
											className="block h-6 w-6"
											aria-hidden="true"
										/>
									) : (
										<Bars3Icon
											className="block h-6 w-6"
											aria-hidden="true"
										/>
									)}
								</Disclosure.Button>
							</div>
						</div>
					</div>

					<Disclosure.Panel className="sm:hidden">
						<div className="space-y-1 pb-3 pt-2">
							{navigation.map(
								(item) => (
									<Disclosure.Button
										key={
											item.name
										}
										as={
											Link
										}
										href={
											item.href
										}
										className={clsx(
											"block py-2 pl-3 pr-4 text-base font-medium",
											pathname ===
												item.href
												? "bg-base-300 text-primary"
												: "text-base-content hover:bg-base-300 hover:text-base-content/80"
										)}
									>
										{
											item.name
										}
									</Disclosure.Button>
								)
							)}
						</div>
						<div className="border-t border-base-300 pb-3 pt-4">
							<div className="flex items-center px-4">
								<div className="flex-shrink-0">
									<div className="avatar placeholder">
										<div className="bg-neutral text-neutral-content rounded-full w-8">
											<span className="text-xs">
												{
													userInitials
												}
											</span>
										</div>
									</div>
								</div>
								<div className="ml-3">
									<div className="text-base font-medium text-base-content">
										{user?.name ||
											"User Name"}
									</div>
									<div className="text-sm font-medium text-base-content/70">
										{user?.email ||
											"user@example.com"}
									</div>
								</div>
							</div>
							<div className="mt-3 space-y-1">
								<Disclosure.Button
									as={
										Link
									}
									href="/profile"
									className="block px-4 py-2 text-base font-medium text-base-content hover:bg-base-300 hover:text-base-content/80"
								>
									Your
									Profile
								</Disclosure.Button>
								<Disclosure.Button
									as="button"
									onClick={
										handleLogout
									}
									className="block w-full px-4 py-2 text-left text-base font-medium text-base-content hover:bg-base-300 hover:text-base-content/80"
								>
									Sign out
								</Disclosure.Button>
							</div>
						</div>
					</Disclosure.Panel>
				</>
			)}
		</Disclosure>
	);
}
