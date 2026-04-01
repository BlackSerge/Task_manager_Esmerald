# Auditoría Técnica — Task Manager Esmerald

## Fortalezas detectadas

1. **Modularidad razonable por dominio** en backend (`core`, `boards`, `chat`) y frontend (`features/*`).
2. **Separación parcial de responsabilidades** en backend (views/serializers/selectors/services).
3. **Uso de TypeScript** en frontend y cobertura de pruebas en ambos lados.
4. **Soporte real-time** con Channels + Redis para tableros y chat.
5. **Docker Compose** para infraestructura local reproducible (db, redis, backend).

## Puntos de mejora (Refactoring Suggestions)

### A. Arquitectura y diseño

1. **Consolidar arquitectura en capas backend**
   - Actualmente hay buena base, pero persiste lógica de orquestación en views que podría centralizarse más en services (ej. validaciones y manejo uniforme de excepciones de dominio).
   - Propuesta: introducir excepciones de dominio (`DomainError`, `PermissionError`) y un manejador global DRF.

2. **Eliminar código muerto / inconsistente**
   - En `content_service.update_card` se intenta actualizar `is_completed`, atributo que no existe en `Card`.
   - Propuesta: remover campo o incorporarlo formalmente en modelo + migración + serializer + tests.

3. **Normalizar convención de “selectors”**
   - Hay prefetch/select_related en varios niveles (selectors y views), potencialmente redundante.
   - Propuesta: fijar regla: optimización de query exclusivamente en selectors para evitar dispersión.

### B. SOLID, DRY, KISS

4. **Single Responsibility (SRP)**
   - `board.service.ts` concentra mapping complejo + llamadas API + normalización de tipos.
   - Propuesta: mover mappers a `adapters/` o `mappers/` separados.

5. **DRY en mapeos frontend**
   - Repetición de coerciones `Number(...)` para IDs y estructuras anidadas.
   - Propuesta: utilidades genéricas de normalización por entidad.

6. **KISS en configuración de dependencias**
   - Backend mantiene `pyproject.toml` y `requirements.txt` con señales de deriva.
   - Propuesta: definir una única fuente de verdad (Poetry o pip-tools) y generar lock/requirements desde ahí.

### C. Entorno y despliegue

7. **Dockerfile potencialmente desalineado con contexto**
   - Copia `requirements.txt` en raíz, pero el archivo está en `backend/requirements.txt`.
   - Propuesta: ajustar Dockerfile/context para evitar builds frágiles.

8. **Entrada de contenedor no unificada**
   - Existe `backend/entrypoint.sh`, pero `docker-compose.yml` ejecuta comando inline distinto.
   - Propuesta: usar `entrypoint.sh` en compose para estandarizar arranque local/prod.

9. **Gestión de variables de entorno**
   - Carga de `.env` en `BASE_DIR/.env`; en Compose se usa `backend/.env`.
   - Propuesta: documentar ruta única y validar variables críticas al boot.

### D. Datos e integraciones

10. **Modelo de progreso implícito por “última columna”**
    - `completed_cards_count` depende de que la última columna sea “Done”, lo cual puede romperse con reordenamientos.
    - Propuesta: introducir estado explícito de completitud en `Card` o columna tipo `is_done`.

11. **Integraciones externas no claramente activas**
    - Hay dependencias de Cloudinary en backend sin trazabilidad clara en settings/código operativo.
    - Propuesta: remover o integrar formalmente con feature flags por entorno.

12. **Observabilidad y hardening**
    - Logging base correcto, pero sin trazas estructuradas ni correlación de requests.
    - Propuesta: logs JSON + request-id + métricas de latencia y errores por endpoint.

## Priorización sugerida (90 días)

- **Sprint 1:** corregir inconsistencias de modelo (`is_completed`), unificar dependencias, endurecer Docker.
- **Sprint 2:** refactor mappers frontend y policy única de selectors.
- **Sprint 3:** observabilidad, CI/CD completo y pruebas de integración end-to-end críticas.
