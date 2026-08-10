USE GestorProyectos;
GO

INSERT INTO Roles (nombre_rol) VALUES
('Administrador'),
('Lider de Proyecto'),
('Colaborador');

INSERT INTO Estados (nombre_estado) VALUES
('Pendiente'),
('En proceso'),
('Finalizado'),
('Cancelado');

INSERT INTO Prioridades (nombre_prioridad) VALUES
('Baja'),
('Media'),
('Alta'),
('Urgente');

INSERT INTO Usuarios (nombre, correo, contrasena, id_rol) VALUES
('Jazmin Cuamani', 'jazmin@gmail.com', '1234', 1),
('Eduardo Dominguez', 'edud@gmail.com', '1234', 2),
('Leo Lopez', 'leo@gmail.com', '1234', 3),
('Aldo Martinez', 'aldo@gmail.com', '1234', 3),
('Roberto Lancho', 'robert@gmail.com', '1234', 3),
('Emiliano Ruiz', 'emiliano@gmail.com', '1234', 2);

INSERT INTO Proyectos (nombre, descripcion, fecha_inicio, fecha_fin, id_estado, id_responsable) VALUES
('Sistema de Inventario', 'Control de productos y stock', '2026-06-01', '2026-07-15', 2, 2),
('Pagina Web Escolar', 'Sitio web para gestion academica', '2026-06-10', '2026-08-01', 1, 6),
('App de Tareas', 'Aplicacion para administrar actividades', '2026-06-20', '2026-07-30', 2, 2);

INSERT INTO Tareas (titulo, descripcion, fecha_inicio, fecha_limite, id_prioridad, id_estado, id_proyecto, id_responsable) VALUES
('Crear login', 'Diseñar inicio de sesion', '2026-06-01', '2026-06-05', 3, 3, 1, 3),
('Diseñar base de datos', 'Crear tablas y relaciones', '2026-06-02', '2026-06-08', 4, 2, 1, 1),
('Crear dashboard', 'Mostrar estadisticas generales', '2026-06-06', '2026-06-15', 3, 1, 1, 4),
('Diseñar interfaz principal', 'Crear pantalla de inicio', '2026-06-10', '2026-06-18', 2, 2, 2, 5),
('Crear modulo de proyectos', 'CRUD de proyectos', '2026-06-20', '2026-06-28', 3, 1, 3, 3),
('Crear modulo de tareas', 'CRUD de tareas y asignaciones', '2026-06-21', '2026-07-05', 4, 1, 3, 4);

INSERT INTO Calendario (titulo, descripcion, fecha, hora, id_proyecto, id_tarea) VALUES
('Entrega de login', 'Revision del modulo de inicio de sesion', '2026-06-05', '10:00', 1, 1),
('Revision de base de datos', 'Validar tablas y relaciones', '2026-06-08', '12:00', 1, 2),
('Avance del dashboard', 'Mostrar progreso del panel estadistico', '2026-06-15', '09:30', 1, 3),
('Entrega de interfaz', 'Revision de diseno principal', '2026-06-18', '11:00', 2, 4);

INSERT INTO Reportes (titulo, descripcion, id_proyecto, id_usuario) VALUES
('Reporte de avance inventario', 'El proyecto tiene avances en login y base de datos', 1, 2),
('Reporte de tareas pendientes', 'Existen tareas pendientes del dashboard', 1, 1),
('Reporte pagina web escolar', 'Se comenzo el diseño de la interfaz', 2, 6);
