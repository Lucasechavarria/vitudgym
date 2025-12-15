# 🔐 Variables de Entorno para Supabase

## Configuración Requerida

Crea un archivo `.env.local` en la raíz de `frontend/` con el siguiente contenido:

```bash
# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# ============================================
# GEMINI AI (Server-side)
# ============================================
GEMINI_API_KEY=AIzaSyAhlTELAmI-RlGCEqNxVQYzGZQMQAKVhvg

# ============================================
# SENTRY ERROR TRACKING
# ============================================
NEXT_PUBLIC_SENTRY_DSN=https://6c8e1263a1832b2bad4c8d0702860ee5@o4510505591242752.ingest.us.sentry.io/4510505598648320

# ============================================
# GOOGLE ANALYTICS
# ============================================
NEXT_PUBLIC_GA_ID=G-ZYE3NG26PL

# ============================================
# MERCADOPAGO (Opcional - para pagos)
# ============================================
MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu-access-token-aqui
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu-public-key-aqui

# ============================================
# OTROS
# ============================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_OWNER_EMAIL=echavarrialucas1986@gmail.com
```

## Dónde Obtener las Credenciales de Supabase

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Importante

- ⚠️ **NO** compartas estas credenciales públicamente
- ⚠️ **NO** las subas a Git (ya están en `.gitignore`)
- ✅ Usa las mismas credenciales en producción (Vercel)
