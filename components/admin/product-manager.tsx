'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  CloudUpload,
  Copy,
  ExternalLink,
  ImagePlus,
  Link2,
  Loader2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { type Product, type SiteContent } from '@/lib/cms/content'
import {
  extractGoogleDriveFileId,
  formatGoogleDriveImageUrl,
  isGoogleDriveUrl,
} from '@/lib/cms/drive'
import {
  generateSlug,
  saveProductToSupabase,
  deleteProductFromSupabase,
  fetchProductsFromSupabase,
} from '@/lib/products/products-service'
import { saveDraft } from '@/lib/cms/storage'
import { BookCoverImage } from '@/components/ui/book-cover-image'
import {
  AdminCard,
  EditorGrid,
  Field,
  inputClassName,
  SelectField,
  TextArea,
  TextInput,
  ToggleField,
} from './admin-fields'

function newProduct(category: string): Product {
  const id = `product-${crypto.randomUUID().slice(0, 8)}`
  const title = 'Untitled product'
  const slug = `${generateSlug(title)}-${crypto.randomUUID().slice(0, 4)}`
  return {
    id,
    slug,
    title,
    creator: 'SkillScale Studio',
    category,
    shortDescription: '',
    description: '',
    price: 0,
    compareAtPrice: null,
    rating: 5,
    reviews: 0,
    sales: 0,
    inventory: null,
    format: 'Digital download',
    image: '/products/design-system.png',
    imageAlt: 'Product preview',
    badge: 'New',
    portrait: false,
    featured: true,
    published: true,
    license: 'Personal use',
    requirements: 'None',
    features: ['Digital download'],
  }
}

