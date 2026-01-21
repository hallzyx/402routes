# 🤖 AI Budget Guardian - 402Routes

## 🎯 Descripción

El **AI Budget Guardian** es un agente inteligente que monitorea y optimiza automáticamente el gasto en APIs para 402Routes. Implementa el userflow_3 completo, proporcionando:

- ✅ **Monitoreo automático 24/7** de todas las APIs (OpenAI, Deepseek, etc.)
- ✅ **Alertas inteligentes** al 80%, 95% y 100% del presupuesto
- ✅ **Detección de anomalías** con IA para prevenir bill shock
- ✅ **Optimizaciones automáticas** sugeridas por IA
- ✅ **Reportes mensuales** detallados con análisis
- ✅ **Soporte multi-provider** (OpenAI y Deepseek)

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│                       Frontend                            │
│         (Next.js - Dashboard & Configuración)            │
└─────────────────┬────────────────────────────────────────┘
                  │
                  │ HTTP/REST
                  ▼
┌──────────────────────────────────────────────────────────┐
│                       Backend                             │
│         (Express - API Gateway & Marketplace)            │
└─────────────────┬────────────────────────────────────────┘
                  │
                  │ HTTP/REST
                  ▼
┌──────────────────────────────────────────────────────────┐
│                    AI Budget Guardian                     │
│           (FastAPI - Agent con IA integrada)             │
├──────────────────────────────────────────────────────────┤
│  • Budget Monitoring      • Pattern Detection            │
│  • AI Analysis           • Alert Generation              │
│  • Optimization Engine   • Report Generation             │
└─────────────────┬────────────────────────────────────────┘
                  │
       ┌──────────┴──────────┐
       │                     │
       ▼                     ▼
┌─────────────┐      ┌─────────────┐
│   SQLite    │      │  OpenAI/    │
│  Database   │      │  Deepseek   │
└─────────────┘      └─────────────┘
```

## 🚀 Quick Start

### Prerrequisitos

- Python 3.10+
- Node.js 18+
- npm o bun
- OpenAI API Key o Deepseek API Key

### 1. Instalación del Agent

```bash
cd 402routes/agent

# Crear entorno virtual
python -m venv venv

# Activar entorno
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -e .

# Configurar environment
cp .env.example .env
# Editar .env con tu API key
```

### 2. Instalación del Backend

```bash
cd 402routes/backend

# Instalar dependencias
npm install

# Configurar environment
cp .env.example .env
# Asegurar que GUARDIAN_URL=http://localhost:8000
```

### 3. Instalación del Frontend

```bash
cd 402routes/frontend

# Instalar dependencias
npm install

# El frontend se conecta al backend automáticamente
```

### 4. Ejecutar Todo

```bash
# Terminal 1: Agent
cd 402routes/agent
python main.py

# Terminal 2: Backend
cd 402routes/backend
npm run dev

# Terminal 3: Frontend
cd 402routes/frontend
npm run dev
```

Abrir: http://localhost:3000/guardian/setup

## 📱 Flujo de Usuario

### Setup (2 minutos)

1. **Conectar Wallet**
   - Usuario conecta su wallet Cronos

2. **Configurar Presupuesto**
   - Ir a `/guardian/setup`
   - Establecer límite mensual (ej: $100)
   - Configurar umbrales de alerta (80%, 100%)
   - Activar Guardian

### Uso Diario (Automático)

El Guardian trabaja invisiblemente:

```
Usuario usa APIs → Backend registra → Agent monitorea
                                         ↓
                                    ¿Alerta?
                                    ↙     ↘
                                 Sí       No
                                 ↓        ↓
                           Notificar   Continuar
```

### Ejemplo Real (Del Userflow_3)

**Día 16 - Momento Mágico ⭐**

```
┌─────────────────────────────────────────┐
│  🚨 Tu AI Guardian detectó algo         │
├─────────────────────────────────────────┤
│  Usaste 78% de tu presupuesto pero     │
│  quedan 14 días del mes.                │
│                                         │
│  🔍 Análisis:                           │
│  • OpenAI GPT-4: $45 (57% del gasto)   │
│  • 80% fueron respuestas simples       │
│                                         │
│  💡 Recomendación:                      │
│  Cambia a GPT-3.5-turbo para queries   │
│  simples → Ahorra ~$25/mes             │
│                                         │
│  [Aplicar Optimización Automática]     │
└─────────────────────────────────────────┘
```

**Día 28 - Prevención de Desastre**

```
┌─────────────────────────────────────────┐
│  ⚠️ PAUSA AUTOMÁTICA ACTIVADA           │
├─────────────────────────────────────────┤
│  Detecté patrón inusual:                │
│  • 500 llamadas en 2 minutos            │
│  • Costo proyectado: $95               │
│  • Excedería presupuesto               │
│                                         │
│  ✋ Pausé llamadas automáticamente      │
│                                         │
│  ¿Es intencional?                       │
│  [Sí, aumenta límite] [No, fix bug]    │
└─────────────────────────────────────────┘
```

## 🎨 Componentes Frontend

### Dashboard Principal (`/guardian`)

- **Budget Status Card**: Progreso visual del presupuesto
- **Recent Alerts**: Últimas 5 alertas del Guardian
- **Optimizations**: Sugerencias de ahorro con IA
- **Quick Actions**: Acciones rápidas (reportes, análisis)

### Setup Page (`/guardian/setup`)

- **Budget Configuration**: Límite mensual
- **Alert Thresholds**: Umbrales personalizables
- **Preview**: Vista previa de alertas

### Notificaciones Flotantes

- **Real-time Alerts**: Aparecen automáticamente
- **Action Buttons**: Ver dashboard o cerrar
- **Smart Positioning**: No bloquean la UI

## 🔧 API del Agent

### Budget Management

```typescript
// Crear/actualizar configuración
POST /api/budget/config
{
  "user_address": "0x...",
  "monthly_limit": 100.0,
  "warning_threshold": 0.8,
  "pause_threshold": 1.0
}

