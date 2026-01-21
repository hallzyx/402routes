# 🤖 Guía de Implementación del AI Budget Guardian

## 📋 Índice
1. [Resumen](#resumen)
2. [Arquitectura](#arquitectura)
3. [Instalación](#instalación)
4. [Configuración](#configuración)
5. [Flujo de Uso](#flujo-de-uso)
6. [Integración](#integración)
7. [Testing](#testing)

## Resumen

El AI Budget Guardian es un agente inteligente que monitorea y optimiza el gasto en APIs automáticamente. Implementa el userflow_3 completo con:

- ✅ Monitoreo automático de gastos en tiempo real
- ✅ Alertas inteligentes (80%, 95%, 100%)
- ✅ Detección de patrones anómalos con IA
- ✅ Sugerencias de optimización automáticas
- ✅ Reportes mensuales detallados
- ✅ Soporte para OpenAI y Deepseek

## Arquitectura

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend   │─────▶│   Backend   │─────▶│    Agent    │
│  (Next.js)  │      │  (Express)  │      │  (FastAPI)  │
└─────────────┘      └─────────────┘      └─────────────┘
       │                     │                     │
       │                     │                     ▼
       │                     │              ┌─────────────┐
       │                     │              │  SQLite DB  │
       │                     │              └─────────────┘
       │                     │                     │
       │                     │                     ▼
       │                     │              ┌─────────────┐
       │                     │              │ OpenAI/     │
       └─────────────────────┴──────────────│ Deepseek    │
                                            └─────────────┘
```

### Componentes

#### 1. Agent (Python/FastAPI)
- **Ubicación**: `402routes/agent/`
- **Puerto**: 8000
- **Responsabilidades**:
  - Monitoreo de presupuesto
  - Análisis con IA (OpenAI/Deepseek)
  - Detección de anomalías
  - Generación de reportes

#### 2. Backend (TypeScript/Express)
- **Ubicación**: `402routes/backend/`
- **Puerto**: 8787
- **Responsabilidades**:
  - Proxy a servicios del agente
  - Registro de uso de APIs
  - Gestión de marketplace

#### 3. Frontend (Next.js)
- **Ubicación**: `402routes/frontend/`
- **Puerto**: 3000
- **Responsabilidades**:
  - Dashboard del Guardian
  - Configuración de presupuesto
  - Notificaciones en tiempo real

## Instalación

### 1. Agent (Python)

```bash
cd 402routes/agent

# Crear entorno virtual
python -m venv venv

# Activar (Windows)
venv\Scripts\activate

# Activar (Linux/Mac)
source venv/bin/activate

# Instalar dependencias
pip install -e .
```

### 2. Backend (Node.js)

```bash
cd 402routes/backend

# Instalar dependencias
npm install

# o con bun
bun install
```

### 3. Frontend (Next.js)

```bash
cd 402routes/frontend

# Instalar dependencias
npm install
```

## Configuración

### 1. Agent (.env)

```bash
cd 402routes/agent
cp .env.example .env
```

Editar `.env`:

```env
# AI Provider (openai o deepseek)
AI_PROVIDER=openai

# OpenAI (si AI_PROVIDER=openai)
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# Deepseek (si AI_PROVIDER=deepseek)
DEEPSEEK_API_KEY=your-key-here
DEEPSEEK_MODEL=deepseek-chat

# Backend URL
BACKEND_URL=http://localhost:8787

# Database
DATABASE_URL=sqlite+aiosqlite:///./guardian.db
```

### 2. Backend (.env)

Agregar en `402routes/backend/.env`:

```env
GUARDIAN_URL=http://localhost:8000
```

### 3. Frontend (.env)

El frontend se conecta al backend, no necesita configuración adicional del guardian.

## Flujo de Uso

### Setup Inicial (2 minutos)

1. **Usuario conecta wallet**
   ```
   GET /guardian/setup
   ```

2. **Usuario configura presupuesto**
   ```
   POST /api/guardian/budget/config
   {
     "user_address": "0x...",
     "monthly_limit": 100.0,
     "warning_threshold": 0.8,
     "pause_threshold": 1.0
   }
   ```

3. **Agent inicializa monitoreo**
   - Crea registro en BudgetConfig
   - Inicia tracking automático

### Monitoreo Automático

1. **Usuario usa una API**
   ```
   # Usuario hace llamada a OpenAI/Deepseek
   POST /api/execute/...
   ```

2. **Backend registra uso en Agent**
   ```typescript
   await guardianService.recordUsage({
     user_address: "0x...",
     api_id: "openai-gpt4",
     api_name: "OpenAI GPT-4",
     provider: "openai",
     cost: 0.02,
     tokens_used: 500
   });
   ```

3. **Agent analiza y alerta**
   - Calcula % usado
   - Detecta patrones anómalos
   - Genera alertas si es necesario

### Alertas Automáticas

#### Día 16 - Alerta de Advertencia (80%)

```json
{
  "alert_type": "warning",
  "severity": "warning",
  "message": "⚠️ WARNING: 80% de presupuesto usado con 14 días restantes",
  "recommendation": "Considera optimizar tu uso de APIs"
}
```

#### Día 28 - Prevención de Desastre

```json
{
  "alert_type": "unusual_pattern",
  "severity": "critical",
  "message": "🚨 Detecté patrón inusual: 500 llamadas en 2 minutos",
  "recommendation": "Pausé llamadas automáticamente. ¿Es intencional?",
  "metadata": {
    "should_pause": true,
    "likely_cause": "bug"
  }
}
```

## Integración

### Backend → Agent

#### Registrar uso después de cada API call

```typescript
import { guardianService } from './services/guardian.service';

// En tu controlador de APIs
async function executeApi(req, res) {
  // ... ejecutar API ...
  
  // Registrar en Guardian
  await guardianService.recordUsage({
    user_address: req.user.address,
    api_id: "openai-gpt4",
    api_name: "OpenAI GPT-4",
    provider: "openai",
    cost: calculateCost(response),
    tokens_used: response.usage?.total_tokens,
    endpoint: "/v1/chat/completions",
    status: "success"
  });
  
  // ... retornar respuesta ...
}
```

#### Verificar si usuario está bloqueado

```typescript
// Middleware de guardian
async function guardianCheck(req, res, next) {
  const userAddress = req.user.address;
  const isBlocked = await guardianService.shouldBlockUser(userAddress);
  
  if (isBlocked) {
    return res.status(402).json({
      error: "Budget limit reached",
      message: "Tu presupuesto mensual ha sido alcanzado. Aumenta el límite en /guardian"
    });
  }
  
  next();
}
```

### Frontend → Backend

#### Mostrar status en dashboard

```typescript
// En componente
const { data } = await fetch(`/api/guardian/budget/status/${address}`);
```

#### Notificaciones flotantes

```typescript
// Agregar en layout
import { GuardianNotifications } from '@/components/GuardianNotifications';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <GuardianNotifications />
    </>
  );
}
```

## Testing

### 1. Test del Agent

```bash
cd 402routes/agent

# Iniciar agent
python main.py

# En otra terminal, test endpoints
curl http://localhost:8000/health
```

### 2. Test del Backend

```bash
cd 402routes/backend

# Iniciar backend
npm run dev

# Test guardian endpoints
curl http://localhost:8787/api/guardian/health
```

### 3. Test End-to-End

```bash
# 1. Iniciar agent
cd 402routes/agent && python main.py

# 2. Iniciar backend (nueva terminal)
cd 402routes/backend && npm run dev

# 3. Iniciar frontend (nueva terminal)
cd 402routes/frontend && npm run dev

# 4. Abrir navegador
http://localhost:3000/guardian/setup
```

### Escenarios de Prueba

#### A. Setup de Presupuesto
1. Conectar wallet
2. Ir a `/guardian/setup`
3. Configurar $100/mes
4. Verificar creación en dashboard

#### B. Alerta de 80%
1. Simular $80 de uso
2. Verificar alerta en notificaciones
3. Ver recomendaciones en dashboard

#### C. Detección de Patrón Anómalo
1. Simular 100 llamadas en 1 minuto
2. Verificar alerta de pausa
3. Confirmar bloqueo de APIs

#### D. Optimización con IA
1. Usar GPT-4 frecuentemente
2. Esperar análisis (o forzar con `/api/analyze`)
3. Ver sugerencia de cambiar a GPT-3.5-turbo

## Troubleshooting

### Agent no inicia
```bash
# Verificar Python version
python --version  # Debe ser 3.10+

# Verificar dependencias
pip list | grep openai
pip list | grep fastapi

# Reinstalar
pip install -e . --force-reinstall
```

### Backend no conecta con Agent
```bash
# Verificar GUARDIAN_URL en .env
echo $GUARDIAN_URL

# Verificar agent está corriendo
curl http://localhost:8000/health

# Verificar logs del backend
npm run dev  # Buscar errores de conexión
```

### Frontend no muestra datos
```bash
# Verificar red del navegador (F12)
# Verificar llamadas a /api/guardian/*

# Verificar wallet conectada
console.log(address)

# Verificar configuración existe
curl http://localhost:8787/api/guardian/budget/status/0x...
```

## Próximos Pasos

### Mejoras Sugeridas

1. **Webhooks**: Enviar alertas a Discord/Slack
2. **Email**: Notificaciones por correo
3. **Mobile**: Notificaciones push
4. **Analytics**: Dashboard avanzado con gráficos
5. **Multi-chain**: Soporte para múltiples wallets
6. **Team budgets**: Presupuestos compartidos

### Extensiones

1. **More AI Providers**: Claude, Gemini, etc.
2. **API Categories**: Agrupar por tipo de API
3. **Predictive Analysis**: Proyecciones con ML
4. **Cost Comparison**: Comparar precios entre providers
5. **Automated Switching**: Cambiar API automáticamente

## 📚 Referencias

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Deepseek API Docs](https://platform.deepseek.com/docs)
- [Crypto.com AI SDK](https://ai-agent-sdk-docs.crypto.com/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Next.js Docs](https://nextjs.org/docs)

## 🤝 Soporte

Para problemas o preguntas:
1. Revisar esta guía
2. Consultar logs del agent/backend
3. Abrir issue en GitHub

---

**¡El AI Budget Guardian está listo para proteger tu presupuesto! 🤖💰**
