-- ============================================
-- CONFIGURACIÓN COMPLETA DE BASE DE DATOS SUPABASE
-- ============================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ELIMINAR TABLAS EXISTENTES (SI EXISTEN)
-- ============================================
DROP TABLE IF EXISTS sesiones CASCADE;
DROP TABLE IF EXISTS solicitudes CASCADE;
DROP TABLE IF EXISTS mentor_profiles CASCADE;
DROP TABLE IF EXISTS solicitante_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Eliminar funciones y triggers existentes
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- CREAR TABLAS PRINCIPALES
-- ============================================

-- Tabla de usuarios (sincronizada con NextAuth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image TEXT,
  role VARCHAR(20) CHECK (role IN ('mentor', 'solicitante')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de perfiles de mentores
CREATE TABLE mentor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  foto TEXT,
  area_experiencia VARCHAR(255) NOT NULL,
  anos_experiencia INTEGER NOT NULL CHECK (anos_experiencia > 0),
  disponibilidad TEXT[] DEFAULT '{}', -- Array de días de la semana
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_mentor_user UNIQUE(user_id)
);

-- Tabla de perfiles de solicitantes
CREATE TABLE solicitante_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  edad INTEGER NOT NULL CHECK (edad >= 16 AND edad <= 100),
  area_interes VARCHAR(255) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_solicitante_user UNIQUE(user_id)
);

-- Tabla de solicitudes de mentoría
CREATE TABLE solicitudes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitante_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
  mensaje TEXT NOT NULL,
  enlace_meet TEXT,
  fecha_sesion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_users CHECK (solicitante_id != mentor_id)
);

-- Tabla de sesiones de mentoría
CREATE TABLE sesiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  solicitante_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  enlace_meet TEXT NOT NULL,
  estado VARCHAR(20) DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_session_users CHECK (mentor_id != solicitante_id)
);

-- ============================================
-- CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Índices para mentor_profiles
CREATE INDEX idx_mentor_profiles_user_id ON mentor_profiles(user_id);
CREATE INDEX idx_mentor_profiles_area ON mentor_profiles(area_experiencia);
CREATE INDEX idx_mentor_profiles_activo ON mentor_profiles(activo);
CREATE INDEX idx_mentor_profiles_anos ON mentor_profiles(anos_experiencia);

-- Índices para solicitante_profiles
CREATE INDEX idx_solicitante_profiles_user_id ON solicitante_profiles(user_id);
CREATE INDEX idx_solicitante_profiles_area ON solicitante_profiles(area_interes);
CREATE INDEX idx_solicitante_profiles_edad ON solicitante_profiles(edad);

-- Índices para solicitudes
CREATE INDEX idx_solicitudes_mentor_id ON solicitudes(mentor_id);
CREATE INDEX idx_solicitudes_solicitante_id ON solicitudes(solicitante_id);
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX idx_solicitudes_created_at ON solicitudes(created_at);
CREATE INDEX idx_solicitudes_fecha_sesion ON solicitudes(fecha_sesion);

-- Índices para sesiones
CREATE INDEX idx_sesiones_solicitud_id ON sesiones(solicitud_id);
CREATE INDEX idx_sesiones_mentor_id ON sesiones(mentor_id);
CREATE INDEX idx_sesiones_solicitante_id ON sesiones(solicitante_id);
CREATE INDEX idx_sesiones_fecha ON sesiones(fecha);
CREATE INDEX idx_sesiones_estado ON sesiones(estado);
CREATE INDEX idx_sesiones_created_at ON sesiones(created_at);

-- ============================================
-- CREAR FUNCIÓN PARA ACTUALIZAR TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- CREAR TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- ============================================

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentor_profiles_updated_at 
    BEFORE UPDATE ON mentor_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solicitante_profiles_updated_at 
    BEFORE UPDATE ON solicitante_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solicitudes_updated_at 
    BEFORE UPDATE ON solicitudes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sesiones_updated_at 
    BEFORE UPDATE ON sesiones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitante_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para desarrollo (se pueden refinar después)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on mentor_profiles" ON mentor_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on solicitante_profiles" ON solicitante_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on solicitudes" ON solicitudes FOR ALL USING (true);
CREATE POLICY "Allow all operations on sesiones" ON sesiones FOR ALL USING (true);

-- ============================================
-- INSERTAR DATOS DE EJEMPLO
-- ============================================

-- Usuarios mentores de ejemplo
INSERT INTO users (id, email, name, image, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'ana.garcia@example.com', 'Ana García', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'mentor'),
  ('550e8400-e29b-41d4-a716-446655440002', 'carlos.rodriguez@example.com', 'Carlos Rodríguez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'mentor'),
  ('550e8400-e29b-41d4-a716-446655440003', 'maria.lopez@example.com', 'María López', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'mentor');

-- Perfiles de mentores
INSERT INTO mentor_profiles (user_id, nombre, foto, area_experiencia, anos_experiencia, disponibilidad, descripcion) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Ana García', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'Desarrollo Web', 8, ARRAY['Lunes', 'Miércoles', 'Viernes'], 'Desarrolladora Full Stack con experiencia en React, Node.js y bases de datos. Me apasiona ayudar a otros a crecer en tecnología y compartir conocimientos sobre las mejores prácticas de desarrollo.'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Carlos Rodríguez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Marketing Digital', 6, ARRAY['Martes', 'Jueves', 'Sábado'], 'Especialista en marketing digital y growth hacking. He ayudado a más de 50 startups a crecer y desarrollar estrategias de marketing efectivas. Experto en SEO, SEM y redes sociales.'),
  ('550e8400-e29b-41d4-a716-446655440003', 'María López', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'Diseño UX/UI', 5, ARRAY['Lunes', 'Martes', 'Jueves'], 'Diseñadora UX/UI con experiencia en productos digitales. Me enfoco en crear experiencias centradas en el usuario y ayudo a equipos a implementar metodologías de design thinking.');

-- Usuario solicitante de ejemplo
INSERT INTO users (id, email, name, image, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440004', 'juan.perez@example.com', 'Juan Pérez', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'solicitante');

-- Perfil de solicitante
INSERT INTO solicitante_profiles (user_id, nombre, edad, area_interes, descripcion) VALUES
  ('550e8400-e29b-41d4-a716-446655440004', 'Juan Pérez', 25, 'Desarrollo Web', 'Estudiante de ingeniería en sistemas buscando orientación para iniciar mi carrera en desarrollo web. Tengo conocimientos básicos de HTML y CSS.');

-- Solicitud de ejemplo
INSERT INTO solicitudes (id, solicitante_id, mentor_id, mensaje) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Hola Ana, me interesa mucho aprender desarrollo web. He visto tu perfil y creo que podrías ayudarme a orientar mi carrera. ¿Podrías ser mi mentora?');

-- ============================================
-- VERIFICAR INSTALACIÓN
-- ============================================

-- Mostrar resumen de tablas creadas
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Mostrar conteo de registros
SELECT 'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'mentor_profiles' as tabla, COUNT(*) as registros FROM mentor_profiles
UNION ALL
SELECT 'solicitante_profiles' as tabla, COUNT(*) as registros FROM solicitante_profiles
UNION ALL
SELECT 'solicitudes' as tabla, COUNT(*) as registros FROM solicitudes
UNION ALL
SELECT 'sesiones' as tabla, COUNT(*) as registros FROM sesiones;
