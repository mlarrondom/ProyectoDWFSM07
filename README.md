# CERTIFY – Plataforma de Certificaciones Académicas
## Proyecto Final – Módulo 07  
Bootcamp Desarrollo Web Full Stack

---

# 📑 Índice

1. Introducción  
2. Contexto de Negocio  
3. Prototipo  
4. Arquitectura General  
5. Tecnologías Utilizadas  
6. Context API  
7. Rutas Frontend  
8. Endpoints Backend  
9. Documentación API (Swagger / OpenAPI)  
10. Pasarela de Pago  
11. Despliegue  
12. Cumplimiento de Requisitos M07  
13. Comentarios Finales  

---

# 1. Introducción

Este proyecto fue desarrollado en el marco del **Bootcamp Desarrollo Web Full Stack**, correspondiente al **Módulo 07**, cuyo foco principal es el desarrollo de una aplicación que conecte correctamente **Backend y Frontend**, integrando base de datos, autenticación y despliegue.

El objetivo fue construir una aplicación funcional que implemente:

- Gestión de productos
- Autenticación con JWT
- Integración con pasarela de pago
- Despliegue completo en la nube
- Documentación de API con OpenAPI

---

# 2. Contexto de Negocio

CERTIFY es una plataforma de certificaciones académicas.

El producto principal es la **Certificación**, la cual se compone de:

- Cursos obligatorios
- Cursos electivos
- Un mínimo de créditos requeridos

Cada curso otorga una cantidad de créditos.  
El estudiante debe completar:

1. Todos los cursos obligatorios
2. Cursos electivos hasta alcanzar el mínimo de créditos exigido

Aunque el producto principal es la certificación, el sistema también contempla los cursos como productos individuales dentro del modelo de negocio.

---

## Tipos de Usuario

### 👤 Cliente
- Explorar catálogo
- Ver detalle de certificaciones (requisitos visibles dentro del catálogo)
- Agregar al carrito
- Realizar compra
- Editar perfil
- Ver historial de compras

### 🛠 Administrador
- Crear cursos
- Editar cursos
- Crear certificaciones
- Editar certificaciones
- Gestionar requisitos

---

# 3. Prototipo

El prototipo funcional puede visualizarse en:

📄 https://github.com/mlarrondom/ProyectoDWFSM07/blob/main/Prototipo.pdf

Este documento permitió planificar:

- Estructura de navegación
- Flujo de compra
- Separación de roles
- Experiencia de usuario simplificada

---

# 4. Arquitectura General

El repositorio contiene:
/backend
/frontend


Flujo general:

1. Cliente navega catálogo
2. Agrega certificación al carrito
3. Procede a Checkout
4. Se crea preferencia en Mercado Pago
5. Se registra transacción en MongoDB
6. Compra aparece en el perfil del usuario

---

# 5. Tecnologías Utilizadas

## Frontend
- React + Vite
- React Router DOM
- Context API
- Bootstrap
- Design System propio
- JWT
- Mercado Pago (Sandbox)

## Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JSON Web Token
- Swagger (OpenAPI)

---

# 6. Context API

Se utilizó Context API para manejo global de estado en el frontend:

### CartContext
- Manejo del carrito
- Persistencia en localStorage
- Cálculo de totales
- Limpieza tras compra

### ClientAuthContext
- Manejo de autenticación cliente
- Almacenamiento de JWT
- Protección de rutas

### AuthContext
- Manejo de autenticación administrador
- Protección de mantenedores

---

# 7. Rutas Frontend

| Ruta | Descripción |
|------|------------|
| `/` | Home |
| `/catalog` | Listado de certificaciones |
| `/signup` | Registro cliente |
| `/client/login` | Login cliente |
| `/me` | Perfil cliente |
| `/checkout` | Pasarela de pago |
| `/admin/courses` | Gestión cursos |
| `/admin/certifications` | Gestión certificaciones |

---

# 8. Endpoints Backend

Base URL Producción:

https://certify-backend-5zhb.onrender.com

| Método | Endpoint | Descripción |
|--------|----------|------------|
| GET | `/` | Health check API |
| POST | `/api/auth/login` | Login cliente |
| POST | `/api/user/login` | Login administrador |
| GET | `/api/courses` | Listar cursos |
| POST | `/api/courses` | Crear curso |
| PUT | `/api/courses/:id` | Editar curso |
| DELETE | `/api/courses/:id` | Eliminar curso |
| GET | `/api/certifications` | Listar certificaciones |
| GET | `/api/certifications/:certCode` | Obtener certificación |
| POST | `/api/certifications` | Crear certificación |
| PUT | `/api/certifications/:certCode` | Editar certificación |
| DELETE | `/api/certifications/:certCode` | Eliminar certificación |
| POST | `/api/payments/create-preference` | Crear preferencia Mercado Pago |
| GET | `/api/payments/verify` | Verificar pago |
| GET | `/api/clients/me` | Obtener perfil cliente |
| PUT | `/api/clients/me` | Editar perfil |
| GET | `/api/clients/me/purchases` | Obtener compras |

---

# 9. Documentación API

## Swagger UI
https://certify-backend-5zhb.onrender.com/api-docs

Swagger permite visualizar e interactuar con los endpoints de la API.

## OpenAPI JSON
https://certify-backend-5zhb.onrender.com/openapi.json

Archivo JSON compatible con herramientas externas de documentación y testing.

---

# 10. Pasarela de Pago

Se implementó integración con **Mercado Pago (Sandbox)**.

### Flujo:
1. Crear preferencia
2. Redirigir a Mercado Pago
3. Registrar transacción en MongoDB

### Nota Técnica

En entorno Sandbox existen limitaciones en la redirección automática tras pago aprobado.

Por esta razón se implementó un botón alternativo:

**“Simular pago completado”**

Este botón:
- Redirige a página de éxito
- Vacía el carrito
- Permite demostrar flujo completo de compra

---

# 11. Despliegue

## Frontend (Netlify)
https://proyectom07.netlify.app

## Backend (Render)
https://certify-backend-5zhb.onrender.com

## Base de Datos
MongoDB Atlas

---

# 12. Cumplimiento Requisitos M07

## FRONTEND
✔ Prototipo  
✔ React  
✔ Context API  
✔ Rutas requeridas  
✔ Checkout  

## BACKEND
✔ Express  
✔ Gestión de productos  
✔ JWT  
✔ Documentación Swagger  

## DESPLIEGUE
✔ Frontend público  
✔ Backend público  
✔ MongoDB Atlas  
✔ Documentación OpenAPI  

---

# 13. Comentarios Finales

Proyecto desarrollado de manera individual, con apoyo de ChatGPT como tutor técnico para aclarar dudas, aprender nuevas tecnologías y guiar el desarrollo del proyecto.

Se aplicaron buenas prácticas tanto en backend como en frontend, utilizando ChatGPT como herramienta de apoyo para resolución de dudas técnicas y orientación en la implementación.

Autor: **Mauricio Larrondo**