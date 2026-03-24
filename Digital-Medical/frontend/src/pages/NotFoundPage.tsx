import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-7xl font-bold text-primary/20 mb-4">404</div>
      <h1 className="text-xl font-bold text-text-primary mb-2">Page Not Found</h1>
      <p className="text-sm text-text-tertiary mb-6 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        <Home size={15} /> Back to Home
      </Link>
    </div>
  );
}
