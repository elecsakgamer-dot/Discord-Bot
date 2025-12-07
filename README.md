# Bot de Discord - Formulario de Admisión

Bot de Discord para gestionar formularios de admisión con modales de 2 pasos, tickets y comandos slash.

## Características

- ✅ Formulario interactivo (2 pasos) con modales
- ✅ Sistema de tickets con prefijo `!`
- ✅ Comandos slash (`/formulario`, `/listforms`)
- ✅ Persistencia de formularios en JSON
- ✅ Paginación de resultados

## Instalación Local

```bash
npm install
```

## Configuración (.env)

Crear archivo `.env` en la raíz del proyecto:

```
DISCORD_TOKEN=tu_token_aqui
CLIENT_ID=tu_client_id_aqui
FORM_RESULTS_CHANNEL=1446760324144300042
TICKET_CATEGORY_ID=tu_categoria_id
TICKET_ROLE_ID=tu_rol_id
PREFIX=!
```

## Ejecución Local

```bash
npm start
```

## Deploy en Railway

1. Crear repositorio en GitHub
2. Push a GitHub
3. Conectar en Railway
4. Configurar variables de entorno
5. Deploy automático

## Comandos

- `/formulario` - Mostrar botón para abrir formulario
- `/listforms` - Listar formularios con paginación
- `!palabra` - Crear ticket (ej: `!soporte`)
- `!cerrar` - Cerrar ticket

## Archivos Importantes

- `index.js` - Bot principal
- `commands/slash/` - Comandos slash
- `commands/prefix/` - Comandos por prefijo
- `data/forms.json` - Almacenamiento de formularios
