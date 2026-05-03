# 🌸 Petite Sorciere Lencería — Guía de Deploy Completa

## ESTRUCTURA DEL PROYECTO

```
petite-sorciere/
├── src/
│   ├── pages/
│   │   ├── index.js              ← Catálogo (home pública)
│   │   ├── login.js              ← Login con Google
│   │   ├── carrito.js            ← Carrito + checkout completo
│   │   └── admin/
│   │       ├── index.js          ← Dashboard vendedora
│   │       ├── login.js          ← Login admin
│   │       ├── pedidos.js        ← Gestión de pedidos
│   │       ├── productos.js      ← CRUD de productos
│   │       ├── clientes.js       ← Base de clientes + CSV
│   │       └── estadisticas.js   ← Métricas y rankings
│   ├── components/
│   │   ├── client/
│   │   │   ├── Navbar.js         ← Nav con carrito y usuario
│   │   │   └── ProductCard.js    ← Tarjeta de producto
│   │   └── admin/
│   │       └── AdminLayout.js    ← Sidebar del panel admin
│   ├── hooks/
│   │   ├── useAuth.js            ← Context de autenticación
│   │   └── useCart.js            ← Context del carrito
│   ├── lib/
│   │   ├── firebase.js           ← Configuración Firebase
│   │   └── argentina.js          ← Provincias y ciudades
│   └── styles/                   ← CSS Modules + globals
├── .env.example                  ← Variables de entorno (plantilla)
├── next.config.js
└── package.json
```

---

## PASO 1 — CREAR PROYECTO FIREBASE

1. Ir a **https://console.firebase.google.com**
2. Hacer clic en **"Agregar proyecto"**
3. Nombre: `petite-sorciere` → Continuar → Crear
4. En el menú lateral, ir a **"Compilación"**:

### Habilitar Authentication
- Ir a **Authentication → Comenzar → Sign-in method**
- Activar **Google** → Guardar
- Activar **Email/contraseña** → Guardar (para el login de admin)

### Crear base de datos Firestore
- Ir a **Firestore Database → Crear base de datos**
- Elegir **"Comenzar en modo de producción"**
- Seleccionar ubicación: `us-east1` (o `southamerica-east1` si disponible)
- Crear

### Configurar Storage
- Ir a **Storage → Comenzar**
- Aceptar reglas por defecto → Listo

### Obtener las credenciales
- Ir a **Configuración del proyecto** (ícono ⚙️)
- Scroll hasta "Tus apps" → Hacer clic en `</>`  (Web)
- Registrar app con el nombre `petite-sorciere-web`
- Copiar el objeto `firebaseConfig` que aparece

---

## PASO 2 — CONFIGURAR REGLAS DE FIRESTORE

En **Firestore → Reglas**, reemplazar con esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios: solo el propio usuario puede leer/escribir su doc
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admin puede leer todos
      allow read: if request.auth.token.email == 'TU_EMAIL_ADMIN@gmail.com';
    }
    
    // Productos: todos pueden leer, solo admin puede escribir
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'TU_EMAIL_ADMIN@gmail.com';
    }
    
    // Pedidos: usuario autenticado puede crear, admin puede leer/escribir todos
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.email == 'TU_EMAIL_ADMIN@gmail.com');
    }
  }
}
```

⚠️ **Reemplazá `TU_EMAIL_ADMIN@gmail.com` con tu email real.**

---

## PASO 3 — CONFIGURAR REGLAS DE STORAGE

En **Storage → Reglas**:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Comprobantes: solo usuarios autenticados pueden subir
    match /comprobantes/{file} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024;
    }
    // Imágenes de productos: solo admin puede subir
    match /products/{file} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## PASO 4 — CREAR CUENTA DE ADMIN EN FIREBASE

1. Ir a **Authentication → Users → Agregar usuario**
2. Email: tu email de admin (el mismo de `NEXT_PUBLIC_ADMIN_EMAIL`)
3. Contraseña: elegí una segura
4. Este email + contraseña es el que usarás en `/admin/login`

---

## PASO 5 — CONFIGURAR EL PROYECTO LOCAL

```bash
# Clonar / descomprimir el proyecto
cd petite-sorciere

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env.local
```

### Editar `.env.local` con tus datos reales:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=petite-sorciere.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=petite-sorciere
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=petite-sorciere.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...

NEXT_PUBLIC_ADMIN_EMAIL=tu@email.com
NEXT_PUBLIC_WHATSAPP_NUMBER=3624750548
NEXT_PUBLIC_STORE_NAME=Petite Sorciere Lencería
NEXT_PUBLIC_ALIAS_PAGO=REYNOSO.76.UALA.
NEXT_PUBLIC_CBU_PAGO=3840200500000008806815
```

### Probar localmente:
```bash
npm run dev
# Abrir http://localhost:3000
```

---

