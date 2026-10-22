import { verifyDownloadToken, verifyLegacyDownloadToken } from '@/lib/download-token'

export interface OrderRow {
  id?: string
  status?: string | null
  customer_email?: string | null
  items?: unknown
  total?: number | string | null
  date?: string | null
}

export function orderCustomerEmail(order: OrderRow | null | undefined): string {
  if (!order) return ''
  const first = Array.isArray(order.items) ? (order.items[0] as { customerEmail?: string } | undefined) : undefined
  return String(order.customer_email || first?.customerEmail || '')
}

/**
 * True only when the caller holds a token proving payment for THIS order.
 * An order existing, or even being marked Completed, is not enough on its own.
 */
export function hasOrderAccess(order: OrderRow | null | undefined, orderId: string, token: string): boolean {
  if (!order || !token) return false
  const email = orderCustomerEmail(order)
  if (verifyDownloadToken(orderId, token, email)) return true
  return order.status === 'Completed' && verifyLegacyDownloadToken(orderId, token, email)
}

/** Book ids that were actually purchased in this order. */
export function orderBookIds(order: OrderRow | null | undefined): string[] {
  if (!order || !Array.isArray(order.items)) return []
  const ids = (order.items as Array<{ id?: unknown; bookId?: unknown }>)
    .map((item) => item?.id || item?.bookId)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)
  return Array.from(new Set(ids))
}

export const DOWNLOAD_FORMATS = ['epub', 'pdf', 'mobi', 'zip'] as const
export type DownloadFormat = (typeof DOWNLOAD_FORMATS)[number]

export function isDownloadFormat(value: string): value is DownloadFormat {
  return (DOWNLOAD_FORMATS as readonly string[]).includes(value)
}

export interface OrderItemInfo {
  id: string
  title: string
  author?: string
  price?: number
}

/** Title, author and price as recorded when the order was placed (not looked up again later). */
export function orderItemInfo(order: OrderRow | null | undefined): Map<string, OrderItemInfo> {
  const map = new Map<string, OrderItemInfo>()
  if (!order || !Array.isArray(order.items)) return map
  for (const raw of order.items as Array<Record<string, unknown>>) {
    const id = String(raw?.id || raw?.bookId || '')
    if (!id) continue
    map.set(id, {
      id,
      title: String(raw?.title || id),
      author: typeof raw?.author === 'string' ? raw.author : undefined,
      price: typeof raw?.price === 'number' ? raw.price : undefined,
    })
  }
  return map
}
