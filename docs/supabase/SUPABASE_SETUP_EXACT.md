# 🎯 PROMPT EXACTO PARA CREAR BASE DE DATOS EN SUPABASE

## ⚠️ IMPORTANTE: Lee TODO antes de ejecutar

---

## 📋 PASO 1: Crear Proyecto en Supabase

1. Ve a: https://supabase.com/dashboard
2. Click: **"New project"**
3. Completa:
   ```
   Name: virtud-gym
   Database Password: [GENERA UNO FUERTE Y GUÁRDALO]
   Region: South America (São Paulo)
   Pricing Plan: Free
   ```
4. Click: **"Create new project"**
5. **ESPERA 2-3 MINUTOS** hasta que diga "Project is ready"

---

## 📋 PASO 2: Obtener Credenciales

1. En el proyecto creado, ve a: **Settings** → **API**
2. Copia y guarda:
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (NO compartir)
   ```

---

## 📋 PASO 3: Ejecutar Schema SQL

### ⚠️ CRÍTICO: Ejecutar EN ORDEN

1. Ve a: **SQL Editor** (en el menú lateral)
2. Click: **"New query"**
3. **COPIA Y PEGA EXACTAMENTE** el siguiente SQL:

```sql
-- ============================================
-- PASO 1: EXTENSIONES (Ejecutar primero)
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PASO 2: TABLA PROFILES
-- ============================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'coach', 'admin', 'superadmin')),
    
    -- Member specific
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    
    -- Medical
    medical_conditions TEXT[],
    injuries TEXT[],
    medications TEXT,
    restrictions TEXT,
    
    -- Membership
    membership_status TEXT DEFAULT 'inactive' CHECK (membership_status IN ('active', 'inactive', 'suspended', 'expired')),
    membership_start_date TIMESTAMPTZ,
    membership_end_date TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PASO 3: TABLA ACTIVITIES
-- ============================================
CREATE TABLE activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('gym', 'martial_arts', 'tcm', 'wellness')),
    category TEXT,
    image_url TEXT,
    duration_minutes INTEGER DEFAULT 60,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
    max_capacity INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PASO 4: TABLA CLASSES
-- ============================================
CREATE TABLE classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
    coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    max_capacity INTEGER DEFAULT 20,
    current_capacity INTEGER DEFAULT 0,
    waitlist_enabled BOOLEAN DEFAULT true,
    
    is_active BOOLEAN DEFAULT true,
    is_recurring BOOLEAN DEFAULT true,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- ============================================
-- PASO 5: TABLA BOOKINGS
-- ============================================
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    
    booking_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist', 'attended', 'no_show')),
    
    is_waitlist BOOLEAN DEFAULT false,
    waitlist_position INTEGER,
    
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES profiles(id),
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, class_id, booking_date)
);

-- ============================================
-- PASO 6: TABLA PAYMENTS
-- ============================================
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'ARS',
    concept TEXT NOT NULL,
    
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'mercadopago')),
    payment_provider TEXT,
    provider_payment_id TEXT,
    
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
    
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PASO 7: TABLA ROUTINES
-- ============================================
CREATE TABLE routines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    goal TEXT,
    duration_weeks INTEGER,
    
    generated_by_ai BOOLEAN DEFAULT false,
    ai_prompt TEXT,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PASO 8: TABLA EXERCISES
-- ============================================
CREATE TABLE exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    routine_id UUID REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    muscle_group TEXT,
    equipment TEXT[],
    
    sets INTEGER,
    reps TEXT,
    rest_seconds INTEGER,
    
    day_number INTEGER NOT NULL,
    order_in_day INTEGER NOT NULL,
    
    instructions TEXT,
    video_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PASO 9: INDEXES
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_membership_status ON profiles(membership_status);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE INDEX idx_classes_activity_id ON classes(activity_id);
CREATE INDEX idx_classes_coach_id ON classes(coach_id);
CREATE INDEX idx_classes_day_of_week ON classes(day_of_week);
CREATE INDEX idx_classes_is_active ON classes(is_active);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_class_id ON bookings(class_id);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_coach_id ON routines(coach_id);
CREATE INDEX idx_routines_is_active ON routines(is_active);

CREATE INDEX idx_exercises_routine_id ON exercises(routine_id);
CREATE INDEX idx_exercises_day_number ON exercises(day_number);

-- ============================================
-- PASO 10: HABILITAR RLS
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 11: POLICIES - PROFILES
-- ============================================
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- ============================================
-- PASO 12: POLICIES - ACTIVITIES
-- ============================================
CREATE POLICY "Anyone can view active activities" ON activities
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage activities" ON activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- ============================================
-- PASO 13: POLICIES - CLASSES
-- ============================================
CREATE POLICY "Anyone can view active classes" ON classes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Coaches can manage own classes" ON classes
    FOR ALL USING (
        coach_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- ============================================
-- PASO 14: POLICIES - BOOKINGS
-- ============================================
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own bookings" ON bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can cancel own bookings" ON bookings
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Staff can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('coach', 'admin', 'superadmin')
        )
    );

-- ============================================
-- PASO 15: POLICIES - PAYMENTS
-- ============================================
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- ============================================
-- PASO 16: POLICIES - ROUTINES
-- ============================================
CREATE POLICY "Users can view own routines" ON routines
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Coaches can view assigned routines" ON routines
    FOR SELECT USING (
        coach_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Coaches can create routines" ON routines
    FOR INSERT WITH CHECK (
        coach_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- ============================================
-- PASO 17: POLICIES - EXERCISES
-- ============================================
CREATE POLICY "Users can view exercises from own routines" ON exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM routines
            WHERE routines.id = exercises.routine_id
            AND routines.user_id = auth.uid()
        )
    );

