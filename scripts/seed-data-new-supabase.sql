-- Insertar datos de ejemplo

-- Usuarios mentores de ejemplo
INSERT INTO users (id, email, name, image, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'ana.garcia@example.com', 'Ana García', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'mentor')
  ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image, role = EXCLUDED.role;

INSERT INTO users (id, email, name, image, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'carlos.rodriguez@example.com', 'Carlos Rodríguez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'mentor')
  ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image, role = EXCLUDED.role;

INSERT INTO users (id, email, name, image, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'maria.lopez@example.com', 'María López', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'mentor')
  ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image, role = EXCLUDED.role;

-- Perfiles de mentores
INSERT INTO mentor_profiles (user_id, nombre, foto, area_experiencia, anos_experiencia, disponibilidad, descripcion) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Ana García', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'Desarrollo Web', 8, ARRAY['Lunes', 'Miércoles', 'Viernes'], 'Desarrolladora Full Stack con experiencia en React, Node.js y bases de datos. Me apasiona ayudar a otros a crecer en tecnología y compartir conocimientos sobre las mejores prácticas de desarrollo.')
  ON CONFLICT (user_id) DO UPDATE SET 
    nombre = EXCLUDED.nombre, 
    foto = EXCLUDED.foto, 
    area_experiencia = EXCLUDED.area_experiencia, 
    anos_experiencia = EXCLUDED.anos_experiencia, 
    disponibilidad = EXCLUDED.disponibilidad, 
    descripcion = EXCLUDED.descripcion;

INSERT INTO mentor_profiles (user_id, nombre, foto, area_experiencia, anos_experiencia, disponibilidad, descripcion) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Carlos Rodríguez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Marketing Digital', 6, ARRAY['Martes', 'Jueves', 'Sábado'], 'Especialista en marketing digital y growth hacking. He ayudado a más de 50 startups a crecer y desarrollar estrategias de marketing efectivas. Experto en SEO, SEM y redes sociales.')
  ON CONFLICT (user_id) DO UPDATE SET 
    nombre = EXCLUDED.nombre, 
    foto = EXCLUDED.foto, 
    area_experiencia = EXCLUDED.area_experiencia, 
    anos_experiencia = EXCLUDED.anos_experiencia, 
    disponibilidad = EXCLUDED.disponibilidad, 
    descripcion = EXCLUDED.descripcion;

INSERT INTO mentor_profiles (user_id, nombre, foto, area_experiencia, anos_experiencia, disponibilidad, descripcion) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'María López', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'Diseño UX/UI', 5, ARRAY['Lunes', 'Martes', 'Jueves'], 'Diseñadora UX/UI con experiencia en productos digitales. Me enfoco en crear experiencias centradas en el usuario y ayudo a equipos a implementar metodologías de design thinking.')
  ON CONFLICT (user_id) DO UPDATE SET 
    nombre = EXCLUDED.nombre, 
    foto = EXCLUDED.foto, 
    area_experiencia = EXCLUDED.area_experiencia, 
    anos_experiencia = EXCLUDED.anos_experiencia, 
    disponibilidad = EXCLUDED.disponibilidad, 
    descripcion = EXCLUDED.descripcion;
