-- ============================================
-- ARREGLAR BASE DE DATOS COMPLETA
-- ============================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- RECREAR TABLAS CON ESTRUCTURA CORRECTA
-- ============================================

-- Eliminar tablas existentes si hay problemas
DROP TABLE IF EXISTS sesiones CASCADE;
DROP TABLE IF EXISTS solicitudes CASCADE;
DROP TABLE IF EXISTS mentor_profiles CASCADE;
DROP TABLE IF EXISTS solicitante_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

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
  disponibilidad TEXT[] DEFAULT '{}',
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
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
  UNIQUE(user_id)
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
  CHECK (solicitante_id != mentor_id)
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
  CHECK (mentor_id != solicitante_id)
);

-- ============================================
-- CREAR ÍNDICES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_mentor_profiles_user_id ON mentor_profiles(user_id);
CREATE INDEX idx_mentor_profiles_area ON mentor_profiles(area_experiencia);
CREATE INDEX idx_solicitante_profiles_user_id ON solicitante_profiles(user_id);
CREATE INDEX idx_solicitudes_mentor_id ON solicitudes(mentor_id);
CREATE INDEX idx_solicitudes_solicitante_id ON solicitudes(solicitante_id);
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX idx_sesiones_mentor_id ON sesiones(mentor_id);
CREATE INDEX idx_sesiones_solicitante_id ON sesiones(solicitante_id);
CREATE INDEX idx_sesiones_fecha ON sesiones(fecha);

-- ============================================
-- FUNCIÓN Y TRIGGERS PARA TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentor_profiles_updated_at BEFORE UPDATE ON mentor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_solicitante_profiles_updated_at BEFORE UPDATE ON solicitante_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_solicitudes_updated_at BEFORE UPDATE ON solicitudes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sesiones_updated_at BEFORE UPDATE ON sesiones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONFIGURAR RLS (PERMISIVO PARA DESARROLLO)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitante_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all on mentor_profiles" ON mentor_profiles FOR ALL USING (true);
CREATE POLICY "Allow all on solicitante_profiles" ON solicitante_profiles FOR ALL USING (true);
CREATE POLICY "Allow all on solicitudes" ON solicitudes FOR ALL USING (true);
CREATE POLICY "Allow all on sesiones" ON sesiones FOR ALL USING (true);

-- ============================================
-- INSERTAR DATOS DE EJEMPLO
-- ============================================

-- Usuarios mentores
INSERT INTO users (id, email, name, image, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'ana.garcia@example.com', 'Ana García', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'mentor'),
  ('550e8400-e29b-41d4-a716-446655440002', 'carlos.rodriguez@example.com', 'Carlos Rodríguez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'mentor'),
  ('550e8400-e29b-41d4-a716-446655440003', 'maria.lopez@example.com', 'María López', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'mentor');

-- Perfiles de mentores
INSERT INTO mentor_profiles (user_id, nombre, foto, area_experiencia, anos_experiencia, disponibilidad, descripcion) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Ana García', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'Desarrollo Web', 8, ARRAY['Lunes', 'Miércoles', 'Viernes'], 'Desarrolladora Full Stack con experiencia en React, Node.js y bases de datos.'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Carlos Rodríguez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Marketing Digital', 6, ARRAY['Martes', 'Jueves', 'Sábado'], 'Especialista en marketing digital y growth hacking.'),
  ('550e8400-e29b-41d4-a716-446655440003', 'María López', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'Diseño UX/UI', 5, ARRAY['Lunes', 'Martes', 'Jueves'], 'Diseñadora UX/UI con experiencia en productos digitales.');

-- Verificar instalación
SELECT 'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'mentor_profiles' as tabla, COUNT(*) as registros FROM mentor_profiles
UNION ALL
SELECT 'solicitante_profiles' as tabla, COUNT(*) as registros FROM solicitante_profiles
UNION ALL
SELECT 'solicitudes' as tabla, COUNT(*) as registros FROM solicitudes
UNION ALL
SELECT 'sesiones' as tabla, COUNT(*) as registros FROM sesiones;
