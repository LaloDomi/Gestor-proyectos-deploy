CREATE DATABASE GestorProyectos;
GO

USE GestorProyectos;
GO

CREATE TABLE Roles (
    id_rol INT IDENTITY(1,1) PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL
);

CREATE TABLE Estados (
    id_estado INT IDENTITY(1,1) PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL
);

CREATE TABLE Prioridades (
    id_prioridad INT IDENTITY(1,1) PRIMARY KEY,
    nombre_prioridad VARCHAR(50) NOT NULL
);

CREATE TABLE Usuarios (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(100) NOT NULL,
    id_rol INT NOT NULL,
    fecha_registro DATE DEFAULT GETDATE(),
    FOREIGN KEY (id_rol) REFERENCES Roles(id_rol)
);

CREATE TABLE Proyectos (
    id_proyecto INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    id_estado INT NOT NULL,
    id_responsable INT NOT NULL,
    FOREIGN KEY (id_estado) REFERENCES Estados(id_estado),
    FOREIGN KEY (id_responsable) REFERENCES Usuarios(id_usuario)
);

CREATE TABLE Tareas (
    id_tarea INT IDENTITY(1,1) PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    fecha_inicio DATE NOT NULL,
    fecha_limite DATE NOT NULL,
    id_prioridad INT NOT NULL,
    id_estado INT NOT NULL,
    id_proyecto INT NOT NULL,
    id_responsable INT NOT NULL,
    FOREIGN KEY (id_prioridad) REFERENCES Prioridades(id_prioridad),
    FOREIGN KEY (id_estado) REFERENCES Estados(id_estado),
    FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto),
    FOREIGN KEY (id_responsable) REFERENCES Usuarios(id_usuario)
);

CREATE TABLE Calendario (
    id_evento INT IDENTITY(1,1) PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    id_proyecto INT,
    id_tarea INT,
    FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto),
    FOREIGN KEY (id_tarea) REFERENCES Tareas(id_tarea)
);

CREATE TABLE Reportes (
    id_reporte INT IDENTITY(1,1) PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    fecha_generacion DATE DEFAULT GETDATE(),
    id_proyecto INT NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_proyecto) REFERENCES Proyectos(id_proyecto),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);