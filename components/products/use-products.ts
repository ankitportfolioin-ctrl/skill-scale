'use client'

import { useEffect, useState } from 'react'
import { type Product } from '@/lib/cms/content'
import { subscribeToProducts, fetchProductsFromSupabase } from '@/lib/products/products-service'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchProductsFromSupabase().then((prods) => {
      if (isMounted) {
        setProducts(prods || [])
        setIsLoading(false)
      }
    })
    const unsubscribe = subscribeToProducts((updated) => {
      if (isMounted) {
        setProducts(updated || [])
        setIsLoading(false)
      }
    })
    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  return { products, isLoading }
}
