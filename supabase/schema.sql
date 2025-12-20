-- ============================================
-- VIRTUD GYM - SUPABASE DATABASE SCHEMA
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS & AUTH
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'coach', 'admin', 'superadmin')),
    
    -- Member specific fields
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    
    -- Medical history
    medical_conditions TEXT[],
    injuries TEXT[],
    medications TEXT,
    restrictions TEXT,
    
    -- Membership
    membership_status TEXT DEFAULT 'inactive' CHECK (membership_status IN ('active', 'inactive', 'suspended', 'expired')),
    membership_start_date TIMESTAMP WITH TIME ZONE,
    membership_end_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    assigned_coach_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CLASSES & ACTIVITIES
-- ============================================

CREATE TABLE activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('gym', 'martial_arts', 'tcm', 'wellness')),
    category TEXT, -- 'Funcional', 'Fuerza', 'Cardio', 'BJJ', 'Muay Thai', etc.
    image_url TEXT,
    duration_minutes INTEGER DEFAULT 60,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
    max_capacity INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES profiles(id),
    
    -- Schedule
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Capacity
    max_capacity INTEGER DEFAULT 20,
    current_capacity INTEGER DEFAULT 0,
    waitlist_enabled BOOLEAN DEFAULT true,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_recurring BOOLEAN DEFAULT true,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- ============================================
-- BOOKINGS & ATTENDANCE
-- ============================================

CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    
    -- Booking details
    booking_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist', 'attended', 'no_show')),
    
    -- Waitlist
    is_waitlist BOOLEAN DEFAULT false,
    waitlist_position INTEGER,
    
    -- Check-in
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_in_by UUID REFERENCES profiles(id),
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, class_id, booking_date)
);

-- ============================================
-- PAYMENTS & MEMBERSHIPS
-- ============================================

CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Nullable for admin expenses
    
    -- Payment details
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'ARS',
    concept TEXT NOT NULL,
    
    -- Payment method
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'mercadopago')),
    payment_provider TEXT, -- 'mercadopago', 'stripe', etc.
    provider_payment_id TEXT, -- External payment ID
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
    
    -- Approval (for manual payments)
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    notes TEXT,
    metadata JSONB, -- For storing provider-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROUTINES & EXERCISES
-- ============================================

CREATE TABLE routines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES profiles(id),
    
    -- Routine details
    name TEXT NOT NULL,
    description TEXT,
    goal TEXT, -- 'Hipertrofia', 'Fuerza', 'Pérdida de peso', etc.
    duration_weeks INTEGER,
    
    -- AI Generation
    generated_by_ai BOOLEAN DEFAULT false,
    ai_prompt TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
    
    -- Exercise details
    name TEXT NOT NULL,
    description TEXT,
    muscle_group TEXT,
    equipment TEXT[],
    
    -- Sets and reps
    sets INTEGER,
    reps TEXT, -- Can be "10-12" or "AMRAP" or "30 seconds"
    rest_seconds INTEGER,
    
    -- Order
    day_number INTEGER NOT NULL,
    order_in_day INTEGER NOT NULL,
    
    -- Instructions
    instructions TEXT,
    video_url TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_membership_status ON profiles(membership_status);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Classes
CREATE INDEX idx_classes_activity_id ON classes(activity_id);
CREATE INDEX idx_classes_coach_id ON classes(coach_id);
CREATE INDEX idx_classes_day_of_week ON classes(day_of_week);
CREATE INDEX idx_classes_is_active ON classes(is_active);

-- Bookings
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_class_id ON bookings(class_id);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Payments
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Routines
CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_coach_id ON routines(coach_id);
CREATE INDEX idx_routines_is_active ON routines(is_active);

-- Exercises
CREATE INDEX idx_exercises_routine_id ON exercises(routine_id);
CREATE INDEX idx_exercises_day_number ON exercises(day_number);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Profiles policies
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

CREATE POLICY "Coaches can view member profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('coach', 'admin', 'superadmin')
        )
    );

-- Activities policies (public read)
CREATE POLICY "Anyone can view active activities" ON activities
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage activities" ON activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- Classes policies
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

-- Bookings policies
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

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- Routines policies
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

-- Exercises policies (inherit from routines)
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
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
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

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update class capacity
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
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Classes with availability
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

-- View: User bookings with details
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

-- View: Active memberships
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
-- INITIAL DATA (SEED)
-- ============================================

-- Insert default activities
INSERT INTO activities (name, description, type, category, difficulty, max_capacity) VALUES
('Funcional', 'Entrenamiento funcional de alta intensidad', 'gym', 'Funcional', 'all_levels', 15),
('Fuerza', 'Entrenamiento de fuerza con pesas', 'gym', 'Fuerza', 'intermediate', 12),
('CrossFit', 'WOD del día - entrenamiento variado', 'gym', 'CrossFit', 'advanced', 20),
('BJJ Principiantes', 'Brazilian Jiu-Jitsu para principiantes', 'martial_arts', 'BJJ', 'beginner', 15),
('BJJ Avanzado', 'Brazilian Jiu-Jitsu nivel avanzado', 'martial_arts', 'BJJ', 'advanced', 12),
('Muay Thai', 'Arte marcial tailandés - striking', 'martial_arts', 'Muay Thai', 'all_levels', 15),
('Yoga', 'Yoga y estiramientos', 'tcm', 'Yoga', 'all_levels', 20),
('Acupuntura', 'Sesiones de acupuntura terapéutica', 'tcm', 'Medicina China', 'all_levels', 1);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE activities IS 'Available activities and classes types';
COMMENT ON TABLE classes IS 'Scheduled classes with coaches and capacity';
COMMENT ON TABLE bookings IS 'User bookings and attendance tracking';
COMMENT ON TABLE payments IS 'Payment records and membership fees';
COMMENT ON TABLE routines IS 'Personalized training routines';
COMMENT ON TABLE exercises IS 'Individual exercises within routines';
