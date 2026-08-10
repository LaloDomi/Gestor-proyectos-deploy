-- Fase 4: videollamadas embebidas con Jitsi Meet (meet.jit.si, público y gratuito).

CREATE TABLE IF NOT EXISTS Videollamadas (
  id_llamada SERIAL PRIMARY KEY,
  id_proyecto INT NOT NULL REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE,
  sala VARCHAR(150) NOT NULL UNIQUE,
  titulo VARCHAR(150),
  creado_por INT NOT NULL REFERENCES Usuarios(id_usuario),
  creado_en TIMESTAMP NOT NULL DEFAULT now(),
  estado VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'finalizada'))
);

CREATE INDEX IF NOT EXISTS ix_videollamadas_proyecto ON Videollamadas (id_proyecto, creado_en DESC);
