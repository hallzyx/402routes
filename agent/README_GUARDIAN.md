# 🤖 AI Budget Guardian

Agente inteligente para monitoreo y optimización de gastos en APIs para 402Routes.

## 🎯 Características

- **Monitoreo Automático**: Rastrea gastos en tiempo real de todas las APIs (OpenAI, Deepseek, etc.)
- **Alertas Inteligentes**: Notificaciones proactivas al 80%, 95% y 100% del presupuesto
- **Detección de Anomalías**: Identifica patrones inusuales y previene bill shock
- **Optimizaciones con IA**: Sugiere alternativas más económicas automáticamente
- **Reportes Mensuales**: Análisis detallado de gastos con proyecciones
- **Soporte Multi-Provider**: Compatible con OpenAI y Deepseek

## 🚀 Quick Start

### 1. Instalación

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno (Windows)
venv\Scripts\activate

# Activar entorno (Linux/Mac)
source venv/bin/activate

# Instalar dependencias
pip install -e .
```

### 2. Configuración

```bash
# Copiar ejemplo de configuración
cp .env.example .env

# Editar .env con tus API keys
# OPENAI_API_KEY=sk-...
# o
# DEEPSEEK_API_KEY=...
```

### 3. Ejecutar

```bash
# Iniciar el agente
python main.py
```

El agente estará disponible en `http://localhost:8000`

## 📚 API Endpoints

### Budget Configuration

**POST** `/api/budget/config`
```json
{
  "user_address": "0x...",
  "monthly_limit": 100.0,
  "warning_threshold": 0.8,
  "pause_threshold": 1.0
}
```

**GET** `/api/budget/status/{user_address}`
Retorna el estado actual del presupuesto.

### Usage Recording

**POST** `/api/usage/record`
```json
{
  "user_address": "0x...",
  "api_id": "openai-gpt4",
  "api_name": "OpenAI GPT-4",
  "provider": "openai",
  "cost": 0.02,
  "tokens_used": 500
}
```

### Alerts

**GET** `/api/alerts/{user_address}?unread_only=true`
Obtiene alertas del usuario.

**POST** `/api/alerts/{alert_id}/mark-read`
Marca alerta como leída.

### Optimizations

**GET** `/api/optimizations/{user_address}`
Obtiene sugerencias de optimización.

**POST** `/api/optimizations/{optimization_id}/apply`
Aplica una optimización.

### AI Analysis

**POST** `/api/analyze`
```json
{
  "user_address": "0x...",
  "time_window_hours": 24,
  "include_recommendations": true
}
```

### Reports

**GET** `/api/report/{user_address}/monthly`
Genera reporte mensual.

## 🧠 AI Provider

El agente soporta dos proveedores de IA:

### OpenAI
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
```

### Deepseek
```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=...
DEEPSEEK_MODEL=deepseek-chat
```

## 🔧 Desarrollo

### Estructura del Proyecto

```
agent/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuración
│   ├── database.py          # Modelos SQLAlchemy
│   ├── schemas.py           # Pydantic schemas
│   ├── guardian_service.py  # Lógica de negocio
│   └── ai_analyzer.py       # Análisis con IA
├── main.py                  # Entry point
├── pyproject.toml
├── .env.example
└── README.md
```

### Tests

```bash
# Instalar dependencias de desarrollo
pip install -e ".[dev]"

# Ejecutar tests
pytest

# Con coverage
pytest --cov=app
```

## 🔄 Integración con Backend

El agente se integra con el backend de 402Routes:

1. **Backend registra uso**: Cada vez que un usuario usa una API, el backend llama a `/api/usage/record`
2. **Agente monitorea**: El agente chequea presupuesto y patrones
3. **Alertas automáticas**: Si detecta problemas, crea alertas
4. **Frontend muestra**: El frontend consulta `/api/budget/status` y `/api/alerts`

## 📊 Base de Datos

El agente usa SQLite por defecto. Para producción, cambiar a PostgreSQL:

```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/guardian
```

### Modelos

- `BudgetConfig`: Configuración de presupuesto por usuario
- `ApiUsage`: Registro de uso de APIs
- `BudgetAlert`: Alertas generadas
- `Optimization`: Sugerencias de optimización
- `MonthlyReport`: Reportes mensuales

## 🛡️ Seguridad

- Las API keys nunca se exponen en respuestas
- Los webhooks usan firmas HMAC
- Rate limiting en endpoints críticos
- Validación de direcciones wallet

## 📈 Monitoreo

El agente expone métricas en `/health`:

```json
{
  "status": "healthy",
  "ai_provider": "openai",
  "database": "connected",
  "backend_url": "http://localhost:8787"
}
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Abre un Pull Request

## 📝 Licencia

MIT
