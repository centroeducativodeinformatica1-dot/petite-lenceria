// src/pages/admin/estadisticas.js
import { useEffect, useState } from 'react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import AdminLayout from '../../components/admin/AdminLayout'
import styles from '../../styles/AdminStats.module.css'

const formatPrice = (p) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)

export default function AdminStats() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30') // days

  useEffect(() => {
    const fetchOrders = async () => {
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }
    fetchOrders()
  }, [])

  const now = new Date()
  const fromDate = new Date(now - Number(period) * 24 * 60 * 60 * 1000)

  const filteredOrders = orders.filter((o) => {
    if (!o.createdAt?.toDate) return true
    return o.createdAt.toDate() >= fromDate
  })

  // Products ranking
  const productCounts = {}
  const categoryCounts = {}
  filteredOrders.forEach((o) => {
    (o.productos || []).forEach((p) => {
      productCounts[p.nombre] = (productCounts[p.nombre] || 0) + p.qty
      const cat = p.categoria || 'Sin categoría'
      categoryCounts[cat] = (categoryCounts[cat] || 0) + p.qty
    })
  })

  const topProducts = Object.entries(productCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  const topCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)

  const totalRevenue = filteredOrders
    .filter((o) => o.estado !== 'pendiente_pago')
    .reduce((s, o) => s + (o.total || 0), 0)

  const maxProd = topProducts[0]?.[1] || 1

  return (
    <AdminLayout>
      <div>
        <div className={styles.header}>
          <h1 className={styles.title}>Estadísticas</h1>
          <select className="input" style={{ width: 'auto' }} value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="365">Este año</option>
          </select>
        </div>

        {loading ? (
          <div style={{ padding: 60 }}><div className="spinner" /></div>
        ) : (
          <>
            {/* Summary cards */}
            <div className={styles.summary}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>Pedidos en el período</div>
                <div className={styles.summaryValue}>{filteredOrders.length}</div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>Ventas confirmadas</div>
                <div className={styles.summaryValue}>{formatPrice(totalRevenue)}</div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>Ticket promedio</div>
                <div className={styles.summaryValue}>
                  {filteredOrders.length > 0 ? formatPrice(totalRevenue / filteredOrders.length) : '—'}
                </div>
              </div>
            </div>

            <div className={styles.grid}>
              {/* Top products */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Productos más vendidos</h3>
                {topProducts.length === 0 ? (
                  <p className={styles.empty}>Sin datos para este período.</p>
                ) : (
                  <div className={styles.bars}>
                    {topProducts.map(([name, count]) => (
                      <div key={name} className={styles.barItem}>
                        <div className={styles.barLabel}>{name}</div>
                        <div className={styles.barWrap}>
                          <div className={styles.barFill} style={{ width: `${(count / maxProd) * 100}%` }} />
                        </div>
                        <div className={styles.barCount}>{count}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top categories */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Categorías más vendidas</h3>
                {topCategories.length === 0 ? (
                  <p className={styles.empty}>Sin datos para este período.</p>
                ) : (
                  <div className={styles.cats}>
                    {topCategories.map(([cat, count]) => (
                      <div key={cat} className={styles.catItem}>
                        <span className={styles.catName}>{cat}</span>
                        <span className={styles.catCount}>{count} unidades</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
