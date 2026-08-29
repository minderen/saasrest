import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";

export type CartLine = {
  key: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  image_url: string | null;
  product_id: string | null;
  menu_id: string | null;
};

type State = { lines: CartLine[] };

type Action =
  | { type: "add"; line: Omit<CartLine, "quantity">; quantity: number }
  | { type: "setQuantity"; key: string; quantity: number }
  | { type: "remove"; key: string }
  | { type: "clear" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add": {
      const existing = state.lines.find((line) => line.key === action.line.key);
      if (existing) {
        return {
          lines: state.lines.map((line) =>
            line.key === action.line.key
              ? { ...line, quantity: Math.min(50, line.quantity + action.quantity) }
              : line,
          ),
        };
      }
      return { lines: [...state.lines, { ...action.line, quantity: action.quantity }] };
    }
    case "setQuantity":
      return {
        lines: state.lines.flatMap((line) =>
          line.key === action.key
            ? action.quantity <= 0
              ? []
              : [{ ...line, quantity: Math.min(50, action.quantity) }]
            : [line],
        ),
      };
    case "remove":
      return { lines: state.lines.filter((line) => line.key !== action.key) };
    case "clear":
      return { lines: [] };
    default:
      return state;
  }
}

type CartValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

/** Cart state is kept in memory only (no localStorage), per platform rules. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] });

  const add = useCallback(
    (line: Omit<CartLine, "quantity">, quantity = 1) => dispatch({ type: "add", line, quantity }),
    [],
  );
  const setQuantity = useCallback((key: string, quantity: number) => dispatch({ type: "setQuantity", key, quantity }), []);
  const remove = useCallback((key: string) => dispatch({ type: "remove", key }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartValue>(() => {
    const count = state.lines.reduce((sum, line) => sum + line.quantity, 0);
    const total = state.lines.reduce((sum, line) => sum + line.quantity * line.unit_price, 0);
    return { lines: state.lines, count, total, add, setQuantity, remove, clear };
  }, [state.lines, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
