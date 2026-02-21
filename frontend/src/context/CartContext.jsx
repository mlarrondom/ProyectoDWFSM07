import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'certify_cart_v1';

function safeParse(json) {
    try {
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? safeParse(raw) : null;
        return Array.isArray(parsed) ? parsed : [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = (item) => {
        if (!item?.certCode) return;

        setItems((prev) => {
            const idx = prev.findIndex((x) => String(x.certCode) === String(item.certCode));
            if (idx === -1) return [...prev, { ...item, quantity: item.quantity ?? 1 }];

            const next = [...prev];
            const current = next[idx];
            next[idx] = { ...current, quantity: (current.quantity ?? 1) + (item.quantity ?? 1) };
            return next;
        });
    };

    const removeItem = (certCode) => {
        setItems((prev) => prev.filter((x) => String(x.certCode) !== String(certCode)));
    };

    const clearCart = () => setItems([]);

    const totalCount = useMemo(
        () => items.reduce((acc, it) => acc + (it.quantity ?? 1), 0),
        [items]
    );
    const totalPrice = useMemo(
        () => items.reduce((acc, it) => acc + (Number(it.price) || 0) * (it.quantity ?? 1), 0),
        [items]
    );

    const value = useMemo(
        () => ({ items, addItem, removeItem, clearCart, totalCount, totalPrice }),
        [items, totalCount, totalPrice]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider />');
    return ctx;
}
