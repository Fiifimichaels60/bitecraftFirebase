'use client';

import type { CartItem, FoodItem } from '@/types';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: FoodItem }
  | { type: 'REMOVE_ITEM'; payload: string } // payload is itemId
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return {
            ...state,
            items: state.items.filter(item => item.id !== action.payload.itemId),
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.itemId ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    }
    case 'CLEAR_CART': {
        return {
            ...state,
            items: []
        }
    }
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