// Obtener status
GET /api/budget/status/{user_address}
```

### Usage Tracking

```typescript
// Registrar uso de API
POST /api/usage/record
{
  "user_address": "0x...",
  "api_id": "openai-gpt4",
  "api_name": "OpenAI GPT-4",
  "provider": "openai",
  "cost": 0.02,
  "tokens_used": 500
}
```

### Alerts & Optimizations

```typescript
// Obtener alertas
GET /api/alerts/{user_address}?unread_only=true

// Obtener optimizaciones
GET /api/optimizations/{user_address}

// Marcar optimización como aplicada
POST /api/optimizations/{optimization_id}/apply
```

### AI Analysis

```typescript
// Análisis de gastos con IA
POST /api/analyze
{
  "user_address": "0x...",
  "time_window_hours": 24,
  "include_recommendations": true
}

// Reporte mensual
GET /api/report/{user_address}/monthly
```

## 🧠 Análisis con IA

El Guardian usa OpenAI o Deepseek para:

1. **Análisis de Patrones**
   - Identifica tendencias de gasto
   - Detecta uso ineficiente
   - Sugiere optimizaciones

2. **Detección de Anomalías**
   - Compara con historial
   - Identifica spikes inusuales
   - Determina causa probable (bug/spike/testing)

3. **Recomendaciones**
   - Model switching (GPT-4 → GPT-3.5)
   - Rate limiting
   - Batching de requests
   - Provider alternativo

## 📊 Base de Datos

### Modelos

- **BudgetConfig**: Configuración por usuario
- **ApiUsage**: Registro de cada llamada
- **BudgetAlert**: Alertas generadas
- **Optimization**: Sugerencias de IA
- **MonthlyReport**: Reportes mensuales

### Schema

```python
BudgetConfig:
  - user_address
  - monthly_limit
  - warning_threshold
  - pause_threshold
  - is_active

ApiUsage:
  - user_address
  - api_id, api_name, provider
  - cost, tokens_used
  - timestamp

BudgetAlert:
  - user_address
  - alert_type, severity
  - message, recommendation
  - is_read

Optimization:
  - user_address
  - current_api, suggested_api
  - estimated_savings
  - is_applied
```

## 🔒 Seguridad

- ✅ API keys nunca se exponen al frontend
- ✅ Validación de direcciones wallet
- ✅ Rate limiting en endpoints críticos
- ✅ CORS configurado apropiadamente
- ✅ Environment variables para secrets

## 📈 Métricas de Impacto

Como se menciona en el userflow_3:

- **Average savings**: 40% vs billing tradicional
- **Bill shocks prevented**: 95% de casos
- **Developer confidence**: 60% más tiempo innovando

## 🛠️ Troubleshooting

### Agent no inicia

```bash
# Verificar Python
python --version  # Debe ser 3.10+

# Verificar API key
grep OPENAI_API_KEY .env
# o
grep DEEPSEEK_API_KEY .env

# Reinstalar dependencias
pip install -e . --force-reinstall
```

### Backend no conecta

```bash
# Verificar GUARDIAN_URL
cat backend/.env | grep GUARDIAN_URL

# Verificar agent corriendo
curl http://localhost:8000/health
```

### Frontend sin datos

```bash
# Verificar wallet conectada
# Abrir DevTools (F12) > Console

# Verificar llamadas API
# Network tab > Filter: guardian

# Verificar configuración existe
curl http://localhost:8787/api/guardian/budget/status/YOUR_ADDRESS
```

## 📚 Documentación Adicional

- [Guía de Implementación Completa](./GUARDIAN_IMPLEMENTATION_GUIDE.md)
- [README del Agent](./agent/README_GUARDIAN.md)
- [Userflow 3 Original](./userflow_3.md)
- [Crypto.com AI SDK Docs](https://ai-agent-sdk-docs.crypto.com/)

## 🎯 Roadmap

### Fase 1 ✅ (Actual)
- [x] Monitoreo básico de presupuesto
- [x] Alertas automáticas
- [x] Detección de anomalías
- [x] Optimizaciones con IA
- [x] Dashboard y UI

### Fase 2 (Próxima)
- [ ] Webhooks (Discord/Slack)
- [ ] Email notifications
- [ ] Mobile push notifications
- [ ] Analytics avanzados
- [ ] Multi-wallet support

### Fase 3 (Futuro)
- [ ] Team budgets compartidos
- [ ] Más AI providers (Claude, Gemini)
- [ ] Predictive ML analysis
- [ ] Automated API switching
- [ ] Cost comparison marketplace

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit cambios (`git commit -m 'Add feature'`)
4. Push (`git push origin feature/amazing`)
5. Abre un Pull Request

## 📝 Licencia

MIT

---

**Desarrollado con ❤️ para el Hackathon Cronos 2025**

Powered by:
- [Crypto.com AI SDK](https://ai-agent-sdk-docs.crypto.com/)
- [OpenAI API](https://platform.openai.com/)
- [Deepseek API](https://platform.deepseek.com/)
