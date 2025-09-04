# Formulario Embajadores (React + Vite + TS)

Multi-step form (estilo Google Forms) con validación, campos condicionales y selects dependientes.

## Características
- 3 secciones, navegación bloqueada hasta completar la anterior.
- Validación con Zod + react-hook-form (mensajes en español).
- Selects dependientes: Región → Provincia → Distrito y DRE → UGEL.
- Campos condicionales por perfil del embajador (DRE/GRE, UGEL, IIEE).
- Nivel educativo → Grado dinámico.

## Ejecutar
```pwsh
npm install
npm run dev
```
Abrir: http://localhost:5173

Build de producción:
```pwsh
npm run build
npm run preview
```

## Estructura clave
- src/App.tsx: orquesta los pasos y el envío final.
- src/components/Section1.tsx: datos del embajador, región/provincia/distrito; perfil con campos condicionales; DRE→UGEL.
- src/components/Section2.tsx: datos de réplica; DRE→UGEL.
- src/components/Section3.tsx: datos del participante; nivel→grado.
- src/types.ts: esquemas Zod y opciones comunes.
- src/data.ts: catálogos de ejemplo para región/provincia/distrito/DRE/UGEL.
- src/styles.css: estilos básicos.

## Personalizar
- Reemplazar catálogos en src/data.ts o consumir una API.
- Ajustar validaciones en src/types.ts (Zod).
- Conectar envío final a su backend en src/App.tsx (reemplazar alert/console.log).

## Notas
- Los datos de catálogos son de ejemplo. Si dispone de fuentes oficiales, podemos integrarlas.
