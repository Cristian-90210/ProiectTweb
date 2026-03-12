import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle, X } from 'lucide-react';

export const CartToast: React.FC = () => {
    const { toastItem, dismissToast } = useCart();

    if (!toastItem) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-5 duration-300 fade-in">
            <div className="bg-[#0a0a3a]/95 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl shadow-cyan-500/10 px-5 py-4 flex items-center gap-4 min-w-[320px] max-w-[420px]">
                {/* Check icon */}
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={18} className="text-emerald-400" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                        ✔ Abonament adăugat în coș
                    </p>
                    <p className="text-xs text-blue-200/60 truncate mt-0.5">
                        {toastItem}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={() => {
                            dismissToast();
                            window.location.href = '/cart';
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-host-cyan bg-host-cyan/15 border border-host-cyan/25 rounded-lg hover:bg-host-cyan/25 transition-colors"
                    >
                        Vezi coșul
                    </button>
                    <button
                        onClick={dismissToast}
                        className="p-1 text-white/40 hover:text-white/70 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
