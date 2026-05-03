// src/pages/index.js
import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import Navbar from '../components/client/Navbar'
import ProductCard from '../components/client/ProductCard'
import { FiSearch } from 'react-icons/fi'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [categories, setCategories] = useState(['Todos'])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          where('estado', '==', 'activo'),
          orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(q)
        // Filtrar productos con stock > 0 (o sin campo stock, para compatibilidad con productos viejos)
        const items = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p) => p.stock === undefined || p.stock === null || p.stock > 0)
        setProducts(items)
        const cats = ['Todos', ...new Set(items.map((p) => p.categoria).filter(Boolean))]
        setCategories(cats)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'Todos' || p.categoria === activeCategory
    return matchSearch && matchCat
  })

  return (
    <div>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>Nueva colección</p>
            <h1 className={styles.heroTitle}>
              Bienvenidxs a<br />
              <em>Petite Sorciere</em>
            </h1>
            <p className={styles.heroSub}>
              Lencería seleccionada con amor para cada cuerpo y cada momento.
            </p>
          </div>
          <div className={styles.heroDeco} />
        </section>

        {/* Catalog */}
        <section className={styles.catalog}>
          <div className="container">
            {/* Filters */}
            <div className={styles.filters}>
              <div className={styles.searchWrap}>
                <FiSearch className={styles.searchIcon} size={16} />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className={styles.searchInput}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className={styles.cats}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.catBtn} ${activeCategory === cat ? styles.catBtnActive : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className={styles.loading}>
                <div className="spinner" />
              </div>
            ) : filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>No encontramos productos con esa búsqueda.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          <em>Petite Sorciere Lencería</em> · Hecho con ♥
        </p>
      </footer>
    </div>
  )
}