## PASO 6 — DEPLOY EN VERCEL

### Opción A — Desde GitHub (recomendado)

```bash
# Subir a GitHub
git init
git add .
git commit -m "Initial commit - Petite Sorciere"
git remote add origin https://github.com/TU_USUARIO/petite-sorciere.git
git push -u origin main
```

1. Ir a **https://vercel.com** → New Project
2. Importar el repo de GitHub
3. En **Environment Variables**, cargar todas las del `.env.local`
4. Click **Deploy** 🎉

### Opción B — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

Vercel te pedirá que ingreses las variables de entorno durante el proceso.

---

## PASO 7 — CONFIGURAR DOMINIO EN FIREBASE AUTH

Después del deploy, Vercel te da una URL tipo `petite-sorciere.vercel.app`.

1. Ir a **Firebase → Authentication → Settings → Authorized domains**
2. Agregar tu dominio de Vercel: `petite-sorciere.vercel.app`
3. Si tenés dominio propio, agregarlo también

---

## CÓMO USAR EL SISTEMA

### Como vendedora (admin)
- Entrar a `tudominio.com/admin/login`
- Usar email + contraseña de la cuenta admin que creaste en Firebase
- Desde el dashboard podés:
  - Ver pedidos nuevos (con alerta en tiempo real)
  - Cambiar el estado de cada pedido
  - Contactar clientas por WhatsApp con un clic
  - Agregar/editar/eliminar productos
  - Ver la base de clientes y exportar CSV
  - Revisar estadísticas de ventas

### Para agregar el primer producto
1. Ir a `/admin/login`
2. Panel → Productos → "Nuevo producto"
3. Completar nombre, precio, categoría, imagen
4. Guardar → aparece en el catálogo automáticamente

### Como clienta
1. Entrar a `tudominio.com`
2. Ver catálogo → agregar al carrito
3. Iniciar sesión con Google → ingresar WhatsApp
4. Finalizar compra → elegir retiro o envío
5. Transferir al alias/CBU → subir comprobante
6. Sistema notifica a la vendedora automáticamente

---

## FLUJO COMPLETO DE UN PEDIDO

```
Clienta agrega productos al carrito
        ↓
Elige retiro o envío (con dirección)
        ↓
Ve alias/CBU → transfiere → sube comprobante
        ↓
Pedido se crea en Firestore con estado "comprobante_enviado"
        ↓
Admin recibe notificación TOAST en tiempo real
        ↓
Admin revisa comprobante → cambia estado a "pago_verificado"
        ↓
Admin hace clic en "Contactar por WhatsApp" → mensaje pre-armado
        ↓
Coordina envío/retiro → cambia estado a "entregado"
```

---

## VARIABLES DE ENTORNO — REFERENCIA COMPLETA

| Variable | Descripción | Dónde obtenerla |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Clave API de Firebase | Firebase Console → Configuración del proyecto |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de auth | Firebase Console → Configuración del proyecto |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto | Firebase Console → Configuración del proyecto |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket de Storage | Firebase Console → Configuración del proyecto |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID del sender | Firebase Console → Configuración del proyecto |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ID de la app | Firebase Console → Configuración del proyecto |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Email de la vendedora | El que uses para crear la cuenta admin |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp (sin +54) | Tu número de negocio |
| `NEXT_PUBLIC_ALIAS_PAGO` | Alias de transferencia | Tu cuenta Uala/banco |
| `NEXT_PUBLIC_CBU_PAGO` | CBU de transferencia | Tu cuenta Uala/banco |

---

## PERSONALIZACIÓN RÁPIDA

### Cambiar color principal
En `src/styles/globals.css`, línea 4:
```css
--pink: #e06aa3; /* ← Cambiá este valor */
```

### Agregar nueva categoría de productos
Las categorías se generan automáticamente desde los productos cargados. Solo tenés que escribir el nombre de categoría al crear un producto.

### Cambiar el número de WhatsApp del botón de confirmación
En `.env.local`:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=NUEVO_NUMERO
```

### Cambiar el mensaje de WhatsApp pre-armado (clienta)
En `src/pages/carrito.js`, buscar `whatsappMsg` y editar el texto.

### Cambiar el mensaje de WhatsApp pre-armado (admin)
En `src/pages/admin/pedidos.js`, buscar `WHATSAPP_MSG` y editar el texto.

---

## SOPORTE Y ESCALADO

El sistema está pensado para crecer. Para el futuro podés agregar:

- **Pasarela de pagos**: integrar MercadoPago para pagos automáticos
- **Notificaciones push**: Firebase Cloud Messaging para alertas en el celular
- **Stock**: agregar campo `stock` a productos y decrementar al confirmar pedido
- **Descuentos**: agregar cupones con Firestore
- **Múltiples admins**: hacer la validación de admin por rol en Firestore en vez de email
