import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    discountPrice?: number;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CART_STORAGE_KEY = 'atlantis_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

// Încarcă coșul salvat din localStorage (sau [] dacă nu există / e corupt)
function loadCartFromStorage(): CartItem[] {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
        return [];
    }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);

    // Sincronizează automat cu localStorage la fiecare schimbare
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    // Golește coșul când utilizatorul se deconectează
    useEffect(() => {
        const handleLogout = () => setItems([]);
        window.addEventListener('user-logout', handleLogout);
        return () => window.removeEventListener('user-logout', handleLogout);
    }, []);

    const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, delta: number) => {
        setItems(prev =>
            prev
                .map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i)
                .filter(i => i.quantity > 0)   // elimină automat dacă ajunge la 0
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
    }, []);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + (i.discountPrice || i.price) * i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
