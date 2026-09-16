'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { Product } from '@/lib/cms/content'
import { ebookToProduct, type EbookItem } from '@/lib/ebooks-data'
import { CartDrawer, type CartLine } from '@/components/cart-drawer'
import { CheckoutModal } from '@/components/checkout/checkout-modal'
import { CircleCheck } from 'lucide-react'

export { ebookToProduct }

interface CartContextType {
  cart: CartLine[]
  cartCount: number
  cartOpen: boolean
  isCheckoutModalOpen: boolean
  checkoutItems: CartLine[]
  openCart: () => void
  closeCart: () => void
  openCheckout: (item?: Product | EbookItem) => void
  closeCheckout: () => void
  addToCart: (item: Product | EbookItem, quantity?: number) => void
  removeFromCart: (id: string) => void
  increaseQuantity: (id: string) => void
  decreaseQuantity: (id: string) => void
  showNotice: (message: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'skillscale_cart_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const [checkoutItems, setCheckoutItems] = useState<CartLine[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const noticeTimer = useRef<number | null>(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed: unknown = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setCart(parsed.filter((line): line is CartLine => Boolean(
            line && typeof line === 'object' &&
            'quantity' in line && typeof line.quantity === 'number' && line.quantity > 0 &&
            'product' in line && line.product && typeof line.product === 'object' &&
            'id' in line.product && typeof line.product.id === 'string',
          )))
        }
      }
    } catch {
      // ignore
    }
    setLoaded(true)
  }, [])

  // Persist cart to localStorage on updates
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // ignore
    }
  }, [cart, loaded])

  const cartCount = cart.reduce((count, line) => count + line.quantity, 0)

  const showNotice = useCallback((message: string) => {
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = window.setTimeout(() => {
      setNotice(null)
      noticeTimer.current = null
    }, 2800)
  }, [])

  useEffect(() => () => {
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current)
  }, [])

  const openCart = useCallback(() => setCartOpen(true), [])
  const closeCart = useCallback(() => setCartOpen(false), [])

  const openCheckout = useCallback((item?: Product | EbookItem) => {
    if (item) {
      const product: Product = 'keyTakeaways' in item ? ebookToProduct(item as EbookItem) : (item as Product)
      setCheckoutItems([{ product, quantity: 1 }])
    } else {
      setCheckoutItems(cart)
    }
    setCartOpen(false)
    setIsCheckoutModalOpen(true)
  }, [cart])

  const closeCheckout = useCallback(() => {
    setIsCheckoutModalOpen(false)
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const addToCart = useCallback((item: Product | EbookItem, quantity = 1) => {
    const product: Product = 'keyTakeaways' in item ? ebookToProduct(item as EbookItem) : (item as Product)
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id)
      if (existing) {
        return current.map((line) =>
          line.product.id === product.id ? { ...line, quantity: line.quantity + quantity } : line,
        )
      }
      return [...current, { product, quantity }]
    })
    showNotice(`“${product.title}” added to your cart.`)
  }, [showNotice])

  const removeFromCart = useCallback((id: string) => {
    setCart((current) => current.filter((line) => line.product.id !== id))
  }, [])

  const increaseQuantity = useCallback((id: string) => {
    setCart((current) =>
      current.map((line) =>
        line.product.id === id ? { ...line, quantity: line.quantity + 1 } : line,
      ),
    )
  }, [])

  const decreaseQuantity = useCallback((id: string) => {
    setCart((current) =>
      current.flatMap((line) =>
        line.product.id === id
          ? line.quantity > 1
            ? [{ ...line, quantity: line.quantity - 1 }]
            : []
          : [line],
      ),
    )
  }, [])

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartOpen,
        isCheckoutModalOpen,
        checkoutItems,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        showNotice,
        clearCart,
      }}
    >
      {children}

      {/* Global Toast Notification */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background shadow-2xl animate-in fade-in slide-in-from-bottom-3"
        >
          <CircleCheck aria-hidden="true" className="size-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Universal Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        items={cart}
        currency="₹"
        onClose={closeCart}
        onIncrease={increaseQuantity}
        onDecrease={decreaseQuantity}
        onRemove={removeFromCart}
        onCheckout={() => openCheckout()}
      />

      {/* Checkout Modal (Single-field email checkout) */}
      <CheckoutModal />
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
