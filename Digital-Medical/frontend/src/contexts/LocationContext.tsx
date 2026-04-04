import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type LocationStatus = "idle" | "asking" | "granted" | "denied" | "unavailable";

interface LocationState {
    status: LocationStatus;
    city: string;          // matched city name or "All India"
    coords: { lat: number; lng: number } | null;
    showModal: boolean;
    requestLocation: () => void;
    dismissModal: () => void;
    setCity: (city: string) => void;
}

const LocationContext = createContext<LocationState | null>(null);

// Cities list — keep in sync with Header + HeroSection
const CITY_LIST = [
    "All India", "Mumbai", "Delhi", "Bengaluru", "Hyderabad",
    "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat", "Lucknow",
];

// Reverse-geocode using OpenStreetMap Nominatim (free, no key needed)
// Replace the entire reverseGeocode function with this:
async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        // Returns the most specific locality name available
        const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.county ||
            data?.address?.state_district ||
            null;
        return city ?? "All India";
    } catch {
        return "All India";
    }
}

const STORAGE_KEY = "dm_location_dismissed";

export function LocationProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<LocationStatus>("idle");
    const [city, setCity] = useState("All India");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Show modal on first visit (unless previously dismissed)
    useEffect(() => {
        const dismissed = sessionStorage.getItem(STORAGE_KEY);
        if (!dismissed && navigator.geolocation) {
            // Small delay so page renders first
            const t = setTimeout(() => setShowModal(true), 800);
            return () => clearTimeout(t);
        }
    }, []);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setStatus("unavailable");
            setShowModal(false);
            return;
        }
        setStatus("asking");
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setCoords({ lat: latitude, lng: longitude });
                setStatus("granted");
                setShowModal(false);
                const detectedCity = await reverseGeocode(latitude, longitude);
                setCity(detectedCity);
            },
            () => {
                setStatus("denied");
                setShowModal(false);
                sessionStorage.setItem(STORAGE_KEY, "1");
            }
        );
    };

    const dismissModal = () => {
        setShowModal(false);
        setStatus("denied");
        sessionStorage.setItem(STORAGE_KEY, "1");
    };

    return (
        <LocationContext.Provider
            value={{ status, city, coords, showModal, requestLocation, dismissModal, setCity }}
        >
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const ctx = useContext(LocationContext);
    if (!ctx) throw new Error("useLocation must be used inside LocationProvider");
    return ctx;
}