import { useEffect } from "react";
import { useUnsavedChangesContext } from "@/contexts/UnsavedChangesContext";

export function useUnsavedChanges(isDirty: boolean, onSave: () => Promise<void>) {
    const { register, unregister } = useUnsavedChangesContext();

    useEffect(() => {
        // Update the ref on every render where isDirty or onSave changes.
        // This is fine — useEffect runs synchronously after paint,
        // but isDirtyRef is checked only on user click/navigation events,
        // which always happen after paint. No stale-ref race condition here.
        register(isDirty, onSave);
    }, [isDirty, onSave, register]);

    useEffect(() => {
        return () => unregister();
    }, [unregister]);
}