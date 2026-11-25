# RecoAgua · Back-end (API)

API REST de **RecoAgua**, el *Sistema de Gestión para la Recolección de Agua en Hogares de Cali,
Valle del Cauca*. RecoAgua es una plataforma web educativa que orienta a los hogares en el
aprovechamiento de agua lluvia para usos no potables. Ofrece guías interactivas, una calculadora
hídrica, un mapa de zonas de Cali y retos con insignias.

Este repositorio forma parte del trabajo de grado para optar al título de Ingeniero de Sistemas
en la **Institución Universitaria Antonio José Camacho (UNIAJC)**, Facultad de Ingenierías (2026).

| | |
| --- | --- |
| **Autores** | Ismael Yate Calderón · Juan Daniel Peñaloza Brito |
| **Directora** | Beatriz Eugenia Marín Ospina (Grupo de Investigación GRINTIC) |
| **Aplicación** | <https://recoagua.com> |
| **Front-end** | [DanielPenalozaB/recoagua-fe](https://github.com/DanielPenalozaB/recoagua-fe) |

## Tecnologías

NestJS 11 · TypeScript · TypeORM · PostgreSQL 15 · JWT · Swagger (OpenAPI) · Resend (correo) ·
Docker · GitHub Actions + Coolify.

## Ejecución local

Requisitos: Node.js ≥ 20.9, npm, Docker y Docker Compose.

```bash
git clone https://github.com/DanielPenalozaB/recoagua-be.git
cd recoagua-be
npm install
cp template.env .env              # completar los valores (ver Manual Técnico, sección 5.1)
docker compose up -d postgres     # PostgreSQL 15 en el puerto 5432
npm run migration:run             # esquema y datos semilla
npm run start:dev
```

- API: <http://localhost:4000>
- Documentación Swagger: <http://localhost:4000/api>

## Scripts principales

| Comando | Descripción |
| --- | --- |
| `npm run start:dev` | Servidor en modo desarrollo (watch) |
| `npm run build` / `npm run start:prod` | Compilación y ejecución en producción |
| `npm run migration:run` / `migration:revert` | Aplicar o revertir migraciones |
| `npm run test` / `test:e2e` / `test:cov` | Pruebas unitarias, E2E y cobertura |
| `npm run lint` / `npm run format` | ESLint y Prettier |

## Estructura

```
src/
├── configs/              # DataSource de TypeORM
├── database/migrations/  # Esquema y datos semilla
├── common/               # Filtros, interceptores, pipes y DTOs compartidos
├── auth/                 # Autenticación JWT y roles
└── users/, guides/, modules/, blocks/, challenges/, badges/, zone/, …  # Módulos de dominio
```

## Despliegue

Cada *push* a `master` ejecuta `.github/workflows/deploy.yml`, que construye la imagen
`ghcr.io/danielpenalozab/recoagua-be:latest`, la publica en GitHub Container Registry y notifica
a Coolify para desplegarla.

## Documentación

Los detalles de arquitectura, variables de entorno, migraciones, Docker y CI/CD están en el
**Manual Técnico de Implementación**, entregado con el trabajo de grado.
