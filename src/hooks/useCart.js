// src/hooks/useCart.js
import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext({})

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('ps_cart')
    if (saved) setItems(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('ps_cart', JSON.stringify(items))
  }, [items])

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      const maxStock = product.stock ?? 999

      if (existing) {
        // No superar el stock disponible
        const newQty = Math.min(existing.qty + 1, maxStock)
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: newQty } : i
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeItem(id)
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        // Respetar stock máximo del producto
        const maxStock = i.stock ?? 999
        return { ...i, qty: Math.min(qty, maxStock) }
      })
    )
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.precio * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
