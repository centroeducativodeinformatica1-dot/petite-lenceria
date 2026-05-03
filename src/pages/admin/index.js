import AdminLayout from '../../components/admin/AdminLayout'
import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div style={{ padding: 20 }}>
        <h1 style={{ fontFamily: 'Georgia', color: '#e06aa3', marginBottom: 24 }}>
          Bienvenida 🌸
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
          <Link href="/admin/pedidos" style={{ background: '#fdf0f7', padding: 24, borderRadius: 12, textDecoration: 'none', color: '#333', border: '1px solid #f5b8d8', display: 'block' }}>
            <div style={{ fontSize: 28 }}>🛍️</div>
            <div style={{ fontWeight: 600, marginTop: 8 }}>Pedidos</div>
          </Link>
          <Link href="/admin/productos" style={{ background: '#fdf0f7', padding: 24, borderRadius: 12, textDecoration: 'none', color: '#333', border: '1px solid #f5b8d8', display: 'block' }}>
            <div style={{ fontSize: 28 }}>📦</div>
            <div style={{ fontWeight: 600, marginTop: 8 }}>Productos</div>
          </Link>
          <Link href="/admin/clientes" style={{ background: '#fdf0f7', padding: 24, borderRadius: 12, textDecoration: 'none', color: '#333', border: '1px solid #f5b8d8', display: 'block' }}>
            <div style={{ fontSize: 28 }}>👥</div>
            <div style={{ fontWeight: 600, marginTop: 8 }}>Clientes</div>
          </Link>
          <Link href="/admin/estadisticas" style={{ background: '#fdf0f7', padding: 24, borderRadius: 12, textDecoration: 'none', color: '#333', border: '1px solid #f5b8d8', display: 'block' }}>
            <div style={{ fontSize: 28 }}>📊</div>
            <div style={{ fontWeight: 600, marginTop: 8 }}>Estadísticas</div>
          </Link>
        </div>
      </div>
    </AdminLayout>
  )
}