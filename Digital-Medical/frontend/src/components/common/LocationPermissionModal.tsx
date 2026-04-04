import { MapPin, Navigation, X } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";

export default function LocationPermissionModal() {
    const { showModal, status, requestLocation, dismissModal } = useLocation();

    if (!showModal) return null;

    return (
        // Backdrop
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
                {/* Close */}
                <button
                    onClick={dismissModal}
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <X size={16} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                        <MapPin size={30} className="text-emerald-600" />
                    </div>
                </div>

                {/* Text */}
                <h2 className="text-lg font-bold text-slate-900 text-center mb-1">
                    Find healthcare near you
                </h2>
                <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
                    Allow location access to see doctors, hospitals, and pharmacies closest to you.
                </p>

                {/* Buttons */}
                <div className="flex flex-col gap-2.5">
                    <button
                        onClick={requestLocation}
                        disabled={status === "asking"}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white text-sm font-bold rounded-xl transition-all"
                    >
                        {status === "asking" ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Detecting location...
                            </>
                        ) : (
                            <>
                                <Navigation size={15} />
                                Allow Location Access
                            </>
                        )}
                    </button>
                    <button
                        onClick={dismissModal}
                        className="w-full py-3 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        Maybe later
                    </button>
                </div>

                {/* Trust note */}
                <p className="text-[10px] text-slate-400 text-center mt-4">
                    🔒 Your location is never stored on our servers
                </p>
            </div>
        </div>
    );
}