-- Crear extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (sincronizada con NextAuth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image TEXT,
  role VARCHAR(20) CHECK (role IN ('mentor', 'solicitante')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de perfiles de mentores
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  foto TEXT,
  area_experiencia VARCHAR(255) NOT NULL,
  anos_experiencia INTEGER NOT NULL CHECK (anos_experiencia > 0),
  disponibilidad TEXT[], -- Array de días de la semana
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla de perfiles de solicitantes
CREATE TABLE IF NOT EXISTS solicitante_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  edad INTEGER NOT NULL CHECK (edad >= 16 AND edad <= 100),
  area_interes VARCHAR(255) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabla de solicitudes de mentoría
CREATE TABLE IF NOT EXISTS solicitudes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitante_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
  mensaje TEXT NOT NULL,
  enlace_meet TEXT,
  fecha_sesion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones de mentoría
CREATE TABLE IF NOT EXISTS sesiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  solicitante_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  enlace_meet TEXT NOT NULL,
  estado VARCHAR(20) DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user_id ON mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_area ON mentor_profiles(area_experiencia);
CREATE INDEX IF NOT EXISTS idx_solicitante_profiles_user_id ON solicitante_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_mentor_id ON solicitudes(mentor_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_solicitante_id ON solicitudes(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha ON sesiones(fecha);
CREATE INDEX IF NOT EXISTS idx_sesiones_mentor_id ON sesiones(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_solicitante_id ON sesiones(solicitante_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mentor_profiles_updated_at ON mentor_profiles;
CREATE TRIGGER update_mentor_profiles_updated_at BEFORE UPDATE ON mentor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_solicitante_profiles_updated_at ON solicitante_profiles;
CREATE TRIGGER update_solicitante_profiles_updated_at BEFORE UPDATE ON solicitante_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_solicitudes_updated_at ON solicitudes;
CREATE TRIGGER update_solicitudes_updated_at BEFORE UPDATE ON solicitudes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sesiones_updated_at ON sesiones;
CREATE TRIGGER update_sesiones_updated_at BEFORE UPDATE ON sesiones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security) para mayor seguridad
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitante_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todo por ahora, se pueden refinar después)
CREATE POLICY IF NOT EXISTS "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all operations on mentor_profiles" ON mentor_profiles FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all operations on solicitante_profiles" ON solicitante_profiles FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all operations on solicitudes" ON solicitudes FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all operations on sesiones" ON sesiones FOR ALL USING (true);
