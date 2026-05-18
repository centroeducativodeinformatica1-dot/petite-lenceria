// src/components/client/ProductCard.js
import { useState } from 'react'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import styles from './ProductCard.module.css'

// SVG Icons
const IconBag = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)

const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [added, setAdded] = useState(false)

  // Si stock está definido y es 0, el producto no se muestra (ya se filtra en index.js,
  // pero por seguridad lo controlamos también acá)
  const sinStock = product.stock !== undefined && product.stock !== null && product.stock <= 0

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (sinStock) return
    if (!user) {
      toast.error('Iniciá sesión para agregar al carrito')
      router.push('/login')
      return
    }
    addItem(product)
    setAdded(true)
    toast.success(`${product.nombre} agregado al carrito`)
    setTimeout(() => setAdded(false), 2000)
  }

  const formatPrice = (p) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)

  if (sinStock) return null

  return (
    <Link href={`/producto/${product.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {product.imagen ? (
          <img src={product.imagen} alt={product.nombre} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>Sin imagen</span>
          </div>
        )}
        {product.categoria && (
          <span className={styles.categoryTag}>{product.categoria}</span>
        )}
        {product.stock !== null && product.stock !== undefined && product.stock <= 3 && product.stock > 0 && (
          <span className={styles.stockTag}>¡Últimas {product.stock}!</span>
        )}
        <div className={styles.overlay}>
          <span className={styles.overlayLabel}><IconEye /> Ver detalle</span>
        </div>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{product.nombre}</h3>
        {product.descripcion && (
          <p className={styles.desc}>{product.descripcion}</p>
        )}
        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(product.precio)}</span>
          <button
            className={`${styles.addBtn} ${added ? styles.addedBtn : ''}`}
            onClick={handleAdd}
          >
            {added ? <IconCheck /> : <IconBag />}
            {added ? 'Agregado' : 'Agregar'}
          </button>
        </div>
      </div>
    </Link>
  )
}
