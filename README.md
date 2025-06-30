# Hermes API

API inteligente para el chatbot de Hermes, startup especializada en desarrollo web, IA y automatizaciones.

## 🏗️ Arquitectura

```
Cliente → Next.js API Routes → Supabase + OpenAI → Respuesta inteligente
```

### Stack Tecnológico

- **Framework:** Next.js 14 con App Router
- **Base de datos:** Supabase (PostgreSQL + Vectores)
- **IA:** OpenAI GPT-4o-mini + text-embedding-3-small
- **Lenguaje:** TypeScript
- **Deploy:** Vercel

## 📁 Estructura del Proyecto

```
hermes-api/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts          # Endpoint principal del chatbot
│   ├── lib/
│   │   ├── supabase.ts              # Cliente y tipos de Supabase
│   │   └── openai.ts                # Cliente OpenAI + funciones auxiliares
│   └── utils/
├── .env.local                       # Variables de entorno (desarrollo)
├── package.json
└── README.md
```

## 🗄️ Base de Datos (Supabase)

### Tablas

#### `conversations`

Historial completo de conversaciones del chatbot.

| Campo             | Tipo      | Descripción                                       |
| ----------------- | --------- | ------------------------------------------------- |
| `id`              | uuid      | ID único de cada intercambio                      |
| `conversation_id` | uuid      | ID para agrupar mensajes de la misma conversación |
| `user_message`    | text      | Mensaje del usuario                               |
| `bot_response`    | text      | Respuesta del chatbot                             |
| `user_ip`         | text      | IP del usuario (opcional)                         |
| `intent`          | text      | Intención detectada (pendiente implementar)       |
| `lead_score`      | integer   | Puntuación del lead (0-100)                       |
| `created_at`      | timestamp | Momento de la conversación                        |

#### `knowledge_base`

Base de conocimiento con información de Hermes en formato vectorial.

| Campo        | Tipo         | Descripción                                      |
| ------------ | ------------ | ------------------------------------------------ |
| `id`         | uuid         | ID único                                         |
| `title`      | text         | Título del contenido                             |
| `content`    | text         | Contenido completo                               |
| `category`   | text         | Categoría (servicios, faq, proceso, etc.)        |
| `embedding`  | vector(1536) | Representación vectorial para búsqueda semántica |
| `metadata`   | jsonb        | Metadatos adicionales                            |
| `created_at` | timestamp    | Fecha de creación                                |

#### `leads`

Información de prospectos capturados (preparado para futuras mejoras).

| Campo           | Tipo      | Descripción                   |
| --------------- | --------- | ----------------------------- |
| `id`            | uuid      | ID único                      |
| `name`          | text      | Nombre del prospecto          |
| `email`         | text      | Email de contacto             |
| `phone`         | text      | Teléfono                      |
| `business_type` | text      | Tipo de negocio               |
| `needs`         | text      | Necesidades específicas       |
| `intent`        | text      | Servicio de interés           |
| `lead_score`    | integer   | Puntuación (0-100)            |
| `status`        | text      | Estado (new, contacted, etc.) |
| `created_at`    | timestamp | Fecha de creación             |

### Funciones SQL

#### `search_similar_content()`

Función personalizada para búsqueda semántica usando vectores.

```sql
search_similar_content(
  query_embedding vector(1536),  -- Vector de la pregunta
  match_threshold float,          -- Umbral de similitud (ej: 0.7)
  match_count int                 -- Máximo resultados (ej: 3)
)
```

**Retorna:** Contenido más relevante basado en similitud semántica.

## 🔧 API Endpoints

### POST `/api/chat`

Endpoint principal para el chatbot conversacional.

#### Request Body

```json
{
  "message": "Necesito una página web para mi restaurant",
  "userIp": "127.0.0.1",
  "conversationId": "uuid-opcional"
}
```

#### Response

```json
{
  "response": "¡Perfecto! Para tu restaurant recomiendo...",
  "conversationId": "uuid-de-la-conversacion",
  "success": true
}
```

#### Flujo Interno

1. **Validación:** Verificar que el mensaje no esté vacío
2. **Memoria:** Buscar historial si existe `conversationId`
3. **Embedding:** Convertir pregunta a vector con OpenAI
4. **Búsqueda:** Encontrar contenido relevante en `knowledge_base`
5. **Contexto:** Combinar conocimiento + historial de conversación
6. **IA:** Generar respuesta con OpenAI usando contexto completo
7. **Persistencia:** Guardar intercambio en `conversations`
8. **Respuesta:** Retornar respuesta + `conversationId`

## 🧠 Sistema de IA

### Embeddings

- **Modelo:** `text-embedding-3-small`
- **Dimensiones:** 1536
- **Uso:** Búsqueda semántica en knowledge base

### Chat Completion

- **Modelo:** `gpt-4o-mini`
- **Temperature:** 0.3 (más determinístico)
- **Max tokens:** 500
- **Sistema:** Prompt especializado en servicios de Hermes

### Prompt Engineering

El system prompt está optimizado para:

- **Servicios específicos:** Solo mencionar lo que realmente ofrecemos
- **Precios claros:** Incluir rangos de precios cuando es relevante
- **Conversacional:** Tono amigable pero profesional
- **Memoria:** Referenciar conversaciones anteriores
- **No inventar:** Evitar "alucinaciones" sobre servicios inexistentes

## 🔐 Variables de Entorno

### Desarrollo (`.env.local`)

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
OPENAI_API_KEY=sk-proj-...
```

### Producción (Vercel)

Las mismas variables configuradas en el dashboard de Vercel.

## 🚀 Instalación y Desarrollo

### Requisitos

- Node.js 18+
- npm o yarn
- Cuenta Supabase
- API Key de OpenAI

### Setup Local

1. **Clonar repo:**

```bash
git clone [repo-url]
cd hermes-api
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar variables:**

```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

4. **Iniciar desarrollo:**

```bash
npm run dev
```

### Testing

#### Test de conexión:

```bash
curl http://localhost:3000/api/chat
```

#### Test de conversación:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hola, necesito una página web",
    "userIp": "127.0.0.1"
  }'
```

## 📊 Monitoreo y Logs

### Logs Importantes

- Errores de conexión a Supabase
- Errores de OpenAI API
- Búsquedas sin resultados en knowledge base
- Conversaciones guardadas correctamente

### Métricas a Monitorear

- Tiempo de respuesta del endpoint
- Cantidad de conversaciones por día
- Errores en búsqueda semántica
- Costos de OpenAI API

## 🔮 Mejoras Futuras (Pre-Producción)

### Críticas

- [ ] Captura automática de email cuando hay interés
- [ ] Detección automática de intent y lead scoring
- [ ] Rate limiting y validación de inputs
- [ ] Dashboard básico de conversaciones

### Opcionales

- [ ] Cache de embeddings frecuentes
- [ ] Análisis de sentimiento
- [ ] Integración directa con CRM
- [ ] Respuestas multimodales (imágenes)

## 🐛 Problemas Conocidos

1. **Memory Leaks:** Con muchas conversaciones largas, revisar limits
2. **Embeddings Cost:** Monitorear costos de OpenAI con alto volumen
3. **Supabase Limits:** Free tier tiene límites de requests/mes

## 🤝 Contribución

1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

---

**Desarrollado por:** Juan Pablo Riglos & Verónica García  
**Startup:** Hermes - Desarrollo Web e IA  
**Ubicación:** La Plata, Buenos Aires, Argentina