CREATE POLICY "Coaches can manage exercises" ON exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM routines
            WHERE routines.id = exercises.routine_id
            AND (
                routines.coach_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles
                    WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
                )
            )
        )
    );

-- ============================================
-- PASO 18: TRIGGER - updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PASO 19: TRIGGER - Auto-create profile
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PASO 20: TRIGGER - Update class capacity
-- ============================================
CREATE OR REPLACE FUNCTION update_class_capacity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
        UPDATE classes
        SET current_capacity = current_capacity + 1
        WHERE id = NEW.class_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
        UPDATE classes
        SET current_capacity = current_capacity - 1
        WHERE id = NEW.class_id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
        UPDATE classes
        SET current_capacity = current_capacity - 1
        WHERE id = OLD.class_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_class_capacity_trigger
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_class_capacity();

-- ============================================
-- PASO 21: VIEWS
-- ============================================
CREATE OR REPLACE VIEW classes_with_availability AS
SELECT 
    c.*,
    a.name as activity_name,
    a.type as activity_type,
    a.image_url as activity_image,
    p.full_name as coach_name,
    (c.max_capacity - c.current_capacity) as available_spots,
    CASE 
        WHEN c.current_capacity >= c.max_capacity THEN 'full'
        WHEN c.current_capacity >= (c.max_capacity * 0.8) THEN 'almost_full'
        ELSE 'available'
    END as availability_status
FROM classes c
LEFT JOIN activities a ON c.activity_id = a.id
LEFT JOIN profiles p ON c.coach_id = p.id
WHERE c.is_active = true;

CREATE OR REPLACE VIEW user_bookings_detailed AS
SELECT 
    b.*,
    c.day_of_week,
    c.start_time,
    c.end_time,
    a.name as activity_name,
    a.type as activity_type,
    a.image_url as activity_image,
    p.full_name as coach_name
FROM bookings b
JOIN classes c ON b.class_id = c.id
JOIN activities a ON c.activity_id = a.id
LEFT JOIN profiles p ON c.coach_id = p.id;

CREATE OR REPLACE VIEW active_memberships AS
SELECT 
    id,
    email,
    full_name,
    membership_status,
    membership_start_date,
    membership_end_date,
    CASE 
        WHEN membership_end_date < NOW() THEN 'expired'
        WHEN membership_end_date < NOW() + INTERVAL '7 days' THEN 'expiring_soon'
        ELSE 'active'
    END as membership_alert
FROM profiles
WHERE membership_status = 'active';

-- ============================================
-- PASO 22: SEED DATA (Actividades iniciales)
-- ============================================
INSERT INTO activities (name, description, type, category, difficulty, max_capacity) VALUES
('Funcional', 'Entrenamiento funcional de alta intensidad', 'gym', 'Funcional', 'all_levels', 15),
('Fuerza', 'Entrenamiento de fuerza con pesas', 'gym', 'Fuerza', 'intermediate', 12),
('CrossFit', 'WOD del día - entrenamiento variado', 'gym', 'CrossFit', 'advanced', 20),
('BJJ Principiantes', 'Brazilian Jiu-Jitsu para principiantes', 'martial_arts', 'BJJ', 'beginner', 15),
('BJJ Avanzado', 'Brazilian Jiu-Jitsu nivel avanzado', 'martial_arts', 'BJJ', 'advanced', 12),
('Muay Thai', 'Arte marcial tailandés - striking', 'martial_arts', 'Muay Thai', 'all_levels', 15),
('Yoga', 'Yoga y estiramientos', 'tcm', 'Yoga', 'all_levels', 20),
('Acupuntura', 'Sesiones de acupuntura terapéutica', 'tcm', 'Medicina China', 'all_levels', 1);
```

4. Click: **"Run"** (o presiona Ctrl+Enter)
5. **ESPERA** a que termine (verás "Success" en verde)

---

## ✅ VERIFICACIÓN

1. Ve a: **Table Editor** (menú lateral)
2. Deberías ver 7 tablas:
   - ✅ profiles
   - ✅ activities (con 8 filas de datos)
   - ✅ classes
   - ✅ bookings
   - ✅ payments
   - ✅ routines
   - ✅ exercises

3. Ve a: **Database** → **Functions**
   - Deberías ver 3 funciones

4. Ve a: **Database** → **Triggers**
   - Deberías ver 9 triggers

---

## ⚠️ SI HAY ERRORES

### Error: "extension does not exist"
**Solución**: Ejecuta solo el PASO 1 primero, luego el resto.

### Error: "relation already exists"
**Solución**: Ya ejecutaste el script. Puedes:
- Ignorar (está bien)
- O borrar todo y volver a ejecutar:
  ```sql
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO postgres;
  GRANT ALL ON SCHEMA public TO public;
  ```

### Error: "permission denied"
**Solución**: Estás usando el usuario correcto. Ignora y continúa.

---

## 📋 PASO 4: Configurar .env.local

Crea/actualiza `frontend/.env.local`:

```bash
# Supabase (REEMPLAZA con tus valores)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Mantener las demás variables
GEMINI_API_KEY=AIzaSyAhlTELAmI-RlGCEqNxVQYzGZQMQAKVhvg
NEXT_PUBLIC_SENTRY_DSN=https://6c8e1263a1832b2bad4c8d0702860ee5@o4510505591242752.ingest.us.sentry.io/4510505598648320
NEXT_PUBLIC_GA_ID=G-ZYE3NG26PL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_OWNER_EMAIL=echavarrialucas1986@gmail.com
```

---

## ✅ LISTO

**Base de datos creada exitosamente** 🎉

**Siguiente paso**: Decidir estrategia de migración (gradual o completa)
