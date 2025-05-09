"use client";

import Link from "next/link";
import { Car } from "lucide-react";

export default function SimpleNavBar() {
	return (
		<header className="bg-white border-b">
			<div className="container mx-auto px-4 py-4 flex items-center">
				<Link href="/" className="flex items-center no-underline">
					<Car className="h-6 w-6 text-blue-600 mr-2" />
					<h1 className="text-xl font-bold text-gray-900">
						Licenseplate Checker
					</h1>
				</Link>
			</div>
		</header>
	);
}
