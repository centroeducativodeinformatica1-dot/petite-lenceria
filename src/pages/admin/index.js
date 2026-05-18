// src/pages/admin/index.js
import AdminLayout from '../../components/admin/AdminLayout'
import Link from 'next/link'
import styles from '../../styles/AdminDashboard.module.css'

const IconOrders = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)

const IconProducts = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const IconClients = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const IconStats = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)

const IconCatalog = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
)

const IconPromo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)

const CARDS = [
  { href: '/admin/pedidos',      label: 'Pedidos',      icon: IconOrders,   desc: 'Gestionar pedidos',   color: '#fdf0f7' },
  { href: '/admin/productos',    label: 'Productos',    icon: IconProducts, desc: 'Stock y catálogo',    color: '#f0f7ff' },
  { href: '/admin/clientes',     label: 'Clientes',     icon: IconClients,  desc: 'Ver compradores',     color: '#f0fff4' },
  { href: '/admin/estadisticas', label: 'Estadísticas', icon: IconStats,    desc: 'Ventas y métricas',   color: '#fffbf0' },
  { href: '/admin/categorias',   label: 'Categorías',   icon: IconCatalog,  desc: 'Organizar secciones', color: '#f5f0ff' },
  { href: '/admin/promociones',  label: 'Promociones',  icon: IconPromo,    desc: 'Descuentos activos',  color: '#fff0f3' },
]

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4z"/>
              <path d="M12 14a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4z"/>
              <path d="M2 12a4 4 0 0 1 4-4 4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4z"/>
              <path d="M14 12a4 4 0 0 1 4-4 4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4z"/>
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>Bienvenida</h1>
            <p className={styles.subtitle}>Panel de administración · Petite Sorciere</p>
          </div>
        </header>

        <div className={styles.grid}>
          {CARDS.map(({ href, label, icon: Icon, desc, color }) => (
            <Link
              key={href}
              href={href}
              className={styles.card}
              style={{ '--card-bg': color }}
            >
              <div className={styles.cardIcon}><Icon /></div>
              <div className={styles.cardText}>
                <span className={styles.cardLabel}>{label}</span>
                <span className={styles.cardDesc}>{desc}</span>
              </div>
              <svg className={styles.cardArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
