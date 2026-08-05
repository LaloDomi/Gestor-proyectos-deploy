-- Fase 2: notificaciones reales del servidor + verificación de correo.

ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS token_verificacion VARCHAR(128);
ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS token_verificacion_expira TIMESTAMP;

CREATE TABLE IF NOT EXISTS Notificaciones (
  id_notificacion SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  tipo VARCHAR(30) NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  mensaje VARCHAR(500),
  enlace VARCHAR(255),
  leida BOOLEAN NOT NULL DEFAULT FALSE,
  id_proyecto INT REFERENCES Proyectos(id_proyecto) ON DELETE CASCADE,
  referencia_tipo VARCHAR(30),
  referencia_id INT,
  creada_en TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_notif_dedupe
  ON Notificaciones (id_usuario, tipo, referencia_tipo, referencia_id)
  WHERE referencia_tipo IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_notif_usuario ON Notificaciones (id_usuario, creada_en DESC);
