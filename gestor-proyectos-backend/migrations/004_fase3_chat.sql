-- Fase 3: chat en vivo — un canal grupal por proyecto + canales directos 1:1.

CREATE TABLE IF NOT EXISTS ChatCanales (
  id_canal SERIAL PRIMARY KEY,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('proyecto', 'directo')),
  id_proyecto INT REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE,
  id_usuario_a INT REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  id_usuario_b INT REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  creado_en TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_canal_proyecto ON ChatCanales (id_proyecto) WHERE tipo = 'proyecto';
CREATE UNIQUE INDEX IF NOT EXISTS ux_canal_directo ON ChatCanales (id_usuario_a, id_usuario_b) WHERE tipo = 'directo';

CREATE TABLE IF NOT EXISTS ChatMensajes (
  id_mensaje SERIAL PRIMARY KEY,
  id_canal INT NOT NULL REFERENCES ChatCanales(id_canal) ON DELETE CASCADE,
  id_usuario INT NOT NULL REFERENCES Usuarios(id_usuario),
  contenido VARCHAR(2000) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_mensajes_canal ON ChatMensajes (id_canal, creado_en);

-- Backfill: cada proyecto existente ya tiene su canal grupal listo.
INSERT INTO ChatCanales (tipo, id_proyecto)
SELECT 'proyecto', id_proyecto FROM Proyectos
ON CONFLICT (id_proyecto) WHERE tipo = 'proyecto' DO NOTHING;
