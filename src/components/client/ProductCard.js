// src/components/client/ProductCard.js
import { useState } from 'react'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { FiShoppingBag, FiCheck } from 'react-icons/fi'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [added, setAdded] = useState(false)

  // Si stock está definido y es 0, el producto no se muestra (ya se filtra en index.js,
  // pero por seguridad lo controlamos también acá)
  const sinStock = product.stock !== undefined && product.stock !== null && product.stock <= 0

  const handleAdd = () => {
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

  // No renderizar si no hay stock (doble protección)
  if (sinStock) return null

  return (
    <div className={styles.card}>
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
        {/* Indicador de stock bajo (1-3 unidades) */}
        {product.stock !== null && product.stock !== undefined && product.stock <= 3 && product.stock > 0 && (
          <span style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: '#f59e0b',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 20,
          }}>
            ¡Últimas {product.stock}!
          </span>
        )}
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
            {added ? <FiCheck size={16} /> : <FiShoppingBag size={16} />}
            {added ? 'Agregado' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}
