-- Fase 1: membresía de proyectos (muchos-a-muchos) e invitaciones.

CREATE TABLE IF NOT EXISTS ProyectoMiembros (
  id_miembro SERIAL PRIMARY KEY,
  id_proyecto INT NOT NULL REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE,
  id_usuario INT NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  rol_proyecto VARCHAR(20) NOT NULL DEFAULT 'colaborador'
    CHECK (rol_proyecto IN ('lider', 'colaborador')),
  fecha_union TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (id_proyecto, id_usuario)
);

-- Backfill: el responsable actual de cada proyecto se vuelve su líder.
INSERT INTO ProyectoMiembros (id_proyecto, id_usuario, rol_proyecto)
SELECT id_proyecto, id_responsable, 'lider' FROM Proyectos
ON CONFLICT (id_proyecto, id_usuario) DO NOTHING;

-- Backfill: cualquier usuario con una tarea asignada en un proyecto conserva
-- acceso a ese proyecto como colaborador (si no era ya miembro).
INSERT INTO ProyectoMiembros (id_proyecto, id_usuario, rol_proyecto)
SELECT DISTINCT id_proyecto, id_responsable, 'colaborador' FROM Tareas
ON CONFLICT (id_proyecto, id_usuario) DO NOTHING;

CREATE TABLE IF NOT EXISTS Invitaciones (
  id_invitacion SERIAL PRIMARY KEY,
  correo VARCHAR(100) NOT NULL,
  id_proyecto INT NOT NULL REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE,
  rol_proyecto VARCHAR(20) NOT NULL DEFAULT 'colaborador'
    CHECK (rol_proyecto IN ('lider', 'colaborador')),
  token VARCHAR(128) NOT NULL UNIQUE,
  invitado_por INT NOT NULL REFERENCES Usuarios(id_usuario),
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'aceptada', 'expirada', 'revocada')),
  fecha_creacion TIMESTAMP NOT NULL DEFAULT now(),
  fecha_expiracion TIMESTAMP NOT NULL,
  fecha_aceptacion TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_invitaciones_proyecto ON Invitaciones(id_proyecto);
CREATE INDEX IF NOT EXISTS ix_invitaciones_correo ON Invitaciones(correo);
