// src/pages/admin/productos.js
import { useEffect, useState } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  doc, addDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { uploadImage } from '../../lib/cloudinary'
import AdminLayout from '../../components/admin/AdminLayout'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiImage } from 'react-icons/fi'
import styles from '../../styles/AdminProducts.module.css'

const EMPTY_PRODUCT = {
  nombre: '',
  precio: '',
  descripcion: '',
  categoria: '',
  estado: 'activo',
  imagen: ''
}

const formatPrice = (p) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(p)

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const openModal = (product = null) => {
    setEditing(product?.id || null)
    setForm(product ? { ...product } : EMPTY_PRODUCT)
    setImageFile(null)
    setImagePreview(product?.imagen || null)
    setModal(true)
  }

  const closeModal = () => {
    setModal(false)
    setEditing(null)
    setForm(EMPTY_PRODUCT)
    setImageFile(null)
    setImagePreview(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.nombre || !form.precio) {
      return toast.error('Nombre y precio son obligatorios')
    }
    setSaving(true)
    try {
      let imageUrl = form.imagen
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }
      const data = {
        nombre: form.nombre,
        precio: Number(form.precio),
        descripcion: form.descripcion,
        categoria: form.categoria,
        estado: form.estado,
        imagen: imageUrl
      }
      if (editing) {
        await updateDoc(doc(db, 'products', editing), data)
        toast.success('Producto actualizado ✨')
      } else {
        await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() })
        toast.success('Producto creado 🌸')
      }
      closeModal()
    } catch (e) {
      console.error(e)
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await deleteDoc(doc(db, 'products', id))
      toast.success('Producto eliminado')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Productos</h1>
          <button className="btn-primary" onClick={() => openModal()}>
            <FiPlus /> Nuevo producto
          </button>
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
            <FiImage size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>Todavía no hay productos. ¡Creá el primero!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((p) => (
              <div key={p.id} className={styles.productCard}>
                <div className={styles.productImageWrap}>
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre} className={styles.productImage} />
                  ) : (
                    <div className={styles.productImagePlaceholder}>
                      <FiImage size={32} />
                    </div>
                  )}
                  <div className={styles.productActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => openModal(p)}
                      title="Editar"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                      onClick={() => handleDelete(p.id)}
                      title="Eliminar"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className={styles.productInfo}>
                  {p.categoria && (
                    <span className={styles.productCategory}>{p.categoria}</span>
                  )}
                  <span className={styles.productName}>{p.nombre}</span>
                  <span className={styles.productPrice}>{formatPrice(p.precio)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  {editing ? 'Editar producto' : 'Nuevo producto'}
                </h2>
                <button className={styles.closeBtn} onClick={closeModal}>
                  <FiX size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                {/* Nombre y Precio */}
                <div className={styles.formRow} style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Nombre *</label>
                    <input
                      className="form-input"
                      placeholder="Ej: Conjunto de encaje"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Precio *</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="Ej: 15000"
                      value={form.precio}
                      onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    />
                  </div>
                </div>

                {/* Categoría y Estado */}
                <div className={styles.formRow} style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Categoría</label>
                    <input
                      className="form-input"
                      placeholder="Ej: Conjuntos, Corpiños..."
                      value={form.categoria}
                      onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-input"
                      value={form.estado}
                      onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                {/* Descripción */}
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Descripción del producto..."
                    value={form.descripcion}
                    onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Imagen */}
                <div className="form-group">
                  <label className="form-label">Imagen</label>
                  <label className={styles.uploadBtn} style={{ display: 'inline-flex', cursor: 'pointer' }}>
                    <FiUpload size={14} />
                    {imageFile ? imageFile.name : 'Seleccionar imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageChange}
                    />
                  </label>
                  {imagePreview && (
                    <div style={{ marginTop: 10 }}>
                      <img src={imagePreview} alt="Preview" className={styles.currentImage} />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
