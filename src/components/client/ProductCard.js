// src/components/client/ProductCard.js
import { useState } from 'react'
import Image from 'next/image'
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

  const handleAdd = () => {
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
