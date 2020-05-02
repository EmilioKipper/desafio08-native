import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageCart = await AsyncStorage.getItem('cartItems');

      if (storageCart) {
        setProducts(JSON.parse(storageCart));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      if (products) {
        const hasProductInCart = products.find(prod => product.id === prod.id);

        if (hasProductInCart) {
          hasProductInCart.quantity += 1;
          setProducts([...products]);
        } else {
          setProducts([...products, { ...product, quantity: 1 }]);
        }
      } else {
        setProducts([product]);
      }
      await AsyncStorage.setItem('cartItems', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const allProducts = [...products];

      const itemToIncrement = products.findIndex(prod => prod.id === id);

      if (itemToIncrement > -1) {
        allProducts[itemToIncrement].quantity += 1;

        setProducts([...allProducts]);
      }
      await AsyncStorage.setItem('cartItems', JSON.stringify(allProducts));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const allProducts = [...products];

      const itemToIncrement = products.findIndex(prod => prod.id === id);

      if (itemToIncrement > -1) {
        if (allProducts[itemToIncrement].quantity === 1) {
          allProducts.splice(itemToIncrement, 1);
        } else {
          allProducts[itemToIncrement].quantity -= 1;
        }
        setProducts([...allProducts]);
      }

      await AsyncStorage.setItem('cartItems', JSON.stringify(allProducts));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
