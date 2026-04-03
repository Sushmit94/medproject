import { AlertTriangle, Save, X, LogOut } from "lucide-react";

interface UnsavedChangesModalProps {
    open: boolean;
    saving?: boolean;
    onDiscard: () => void;
    onStay: () => void;
    onSaveAndLeave: () => void;
}

export default function UnsavedChangesModal({
    open,
    saving = false,
    onDiscard,
    onStay,
    onSaveAndLeave,
}: UnsavedChangesModalProps) {
    if (!open) return null;

    return (
        // Backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
                aria-labelledby="unsaved-title"
            >
                {/* Icon + Title */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-amber-50 rounded-xl">
                        <AlertTriangle size={22} className="text-amber-500" />
                    </div>
                    <h2 id="unsaved-title" className="text-lg font-semibold text-text-primary">
                        Unsaved Changes
                    </h2>
                </div>

                <p className="text-sm text-text-secondary mb-6 ml-[52px]">
                    You have unsaved changes. What would you like to do before leaving?
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-2.5">
                    {/* Save & Leave */}
                    <button
                        onClick={onSaveAndLeave}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent/90 disabled:opacity-60 transition-colors"
                    >
                        <Save size={15} />
                        {saving ? "Saving..." : "Save & Leave"}
                    </button>

                    {/* Discard */}
                    <button
                        onClick={onDiscard}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 disabled:opacity-60 transition-colors"
                    >
                        <LogOut size={15} />
                        Discard Changes & Leave
                    </button>

                    {/* Stay */}
                    <button
                        onClick={onStay}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-surface-secondary text-text-primary text-sm font-medium rounded-xl hover:bg-surface-tertiary disabled:opacity-60 transition-colors"
                    >
                        <X size={15} />
                        Stay on this Page
                    </button>
                </div>
            </div>
        </div>
    );
}