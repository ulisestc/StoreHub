# StoreHub

Sistema de gestión de inventario y punto de venta desarrollado con Angular para la administración integral de negocios retail.

## Descripción

StoreHub es una aplicación web completa que permite la gestión de productos, categorías, clientes, inventario, ventas y generación de reportes. El sistema incluye autenticación de usuarios con roles diferenciados (Administrador y Cajero) y proporciona una interfaz moderna construida con Angular Material.

## Requisitos Previos

Antes de ejecutar la aplicación, asegúrese de tener instaladas las siguientes herramientas:

- **Node.js**: versión 18.x o superior
- **npm**: versión 9.x o superior (incluido con Node.js)
- **Angular CLI**: versión 19.2.17

Para verificar las versiones instaladas:

```bash
node --version
npm --version
ng --version
```

## Versiones de Tecnologías

### Framework Principal
- **Angular**: 19.2.0
- **Angular Material**: 19.2.19
- **Angular CDK**: 19.2.19

### Dependencias de Producción
- **RxJS**: 7.8.0
- **TypeScript**: 5.7.2
- **Zone.js**: 0.15.0

### Herramientas de Desarrollo
- **Angular CLI**: 19.2.17
- **Karma**: 6.4.0
- **Jasmine**: 5.6.0

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/ulisestc/StoreHub.git
cd StoreHub
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Modifique los archivos en `src/environments/` según su entorno:

**Desarrollo (`environment.ts`):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

**Producción (`environment.prod.ts`):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://storehub-backend-xhr1.onrender.com/api'
};
```

## Ejecución del Proyecto

### Modo Desarrollo

```bash
npm start
```

O alternativamente:

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

### Compilación para Producción

```bash
npm run build
```

Los archivos compilados se generarán en `dist/store-hub/`

### Ejecutar Pruebas

```bash
npm test
```

## Funcionalidades Principales

### Módulos del Sistema

1. **Dashboard**: Métricas clave (ventas del día, transacciones, productos totales, alertas de stock)

2. **Gestión de Categorías**: Crear, editar, eliminar y listar categorías con paginación

3. **Gestión de Productos**: Administración completa del catálogo con SKU, precios, control de stock y paginación

4. **Gestión de Clientes**: Registro y administración de clientes con creación rápida desde POS

5. **Control de Inventario**: Movimientos de inventario (entradas, salidas, mermas) con historial paginado

6. **Punto de Venta (POS)**: Procesamiento de ventas con búsqueda, filtrado y paginación de productos

7. **Historial de Ventas**: Consulta de transacciones con detalles completos y paginación

8. **Reportes**: Análisis de ventas por período, productos más vendidos y alertas de stock

9. **Perfil de Usuario**: Gestión de información personal y cambio de contraseña

### Características Técnicas

- **Componentes Standalone**: Arquitectura moderna de Angular sin NgModules
- **Paginación Backend**: Optimización con paginación del lado del servidor
- **Material Design**: Interfaz consistente con Angular Material
- **Diseño Responsivo**: Adaptable a diferentes tamaños de pantalla
- **Seguridad**: Autenticación JWT, control de acceso por roles, guards e interceptors

## Backend Requerido

Esta aplicación frontend requiere un backend Django REST Framework con los siguientes endpoints:

- `/api/auth/login/` - Autenticación
- `/api/categories/` - CRUD de categorías
- `/api/products/` - CRUD de productos
- `/api/clients/` - CRUD de clientes
- `/api/inventory/` - Movimientos de inventario
- `/api/sales/` - Ventas
- `/api/reports/` - Reportes

El backend debe soportar paginación con parámetros `page` y `page_size`.

## Solución de Problemas

### Error: "ng: command not found"

```bash
npm install -g @angular/cli
```

### Error: "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Puerto 4200 en uso

```bash
ng serve --port 4300
```

## Autor

Universidad - Desarrollo de Sitios Web

## Información de Versión

- **Versión del Proyecto**: 1.0
- **Última Actualización**: Diciembre 2025
- **Angular Version**: 19.2.0
