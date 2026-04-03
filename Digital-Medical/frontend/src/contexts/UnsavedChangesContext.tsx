import {
    createContext, useContext, useRef, useState,
    useCallback, useEffect
} from "react";
import { useNavigate } from "react-router-dom";

interface UnsavedChangesContextValue {
    register: (isDirty: boolean, onSave: () => Promise<void>) => void;
    unregister: () => void;
    guardedNavigate: (to: string) => void;
    showModal: boolean;
    saving: boolean;
    confirmLeave: () => void;
    cancelLeave: () => void;
    saveAndLeave: () => Promise<void>;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null);

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const isDirtyRef = useRef(false);
    const onSaveRef = useRef<(() => Promise<void>) | null>(null);
    const pendingPath = useRef<string | null>(null);
    // true = modal was triggered by browser back button (popstate)
    // false = triggered by guardedNavigate (sidebar click)
    const triggeredByPopstate = useRef(false);

    // ── Block browser back/forward buttons ──────────────────────────────────
    // Strategy: push a dummy history entry on mount so the back button
    // hits our dummy entry first. We catch that in popstate, re-push the
    // dummy, and show our modal instead of actually navigating.
    useEffect(() => {
        // Push sentinel state so there's always something to "catch"
        window.history.pushState({ __guardSentinel: true }, "", window.location.href);

        const handlePopState = (e: PopStateEvent) => {
            if (!isDirtyRef.current) {
                // Not dirty — allow navigation freely, just re-push sentinel
                window.history.pushState({ __guardSentinel: true }, "", window.location.href);
                // Actually go back for real navigation (user pressed back and we're clean)
                navigate(-1);
                return;
            }

            // Dirty — push sentinel again to prevent leaving, show modal
            window.history.pushState({ __guardSentinel: true }, "", window.location.href);
            triggeredByPopstate.current = true;
            pendingPath.current = null; // we'll use navigate(-2) to go back for real
            setShowModal(true);
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [navigate]);

    // ── Tab close / page refresh guard ──────────────────────────────────────
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (!isDirtyRef.current) return;
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, []);

    const register = useCallback((isDirty: boolean, onSave: () => Promise<void>) => {
        isDirtyRef.current = isDirty;
        onSaveRef.current = onSave;
    }, []);

    const unregister = useCallback(() => {
        isDirtyRef.current = false;
        onSaveRef.current = null;
    }, []);

    // Sidebar / header buttons call this instead of navigate()
    const guardedNavigate = useCallback((to: string) => {
        if (isDirtyRef.current) {
            triggeredByPopstate.current = false;
            pendingPath.current = to;
            setShowModal(true);
        } else {
            navigate(to);
        }
    }, [navigate]);

    const doLeave = useCallback(() => {
        if (triggeredByPopstate.current) {
            // Go back twice: once to undo our sentinel push, once to actually go back
            navigate(-2);
        } else if (pendingPath.current) {
            navigate(pendingPath.current);
        }
        pendingPath.current = null;
        triggeredByPopstate.current = false;
    }, [navigate]);

    const confirmLeave = useCallback(() => {
        isDirtyRef.current = false;
        setShowModal(false);
        doLeave();
    }, [doLeave]);

    const cancelLeave = useCallback(() => {
        setShowModal(false);
        pendingPath.current = null;
        triggeredByPopstate.current = false;
        // Sentinel is already re-pushed in handlePopState, so back button is re-armed
    }, []);

    const saveAndLeave = useCallback(async () => {
        if (!onSaveRef.current) { confirmLeave(); return; }
        setSaving(true);
        try {
            await onSaveRef.current();
            isDirtyRef.current = false;
            setShowModal(false);
            doLeave();
        } catch {
            // Save failed — stay on page, page shows its own error toast
            setShowModal(false);
            pendingPath.current = null;
            triggeredByPopstate.current = false;
        } finally {
            setSaving(false);
        }
    }, [doLeave, confirmLeave]);

    return (
        <UnsavedChangesContext.Provider value={{
            register, unregister, guardedNavigate,
            showModal, saving, confirmLeave, cancelLeave, saveAndLeave,
        }}>
            {children}
        </UnsavedChangesContext.Provider>
    );
}

export function useUnsavedChangesContext() {
    const ctx = useContext(UnsavedChangesContext);
    if (!ctx) throw new Error("useUnsavedChangesContext must be used inside UnsavedChangesProvider");
    return ctx;
}