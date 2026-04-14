"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext(null);

// Pure reducer handling all cart mutations
// ADD increments quantity if the item already exists, otherwise appends it
// UPDATE_QTY removes the item when quantity drops to 0 or below
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.item, quantity: 1 }] };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "UPDATE_QTY":
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    // LOAD is used on mount to restore persisted cart from localStorage
    case "LOAD":
      return { ...state, items: action.items };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Restore cart from localStorage on first render
  useEffect(() => {
    const saved = localStorage.getItem("snout_cart");
    if (saved) {
      try {
        dispatch({ type: "LOAD", items: JSON.parse(saved) });
      } catch {
        // Ignore malformed JSON — cart starts empty
      }
    }
  }, []);

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("snout_cart", JSON.stringify(state.items));
  }, [state.items]);

  // Derived values exposed to consumers
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, itemCount, subtotal, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

// Convenience hook — throws if used outside CartProvider
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
