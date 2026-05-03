// src/components/client/Navbar.js
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { FiShoppingBag, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, userData, logout } = useAuth()
  const { count } = useCart()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Petite Sorciere</span>
          <span className={styles.logoSub}>Lencería</span>
        </Link>

        <div className={styles.actions}>
          {user ? (
            <>
              <Link href="/carrito" className={styles.cartBtn}>
                <FiShoppingBag size={20} />
                {count > 0 && <span className={styles.cartBadge}>{count}</span>}
              </Link>
              <div className={styles.userMenu}>
                <button
                  className={styles.userBtn}
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className={styles.avatar} />
                  ) : (
                    <FiUser size={18} />
                  )}
                </button>
                {menuOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownUser}>
                      <div className={styles.dropdownName}>{userData?.nombre || user.displayName}</div>
                      <div className={styles.dropdownEmail}>{user.email}</div>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <Link href="/mis-pedidos" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                      Mis pedidos
                    </Link>
                    <button className={styles.dropdownItem} onClick={handleLogout}>
                      <FiLogOut size={14} /> Salir
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
