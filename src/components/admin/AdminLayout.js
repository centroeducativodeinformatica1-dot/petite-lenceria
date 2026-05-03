import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../hooks/useAuth'
import { FiGrid, FiShoppingBag, FiPackage, FiUsers, FiBarChart2, FiLogOut } from 'react-icons/fi'
import styles from './AdminLayout.module.css'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: FiGrid },
  { href: '/admin/pedidos', label: 'Pedidos', icon: FiShoppingBag },
  { href: '/admin/productos', label: 'Productos', icon: FiPackage },
  { href: '/admin/clientes', label: 'Clientes', icon: FiUsers },
  { href: '/admin/estadisticas', label: 'Estadísticas', icon: FiBarChart2 },
]

export default function AdminLayout({ children }) {
  const { user, isAdmin, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login')
    }
  }, [user, isAdmin, loading])

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!user || !isAdmin) return null

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <span className={styles.brandName}>Petite Sorciere</span>
          <span className={styles.brandRole}>Vendedora</span>
        </div>
        <nav className={styles.nav}>
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`${styles.navItem} ${router.pathname === href ? styles.navActive : ''}`}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <FiLogOut size={16} />
          Salir
        </button>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}