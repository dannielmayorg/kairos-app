@AGENTS.md
@.claude/skills/ui-ux-pro-max/SKILL.md
@.claude/skills/ui-styling/SKILL.md

## Reglas de código — siempre aplican

### Arquitectura
- Nunca importar desde archivos `route.ts` en páginas o componentes. La lógica compartida va en `src/lib/`.
- Los Route Handlers son endpoints HTTP, no librerías. Si dos lugares necesitan la misma lógica, extraerla a `src/lib/` primero.

### Prisma
- Después de cualquier cambio en `prisma/schema.prisma`, correr `npx prisma generate` antes de escribir código que use los nuevos campos.
- Nunca usar type assertions (`as { campo?: tipo }`) para acceder a campos de modelos Prisma — si TypeScript no los reconoce, el cliente está desactualizado: correr `prisma generate`.

### TypeScript
- Nunca usar type assertions para silenciar errores de TypeScript. Resolver la causa raíz.
- Si un tipo no incluye un campo que sí existe en la DB, el problema es `prisma generate`, no el tipo.

### Git
- Al crear un archivo nuevo, verificar con `git status` que está trackeado.
- No dar una feature por terminada si hay archivos relevantes en la sección "Untracked files".

### Verificación al terminar una feature
Antes de declarar cualquier feature completa, correr:
```bash
git status
npx tsc --noEmit
```
Si hay errores de tipos o archivos sin trackear, resolverlos antes de continuar.
