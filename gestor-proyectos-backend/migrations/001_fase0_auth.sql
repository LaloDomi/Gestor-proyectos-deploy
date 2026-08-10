-- Fase 0: autenticación real (JWT + bcrypt) y roles con código estable.
-- Ejecutado directo contra Supabase Postgres (BaseDatos/Crearbase.sql está en
-- sintaxis T-SQL y desactualizado frente al esquema real, no se usa aquí).

ALTER TABLE Roles ADD COLUMN IF NOT EXISTS codigo VARCHAR(30) UNIQUE;

UPDATE Roles SET codigo = 'ADMIN' WHERE nombre_rol = 'Administrador' AND codigo IS NULL;
-- Ojo: el dato sembrado en Insertardatos.sql es "Lider de Proyecto" (sin tilde).
UPDATE Roles SET codigo = 'LIDER' WHERE nombre_rol IN ('Lider de Proyecto', 'Líder de Proyecto') AND codigo IS NULL;
UPDATE Roles SET codigo = 'COLABORADOR' WHERE nombre_rol = 'Colaborador' AND codigo IS NULL;

ALTER TABLE Usuarios ALTER COLUMN contrasena TYPE VARCHAR(255);
ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS correo_verificado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS estado_cuenta VARCHAR(20) NOT NULL DEFAULT 'activo';

ALTER TABLE Usuarios DROP CONSTRAINT IF EXISTS usuarios_estado_cuenta_check;
ALTER TABLE Usuarios ADD CONSTRAINT usuarios_estado_cuenta_check
  CHECK (estado_cuenta IN ('activo', 'suspendido'));
