// src/pages/producto/[id].js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import Navbar from '../../components/client/Navbar'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import Link from 'next/link'
import styles from '../../styles/ProductDetail.module.css'

// SVG Icons inline
const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const IconBag = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconTag = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)

const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const IconWhatsApp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
)

export default function ProductDetail() {
  const router = useRouter()
  const { id } = router.query
  const { addItem } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchProduct = async () => {
      try {
        const ref = doc(db, 'products', id)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const formatPrice = (p) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)

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

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hola! Me interesa el producto: *${product.nombre}* - ${formatPrice(product.precio)}`)
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className={styles.loadingWrap}><div className="spinner" /></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div>
        <Navbar />
        <div className={styles.notFound}>
          <p>Producto no encontrado.</p>
          <Link href="/" className="btn btn-outline">Volver al catálogo</Link>
        </div>
      </div>
    )
  }

  const stockBajo = product.stock !== undefined && product.stock !== null && product.stock <= 3 && product.stock > 0

  return (
    <div>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <Link href="/" className={styles.backLink}>
            <IconBack /> Volver al catálogo
          </Link>

          <div className={styles.layout}>
            {/* Imagen */}
            <div className={styles.imageCol}>
              <div className={styles.imageWrap}>
                {product.imagen ? (
                  <img src={product.imagen} alt={product.nombre} className={styles.image} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span>Sin imagen</span>
                  </div>
                )}
                {product.categoria && (
                  <span className={styles.categoryTag}>
                    <IconTag /> {product.categoria}
                  </span>
                )}
                {stockBajo && (
                  <span className={styles.stockTag}>
                    <IconAlert /> ¡Últimas {product.stock}!
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className={styles.infoCol}>
              {product.categoria && (
                <p className={styles.eyebrow}>{product.categoria}</p>
              )}
              <h1 className={styles.name}>{product.nombre}</h1>

              <p className={styles.price}>{formatPrice(product.precio)}</p>

              {product.descripcion && (
                <p className={styles.description}>{product.descripcion}</p>
              )}

              {product.stock !== undefined && product.stock !== null && (
                <div className={styles.stockInfo}>
                  {product.stock > 3
                    ? <span className={`badge badge-green ${styles.stockBadge}`}>Disponible</span>
                    : <span className={`badge badge-yellow ${styles.stockBadge}`}><IconAlert /> Pocas unidades</span>
                  }
                </div>
              )}

              <div className={styles.actions}>
                <button
                  className={`btn btn-primary btn-lg ${styles.addBtn} ${added ? styles.addedBtn : ''}`}
                  onClick={handleAdd}
                >
                  {added ? <IconCheck /> : <IconBag />}
                  {added ? '¡Agregado!' : 'Agregar al carrito'}
                </button>
                <button className={`btn btn-whatsapp ${styles.waBtn}`} onClick={handleWhatsApp}>
                  <IconWhatsApp /> Consultar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p><em>Petite Sorciere Lencería</em> · Hecho con ♥</p>
      </footer>
    </div>
  )
}
