import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="mb-4 text-4xl font-bold">404 - Page Not Found</h1>
            <p className="mb-8 text-lg text-gray-600">
                Oops! The page you're looking for doesn't exist.
            </p>
            <Link
                href="/"
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
                Return Home
            </Link>
        </div>
    );
} 