SELECT 
    u.id_usuario,
    u.nombre,
    u.correo,
    r.nombre_rol
FROM Usuarios u
INNER JOIN Roles r ON u.id_rol = r.id_rol;

-- Ver proyectos con responsable y estado
SELECT 
    p.nombre AS proyecto,
    p.descripcion,
    p.fecha_inicio,
    p.fecha_fin,
    e.nombre_estado AS estado,
    u.nombre AS responsable
FROM Proyectos p
INNER JOIN Estados e ON p.id_estado = e.id_estado
INNER JOIN Usuarios u ON p.id_responsable = u.id_usuario;

-- Ver tareas con proyecto, responsable, prioridad y estado
SELECT 
    t.titulo AS tarea,
    p.nombre AS proyecto,
    u.nombre AS responsable,
    pr.nombre_prioridad AS prioridad,
    e.nombre_estado AS estado,
    t.fecha_limite
FROM Tareas t
INNER JOIN Proyectos p ON t.id_proyecto = p.id_proyecto
INNER JOIN Usuarios u ON t.id_responsable = u.id_usuario
INNER JOIN Prioridades pr ON t.id_prioridad = pr.id_prioridad
INNER JOIN Estados e ON t.id_estado = e.id_estado;

-- Contar tareas por estado
SELECT 
    e.nombre_estado,
    COUNT(t.id_tarea) AS total_tareas
FROM Estados e
LEFT JOIN Tareas t ON e.id_estado = t.id_estado
GROUP BY e.nombre_estado;

-- Contar tareas por prioridad
SELECT 
    p.nombre_prioridad,
    COUNT(t.id_tarea) AS total_tareas
FROM Prioridades p
LEFT JOIN Tareas t ON p.id_prioridad = t.id_prioridad
GROUP BY p.nombre_prioridad;

-- Porcentaje de avance por proyecto
SELECT 
    p.nombre AS proyecto,
    COUNT(t.id_tarea) AS total_tareas,
    SUM(CASE WHEN e.nombre_estado = 'Finalizado' THEN 1 ELSE 0 END) AS tareas_finalizadas,
    CAST(
        SUM(CASE WHEN e.nombre_estado = 'Finalizado' THEN 1 ELSE 0 END) * 100.0 
        / COUNT(t.id_tarea) 
        AS DECIMAL(5,2)
    ) AS porcentaje_avance
FROM Proyectos p
INNER JOIN Tareas t ON p.id_proyecto = t.id_proyecto
INNER JOIN Estados e ON t.id_estado = e.id_estado
GROUP BY p.nombre;