export function ProductManager({
  content,
  onChange,
}: {
  content: SiteContent
  onChange: (content: SiteContent) => void
}) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(content.products[0]?.id ?? '')
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [imageError, setImageError] = useState('')
  const [publishStatus, setPublishStatus] = useState<string>('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setImageError('Please upload an image file (PNG, JPG, WebP).')
      return
    }

    setIsProcessingFile(true)
    setImageError('')

    const reader = new FileReader()
    reader.onerror = () => {
      setIsProcessingFile(false)
      setImageError('Failed to read selected image file.')
    }
    reader.onload = () => {
      const result = reader.result as string
      // High-resolution canvas optimization for fast loading & reliable Supabase persistence
      const img = new window.Image()
      img.onerror = () => {
        setIsProcessingFile(false)
        setImageError('Could not decode image.')
      }
      img.onload = () => {
        const maxDim = 1600
        let width = img.width
        let height = img.height
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
          updateProduct({ image: optimizedDataUrl })
          setImageError('')
        } else {
          updateProduct({ image: result })
        }
        setIsProcessingFile(false)
      }
      img.src = result
    }
    reader.readAsDataURL(file)
  }

  // Fetch actual products from Supabase on mount - strictly READ ONLY, never auto-seed or insert
  useEffect(() => {
    let mounted = true
    setIsLoadingProducts(true)
    fetchProductsFromSupabase().then((remoteProducts) => {
      if (!mounted) return
      setIsLoadingProducts(false)
      if (Array.isArray(remoteProducts)) {
        onChange({ ...content, products: remoteProducts })
        if (remoteProducts.length > 0) {
          setSelectedId((prev) => {
            if (prev && remoteProducts.some((p) => p.id === prev)) return prev
            return remoteProducts[0].id
          })
        } else {
          setSelectedId('')
        }
      }
    }).catch(() => {
      if (mounted) setIsLoadingProducts(false)
    })
    return () => {
      mounted = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const products = useMemo(
    () =>
      content.products.filter((product) =>
        [product.title, product.creator, product.category, product.slug]
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [content.products, query]
  )

  const selected =
    content.products.find((product) => product.id === selectedId) ??
    content.products[0]

  const updateProduct = (patch: Partial<Product>) => {
    if (!selected) return
    onChange({
      ...content,
      products: content.products.map((product) =>
        product.id === selected.id ? { ...product, ...patch } : product
      ),
    })
  }

  const handleTitleChange = (newTitle: string) => {
    if (!selected) return
    const autoSlug = generateSlug(newTitle)
    // Auto-update slug if it was empty, starts with untitled, or matched the previous auto-generated slug
    const shouldUpdateSlug =
      !selected.slug ||
      selected.slug.startsWith('untitled') ||
      selected.slug === generateSlug(selected.title)

    updateProduct({
      title: newTitle,
      ...(shouldUpdateSlug && autoSlug ? { slug: autoSlug } : {}),
    })
  }

  const addProduct = () => {
    const product = newProduct(content.categories[0]?.name ?? 'Other')
    onChange({ ...content, products: [...content.products, product] })
    setSelectedId(product.id)
  }

  const duplicateProduct = () => {
    if (!selected) return
    const id = `${selected.id}-copy-${Date.now().toString().slice(-4)}`
    const title = `${selected.title} Copy`
    const slug = `${generateSlug(selected.slug || selected.title)}-copy`
    const copy = {
      ...selected,
      id,
      slug,
      title,
      published: false,
    }
    onChange({ ...content, products: [...content.products, copy] })
    setSelectedId(copy.id)
  }

  // Publish / Save individual product to top-level /products collection
  const handleSaveAndPublishProduct = async () => {
    if (!selected) return
    try {
      setIsPublishing(true)
      setPublishStatus('Saving to /products collection...')

      // Ensure slug is clean and distinct
      const cleanSlug = selected.slug?.trim()
        ? generateSlug(selected.slug)
        : generateSlug(selected.title)

      const productToSave: Product = {
        ...selected,
        slug: cleanSlug,
        published: true,
      }

      // Save product to Supabase on explicit user action
      const saved = await saveProductToSupabase(productToSave)

      // Update in-memory state
      const nextProducts = content.products.map((p) => p.id === productToSave.id ? saved : p)
      onChange({ ...content, products: nextProducts })

      // Also persist to CMS draft so refreshing or leaving the page preserves it
      await saveDraft({ ...content, products: nextProducts }).catch(() => {})

      setPublishStatus(`Saved & published to Supabase at ${new Date().toLocaleTimeString()}!`)
      setTimeout(() => setPublishStatus(''), 4000)
    } catch (err: any) {
      console.error('Error saving product:', err)
      window.alert('Failed to publish product to Supabase: ' + (err?.message || 'Error'))
      setPublishStatus('Failed to save product')
    } finally {
      setIsPublishing(false)
    }
  }

  // Delete product from Supabase on explicit user click
  const removeProduct = async () => {
    if (
      !selected ||
      !window.confirm(`Delete “${selected.title}” from the catalog?`)
    ) {
      return
    }

    try {
      setIsDeleting(true)
      // Delete directly from Supabase products table
      await deleteProductFromSupabase(selected.id)

      // Remove from state
      const nextProducts = content.products.filter(
        (product) => product.id !== selected.id
      )
      onChange({ ...content, products: nextProducts })
      setSelectedId(nextProducts[0]?.id ?? '')
    } catch (err: any) {
      console.error('Error deleting product:', err)
      window.alert('Error deleting product from Supabase: ' + (err?.message || 'Error'))
    } finally {
      setIsDeleting(false)
    }
  }

  const moveProduct = (direction: -1 | 1) => {
    if (!selected) return
    const index = content.products.findIndex((product) => product.id === selected.id)
    const destination = index + direction
    if (destination < 0 || destination >= content.products.length) return
    const next = [...content.products]
    ;[next[index], next[destination]] = [next[destination], next[index]]
    onChange({ ...content, products: next })
  }

  const uploadImage = (file?: File) => {
    setImageError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImageError('Choose an image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Images must be 2 MB or smaller for this local demo.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => updateProduct({ image: String(reader.result) })
    reader.readAsDataURL(file)
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <AdminCard
        title="Products"
        description={`${content.products.length} items in /products collection`}
      >
        <div className="flex flex-col gap-4">
          <label className="relative block">
            <span className="sr-only">Search products</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              className={`${inputClassName} pl-9`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
            />
          </label>
          <Button type="button" onClick={addProduct}>
            <Plus data-icon="inline-start" />
            New product
          </Button>
          <div className="flex max-h-[620px] flex-col gap-2 overflow-y-auto pr-1">
            {isLoadingProducts ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span>Loading products from Supabase...</span>
              </div>
            ) : (
              products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedId(product.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    selected?.id === product.id
                      ? 'border-primary bg-secondary'
                      : 'bg-background hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-semibold leading-5">
                      {product.title}
                    </span>
                    <span
                      className={`mt-1 size-2 shrink-0 rounded-full ${
                        product.published
                          ? 'bg-success'
                          : 'bg-muted-foreground/40'
                      }`}
                      aria-label={product.published ? 'Published' : 'Hidden'}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{product.category} · ${product.price}</span>
                    <span className="font-mono text-[10px] text-muted-foreground/70 truncate max-w-[110px]">
                      /{product.slug}
                    </span>
                  </div>
                </button>
              ))
            )}
            {!isLoadingProducts && products.length === 0 && (
              <p className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
                {query ? 'No products match your search.' : 'No products found in database. Click "New product" to create one.'}
              </p>
            )}
          </div>
        </div>
      </AdminCard>

      {selected ? (
        <div className="flex flex-col gap-5">
          <AdminCard
            title="Product details"
            description="Saved as an individual document inside the top-level /products collection."
          >
            <div className="flex flex-col gap-5">
              {/* Product actions toolbar */}
              <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveAndPublishProduct}
                  disabled={isPublishing}
                  className="bg-primary text-primary-foreground font-semibold"
                >
                  {isPublishing ? (
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  ) : (
                    <CloudUpload className="size-3.5 mr-1.5" />
                  )}
                  Save &amp; Publish Product
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  render={
                    <Link
                      href={`/ebooks/${selected.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <ExternalLink className="size-3.5 mr-1.5" />
                  View Live Page
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={duplicateProduct}
                >
                  <Copy data-icon="inline-start" />
                  Duplicate
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => moveProduct(-1)}
                >
                  <ArrowUp data-icon="inline-start" />
                  Move up
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => moveProduct(1)}
                >
                  <ArrowDown data-icon="inline-start" />
                  Move down
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={removeProduct}
                  disabled={isDeleting}
                  className="ml-auto text-destructive hover:text-destructive"
                >
                  {isDeleting ? (
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Trash2 data-icon="inline-start" />
                  )}
                  Delete
                </Button>
              </div>

              {publishStatus && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <Check className="size-4" />
                  {publishStatus}
                </div>
              )}

              <EditorGrid>
                <TextInput
                  label="Title"
                  value={selected.title}
                  onChange={handleTitleChange}
                  required
                />
                <TextInput
                  label="Creator"
                  value={selected.creator}
                  onChange={(creator) => updateProduct({ creator })}
                />
                <TextInput
                  label="Document ID"
                  value={selected.id}
                  onChange={(id) => {
                    updateProduct({ id })
                    setSelectedId(id)
                  }}
                  hint="Document ID in /products/{id}"
                />
                <TextInput
                  label="Slug"
                  value={selected.slug}
                  onChange={(slug) =>
                    updateProduct({ slug: generateSlug(slug) })
                  }
                  hint="Query key where('slug', '==', slug) for /ebooks/[slug]"
                  required
                />
                <SelectField
                  label="Category"
                  value={selected.category}
                  onChange={(category) => updateProduct({ category })}
                  options={content.categories.map((category) => category.name)}
                />
                <TextInput
                  label="Format"
                  value={selected.format}
                  onChange={(format) => updateProduct({ format })}
                />
                <TextInput
                  label="Price"
                  value={selected.price}
                  onChange={(price) => updateProduct({ price: Number(price) })}
                  type="number"
                  min={0}
                  step={0.01}
                />
                <TextInput
                  label="Compare-at price"
                  value={selected.compareAtPrice ?? ''}
                  onChange={(price) =>
                    updateProduct({
                      compareAtPrice: price === '' ? null : Number(price),
                    })
                  }
                  type="number"
                  min={0}
                  step={0.01}
                />
                <TextInput
                  label="Rating"
                  value={selected.rating}
                  onChange={(rating) => updateProduct({ rating: Number(rating) })}
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                />
                <TextInput
                  label="Review count"
                  value={selected.reviews}
                  onChange={(reviews) =>
                    updateProduct({ reviews: Number(reviews) })
                  }
                  type="number"
                  min={0}
                />
                <TextInput
                  label="Sales"
                  value={selected.sales}
                  onChange={(sales) => updateProduct({ sales: Number(sales) })}
                  type="number"
                  min={0}
                />
                <TextInput
                  label="Inventory"
                  value={selected.inventory ?? ''}
                  onChange={(inventory) =>
                    updateProduct({
                      inventory: inventory === '' ? null : Number(inventory),
                    })
                  }
                  type="number"
                  min={0}
                  hint="Leave blank for unlimited digital stock"
                />
                <TextInput
                  label="Badge"
                  value={selected.badge}
                  onChange={(badge) => updateProduct({ badge })}
                  placeholder="Bestseller, New, or blank"
                />
              </EditorGrid>
              <TextArea
                label="Card description"
                value={selected.shortDescription}
                onChange={(shortDescription) =>
                  updateProduct({ shortDescription })
                }
                rows={3}
              />
              <TextArea
                label="Full description"
                value={selected.description}
                onChange={(description) => updateProduct({ description })}
              />
              <EditorGrid>
                <TextInput
                  label="License"
                  value={selected.license}
                  onChange={(license) => updateProduct({ license })}
                />
                <TextInput
                  label="Requirements"
                  value={selected.requirements}
                  onChange={(requirements) => updateProduct({ requirements })}
                />
              </EditorGrid>
              <TextArea
                label="Included features"
                value={selected.features.join('\n')}
                onChange={(features) =>
                  updateProduct({
                    features: features.split('\n').filter(Boolean),
                  })
                }
                hint="One feature per line"
                rows={4}
              />
              <div className="rounded-xl border bg-card/60 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Product Cover Image</h3>
                    <p className="text-xs text-muted-foreground">
                      Direct Google Drive links, external URLs, or local assets.
                    </p>
                  </div>
                  {isGoogleDriveUrl(selected.image) && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Check className="size-3.5" /> Google Drive CDN Active
                    </span>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                  {/* Image Preview Box */}
                  <div className="flex flex-col gap-2">
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border bg-muted shadow-sm">
                      <BookCoverImage
                        src={selected.image}
                        alt={selected.imageAlt || selected.title}
                        title={selected.title}
                        author={selected.creator}
                        category={selected.category}
                        fill
                        unoptimized
                        sizes="160px"
                        portrait={selected.portrait}
                        showPlaceholderNotice={true}
                        onLoadStatus={(status) => {
                          if (status === 'error') {
                            if (isGoogleDriveUrl(selected.image)) {
                              setImageError(
                                'Google Drive blocked this link: Google redirected to an account sign-in screen because the file sharing is restricted. In Google Drive: right-click the image -> Share -> change General access to "Anyone with the link can view". Alternatively, use "Upload Image from Device" below!'
                              )
                            } else {
                              setImageError('Image link could not be loaded by the browser. Please check the URL or upload the image file directly.')
                            }
                          } else if (status === 'loaded') {
                            setImageError('')
                          }
                        }}
                      />
                    </div>
                    {selected.image.startsWith('http') && (
                      <a
                        href={formatGoogleDriveImageUrl(selected.image)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 text-center text-[11px] font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="size-3" /> Open link in new tab
                      </a>
                    )}
                  </div>

                  {/* Image Inputs & Controls */}
                  <div className="flex flex-col gap-3">
                    {/* Direct Device Upload / Drag & Drop */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        const file = e.dataTransfer.files?.[0]
                        if (file) handleFileUpload(file)
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.03] p-4 text-center hover:border-primary/70 hover:bg-primary/[0.07] transition cursor-pointer"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file)
                          e.target.value = ''
                        }}
                      />
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                        {isProcessingFile ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <ImagePlus className="size-4 transition-transform group-hover:scale-110" />
                        )}
                        <span>Upload Image File from Device (PNG, JPG, WebP)</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Drag and drop your book cover file here, or click to browse.
                      </p>
                    </div>

                    {/* Prominent Image Error Diagnostic Box */}
                    {imageError && (
                      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <div className="flex-1">
                            <strong className="block font-semibold">Image Access Alert</strong>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground dark:text-amber-200/90">
                              {imageError}
                            </p>
                            {isGoogleDriveUrl(selected.image) && (
                              <div className="mt-2 rounded bg-amber-500/15 p-2 text-[11px] font-mono leading-tight border border-amber-500/20">
                                <strong>How to fix in Drive:</strong> Share &rarr; General access &rarr; change from <em>&ldquo;Restricted&rdquo;</em> to <strong>&ldquo;Anyone with the link can view&rdquo;</strong>.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Google Drive Direct Link Input */}
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                          <Link2 className="size-3.5" />
                          Or paste Direct Google Drive Link
                        </label>
                        {isGoogleDriveUrl(selected.image) && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            ID: {extractGoogleDriveFileId(selected.image)}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Paste Google Drive link (e.g. https://drive.google.com/file/d/.../view?usp=sharing)"
                        value={isGoogleDriveUrl(selected.image) ? selected.image : ''}
                        onChange={(e) => {
                          setImageError('')
                          const rawVal = e.target.value.trim()
                          if (!rawVal) return
                          const directUrl = formatGoogleDriveImageUrl(rawVal)
                          updateProduct({ image: directUrl })
                        }}
                        className="mt-1.5 w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                      />
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[11px] text-muted-foreground">
                          Google Drive &rarr; Share &rarr; <strong>&ldquo;Anyone with the link can view&rdquo;</strong>.
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveAndPublishProduct}
                          disabled={isPublishing}
                          className="font-medium text-xs shadow-sm"
                        >
                          {isPublishing ? (
                            <Loader2 className="size-3.5 animate-spin mr-1.5" />
                          ) : (
                            <CloudUpload className="size-3.5 mr-1.5" />
                          )}
                          Save Image to Supabase
                        </Button>
                      </div>
                    </div>

                    <TextInput
                      label="Raw Image URL or local asset path"
                      value={selected.image}
                      onChange={(image) => {
                        setImageError('')
                        const formatted = formatGoogleDriveImageUrl(image)
                        updateProduct({ image: formatted })
                      }}
                      hint="Paste any direct web image URL, /products/... path, or data URL."
                    />

                    <TextInput
                      label="Image alt text"
                      value={selected.imageAlt}
                      onChange={(imageAlt) => updateProduct({ imageAlt })}
                      placeholder="e.g. Clean System Architecture E-Book Cover"
                    />

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-background px-3 text-xs font-semibold hover:bg-muted transition">
                        <ImagePlus aria-hidden="true" className="size-3.5" />
                        Upload Local File
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(event) => uploadImage(event.target.files?.[0])}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => updateProduct({ portrait: !selected.portrait })}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border bg-background px-3 text-xs font-semibold hover:bg-muted transition"
                      >
                        Fit: {selected.portrait ? 'Contain (Book style)' : 'Cover (Fill)'}
                      </button>
                    </div>

                    {imageError && (
                      <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 p-2.5 text-xs text-destructive flex items-start gap-2">
                        <AlertCircle className="size-4 shrink-0 mt-0.5" />
                        <span>{imageError}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <ToggleField
                  label="Visible"
                  description="Shown in store catalog"
                  checked={selected.published}
                  onChange={(published) => updateProduct({ published })}
                />
                <ToggleField
                  label="Featured"
                  description="Included in hero / featured list"
                  checked={selected.featured}
                  onChange={(featured) => updateProduct({ featured })}
                />
                <ToggleField
                  label="Portrait art"
                  description="Contain instead of crop"
                  checked={selected.portrait}
                  onChange={(portrait) => updateProduct({ portrait })}
                />
              </div>

              {/* Bottom Quick Save Bar */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 p-4">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Editing <strong className="text-foreground">{selected.title}</strong>
                  </p>
                  {publishStatus ? (
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {publishStatus}
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Click Save &amp; Publish to immediately sync changes to Supabase and live site.
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={handleSaveAndPublishProduct}
                  disabled={isPublishing}
                  className="font-semibold shadow-sm"
                >
                  {isPublishing ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <CloudUpload className="size-4 mr-2" />
                  )}
                  Save &amp; Publish Product
                </Button>
              </div>
            </div>
          </AdminCard>
        </div>
      ) : (
        <AdminCard title="No products">
          <p className="text-sm text-muted-foreground">
            Create a product to begin editing.
          </p>
        </AdminCard>
      )}
    </div>
  )
}
