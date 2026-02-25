# Sistema de Evaluación por Secciones (Línea 079)

Aplicación web en **HTML, CSS y JavaScript** con:
- Inicio de sesión fijo (`LINEA079` / `ABOGADO079`).
- Registro de aspirante.
- Examen por secciones con aprobación mínima de **7.00** por sección.
- Bloqueo por reprobación y resultado final con promedio decimal.
- Envío de reporte a Telegram (mensaje + archivo CSV adjunto).
- Botón para cerrar sesión (uso en equipo compartido).

---

## Guía rápida (lo que me pediste: "¿cómo lo descargo y qué cambio?")

## A) Descargar el proyecto

### Opción 1: desde GitHub (recomendada)
1. En tu repositorio privado, pulsa **Code** → copia la URL HTTPS.
2. En tu computadora, abre terminal y ejecuta:

```bash
git clone https://github.com/TU_USUARIO/TU_REPO_PRIVADO.git
cd TU_REPO_PRIVADO
```

### Opción 2: descargar ZIP
1. En GitHub: **Code** → **Download ZIP**.
2. Descomprime el ZIP.
3. Abre la carpeta del proyecto en VS Code.

---

## B) Qué debes cambiar sí o sí

### 1) Preguntas y respuestas correctas
Debes editar `app.js` en el arreglo `sections`.
- Sección 1: `id: "juridico"`
- Sección 2: `id: "ortografia"`
- Sección 3: `id: "habilidades"`
- Sección 4: `id: "escucha"`

Cada pregunta tiene esta forma:

```js
{ text: "Tu pregunta", options: ["A", "B", "C", "D"], answer: "A" }
```

- `text`: enunciado.
- `options`: tus incisos.
- `answer`: inciso correcto (`"A"`, `"B"`, `"C"` o `"D"`).

> Las secciones 5 y 6 ya están como **instrucciones sin puntaje**, tal como solicitaste.

### 2) Si quieres cambiar usuario/contraseña
También en `app.js`, al inicio:

```js
const LOGIN_USER = "LINEA079";
const LOGIN_PASS = "ABOGADO079";
```

### 3) Textos/mensajes en pantalla
Si deseas ajustar redacción, están en `app.js` y `index.html`.

---

## C) Probar en tu computadora

### Requisito
- Node.js 18+ instalado.

### Ejecutar
Desde la raíz del proyecto:

```bash
npx vercel dev
```

Luego abre:
- `http://localhost:3000`

> Usamos `vercel dev` porque así también funciona la ruta backend `/api/send-report`.

---

## D) Configurar Telegram (gratis)

La Bot API de Telegram no tiene costo para este uso.

### 1) Crear bot y obtener token
1. En Telegram abre **@BotFather**.
2. Comando: `/newbot`.
3. Crea nombre y username.
4. Copia el token (ejemplo: `123456:ABC...`).

### 2) Preparar grupo
1. Crea tu grupo de Telegram.
2. Agrega el bot al grupo.
3. Dale permiso para enviar mensajes y archivos.

### 3) Obtener `chat_id`
1. Escribe cualquier mensaje en el grupo.
2. Abre en navegador:

```text
https://api.telegram.org/botTU_TOKEN/getUpdates
```

3. Busca `"chat"` y copia `"id"` del grupo (normalmente inicia con `-100...`).

---

## E) Variables de entorno

### Local (`.env.local`)
Crea archivo `.env.local` en la raíz:

```env
TELEGRAM_BOT_TOKEN=tu_token
TELEGRAM_CHAT_ID=tu_chat_id
```

### En Vercel
1. Proyecto en Vercel → **Settings** → **Environment Variables**.
2. Agrega:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
3. Guarda y redeploy.

---

## F) Subir a GitHub privado

Si todavía no lo subes:

```bash
git init
git add .
git commit -m "Sistema de evaluación por secciones con reporte Telegram"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO_PRIVADO.git
git push -u origin main
```

---

## G) Desplegar en Vercel

1. Entra a [https://vercel.com](https://vercel.com).
2. Importa tu repositorio privado.
3. Framework preset: **Other**.
4. Configura variables (sección E).
5. Deploy.

---

## H) Flujo real del sistema

1. Login.
2. Captura de aspirante.
3. Presenta sección 1.
4. Si sección >= 7.00: avanza y muestra "¡Continúas a la siguiente sección!".
5. Si sección < 7.00: termina con "¡Gracias por tu participación! Puntaje obtenido: ...".
6. Si llega al final: muestra promedio decimal.
7. Botón **Enviar reporte al grupo**:
   - manda mensaje,
   - manda CSV adjunto para Excel en el grupo.
8. Botón **Cerrar sesión** para el siguiente usuario.

---

## Estructura del proyecto

- `index.html`: interfaz principal.
- `style.css`: estilos.
- `app.js`: lógica de login, examen, puntajes y envío.
- `api/send-report.js`: función serverless para enviar mensaje y CSV a Telegram.
