-- Fase 5: asistente de IA — reutiliza la tabla Reportes existente en vez de
-- crear una tabla nueva; solo distingue quién lo escribió.

ALTER TABLE Reportes ADD COLUMN IF NOT EXISTS origen VARCHAR(10) NOT NULL DEFAULT 'manual';
ALTER TABLE Reportes DROP CONSTRAINT IF EXISTS reportes_origen_check;
ALTER TABLE Reportes ADD CONSTRAINT reportes_origen_check CHECK (origen IN ('manual', 'ia'));

-- Un reporte redactado por IA es un párrafo, no una línea corta — el
-- VARCHAR(255) original se quedaba corto para eso.
ALTER TABLE Reportes ALTER COLUMN descripcion TYPE VARCHAR(2000);
