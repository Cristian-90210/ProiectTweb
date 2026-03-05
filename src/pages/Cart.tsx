import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { subscriptionPlans } from '../data/mockData';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, Tag } from 'lucide-react';
import { clsx } from 'clsx';

// Helper: find description from subscriptionPlans by matching plan id
const getPlanDetails = (itemId: string) =>
    subscriptionPlans.find((p) => p.id === itemId);

const CATEGORY_LABELS: Record<string, string> = {
    standard: 'Standard',
    pro: 'Pro',
    individual: 'Individual',
    transport: 'Cu Transport',
};

const CATEGORY_COLORS: Record<string, string> = {
    standard: 'bg-sky-500/15 text-sky-400 border-sky-400/30',
    pro: 'bg-violet-500/15 text-violet-400 border-violet-400/30',
    individual: 'bg-amber-500/15 text-amber-400 border-amber-400/30',
    transport: 'bg-emerald-500/15 text-emerald-400 border-emerald-400/30',
};

export const CartPage: React.FC = () => {
    const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen pb-16 pt-8 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #020024 0%, #090979 35%, #00d4ff 100%)' }}
        >
            {/* Soft radial glow at the top for depth */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] z-0 pointer-events-none opacity-[0.10]"
                style={{ background: 'radial-gradient(ellipse at center, #00c6ff 0%, transparent 70%)' }}
            />

            <div className="container mx-auto px-4 max-w-4xl relative z-10">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-white/10 border border-white/15 text-white/80 hover:text-host-cyan hover:bg-white/15 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                            <ShoppingCart className="text-host-cyan" size={28} />
                            Coșul Meu
                        </h1>
                        <p className="text-blue-200/70 text-sm mt-0.5">
                            {totalItems === 0
                                ? 'Coșul este gol'
                                : `${totalItems} ${totalItems === 1 ? 'produs' : 'produse'} selectate`}
                        </p>
                    </div>
                </div>

                {items.length === 0 ? (
                    /* Empty cart */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6">
                            <ShoppingCart size={40} className="text-white/40" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Coșul este gol</h2>
                        <p className="text-blue-200/60 mb-6">Adaugă abonamente din pagina de cursuri</p>
                        <button
                            onClick={() => navigate('/courses')}
                            className="px-6 py-3 bg-host-cyan text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.02]"
                        >
                            Vezi Abonamente
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Items list */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => {
                                const plan = getPlanDetails(item.id);
                                const unitPrice = item.discountPrice ?? item.price;
                                const originalPrice = item.price;
                                const hasDiscount = item.discountPrice && item.discountPrice < item.price;

                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/12 transition-all duration-200"
                                    >
                                        {/* Top row: name + badge + delete */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-white text-base leading-snug">
                                                        {item.name}
                                                    </h3>
                                                    {plan && (
                                                        <span className={clsx(
                                                            'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border',
                                                            CATEGORY_COLORS[plan.category] ?? 'bg-gray-500/10 text-gray-400 border-gray-400/30'
                                                        )}>
                                                            {CATEGORY_LABELS[plan.category] ?? plan.category}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Plan details */}
                                                {plan && (
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-200/60 mt-1">
                                                        <span>🏊 {plan.sessions} ședințe</span>
                                                        <span>📅 Durată: {plan.duration}</span>
                                                        {hasDiscount && (
                                                            <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                                                <Tag size={11} />
                                                                Preț redus
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/15 rounded-full transition-colors flex-shrink-0"
                                                title="Șterge"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {/* Bottom row: qty controls + price */}
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                                            {/* Quantity */}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-red-500/20 hover:border-red-400/50 hover:text-red-400 transition-all duration-150 font-bold"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-8 text-center font-bold text-white text-lg">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, +1)}
                                                    className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-green-500/20 hover:border-green-400/50 hover:text-green-400 transition-all duration-150 font-bold"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                {hasDiscount && (
                                                    <p className="text-xs text-white/40 line-through">
                                                        {originalPrice * item.quantity} MDL
                                                    </p>
                                                )}
                                                <p className="text-lg font-extrabold text-host-cyan">
                                                    {unitPrice * item.quantity} MDL
                                                </p>
                                                <p className="text-[10px] text-blue-200/50">
                                                    {unitPrice} MDL / buc
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Clear cart */}
                            <button
                                onClick={clearCart}
                                className="text-xs text-red-400/80 hover:text-red-400 flex items-center gap-1 transition-colors mt-1"
                            >
                                <Trash2 size={12} /> Golește coșul
                            </button>
                        </div>

                        {/* Order summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-24">
                                <h2 className="font-bold text-white text-lg mb-4">Sumar Comandă</h2>

                                <div className="space-y-2 text-sm mb-4">
                                    {items.map((item) => {
                                        const unitPrice = item.discountPrice ?? item.price;
                                        return (
                                            <div key={item.id} className="flex justify-between text-blue-200/60">
                                                <span className="truncate flex-1 mr-2">{item.name} × {item.quantity}</span>
                                                <span className="font-medium text-white/90 flex-shrink-0">
                                                    {unitPrice * item.quantity} MDL
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="border-t border-white/10 pt-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-200/70 font-medium">Total</span>
                                        <span className="text-2xl font-extrabold text-host-cyan">{totalPrice} MDL</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    <CreditCard size={18} />
                                    Finalizează Comanda
                                </button>

                                <button
                                    onClick={() => navigate('/courses')}
                                    className="w-full mt-3 py-2.5 text-sm text-blue-200/60 hover:text-host-cyan transition-colors font-medium"
                                >
                                    ← Continuă cumpărăturile
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};