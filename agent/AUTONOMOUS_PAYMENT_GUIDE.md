# 🤖 AI Budget Guardian - Guía de Inicio Rápido

## Sistema de Pago Autónomo con Wallet del Agente

Tu AI Budget Guardian ya está configurado con **pago autónomo** inspirado en la arquitectura demo/a2a.

### 📊 Arquitectura

```
Usuario deposita fondos → Wallet del Agente → Pago automático de APIs
                          (0x1f24eF...)
```

## 🚀 Inicio Rápido

### 1. Tu Wallet del Agente ya está creada ✅

```
Address: 0x1f24eF014de80617470B2c4470FFB14CA4c20825
Private Key: (guardada en agent/.env)
```

### 2. Fondea la Wallet

**Opción A: Cronos Testnet (Recomendado)**
```bash
# Ve a: https://cronos.org/faucet
# Pega: 0x1f24eF014de80617470B2c4470FFB14CA4c20825
# Solicita CRO de prueba
```

**Opción B: Cronos Mainnet**
```bash
# Envía CRO desde tu wallet personal a:
# 0x1f24eF014de80617470B2c4470FFB14CA4c20825
# Recomendado: 10 CRO para empezar
```

### 3. Configura el Agente

```bash
cd agent

# Copia el .env.example generado
cp .env.example .env

# Edita .env y agrega tus API keys:
# - OPENAI_API_KEY o DEEPSEEK_API_KEY
# - AGENT_PRIVATE_KEY ya está configurada ✅
```

### 4. Instala Dependencias

```bash
pip install -e .
```

### 5. Inicia el Agente

```bash
python main.py
```

Verás:
```
🤖 Agent Wallet initialized: 0x1f24eF014de80617470B2c4470FFB14CA4c20825
🤖 AI Budget Guardian started
🧠 AI Provider: openai
📡 Server running on http://localhost:8000
```

## 🔍 Verificar el Sistema

### Check de Balance del Agente

```bash
curl http://localhost:8000/api/agent/wallet/balance
```

Respuesta:
```json
{
  "ok": true,
  "data": {
    "address": "0x1f24eF014de80617470B2c4470FFB14CA4c20825",
    "balance_cro": 10.5,
    "needs_funding": false,
    "blockchain_url": "https://cronoscan.com/address/0x1f24eF..."
  }
}
```

### Status Completo

```bash
curl http://localhost:8000/api/agent/wallet/status
```

Respuesta:
```json
{
  "ok": true,
  "data": {
    "address": "0x1f24eF014de80617470B2c4470FFB14CA4c20825",
    "balance_cro": 10.5,
    "daily_spend_cro": 0.0,
    "daily_limit_cro": 10.0,
    "per_tx_limit_cro": 1.0,
    "min_balance_cro": 1.0,
    "remaining_daily": 10.0,
    "can_operate": true,
    "needs_funding": false
  }
}
```

## 💡 Cómo Funciona el Pago Automático

### Userflow Completo:

1. **Usuario** configura presupuesto:
   ```bash
   POST /api/budget/config
   {
     "user_address": "0xCarlos...",
     "monthly_limit": 100.0
   }
   ```

2. **Usuario** llama API protegida (vía backend):
   ```bash
   GET /api/data (x402 protected)
   → Backend detecta que necesita pago
   ```

3. **Agente** paga automáticamente:
   ```bash
   POST /api/agent/pay
   {
     "user_address": "0xCarlos...",
     "api_id": "openai-gpt4",
     "cost_cro": 0.05
   }
   ```

4. **Sistema** registra y monitorea:
   - ✅ Gasto registrado en DB
   - ✅ Budget actualizado
   - ✅ Alertas si alcanza 80%
   - ✅ Pausa automática al 100%

## 🛡️ Seguridad y Límites

El agente tiene **límites de seguridad** configurados:

```python
AGENT_MAX_DAILY_SPEND = 10.0 CRO      # Máximo por día
AGENT_MAX_PER_TRANSACTION = 1.0 CRO    # Máximo por transacción
AGENT_MIN_BALANCE = 1.0 CRO            # Balance mínimo a mantener
```

Si se alcanza un límite:
```json
{
  "ok": false,
  "error": "Payment blocked: Exceeds daily limit (10.0 CRO)"
}
```

## 📊 Monitoreo en Tiempo Real

### Ver transacciones en blockchain:

```
https://cronoscan.com/address/0x1f24eF014de80617470B2c4470FFB14CA4c20825
```

### Dashboard del Guardian:

```
http://localhost:3000/guardian
```

## 🧪 Testing Local

### 1. Simular uso de API:

```bash
# Backend en http://localhost:8787
# Frontend en http://localhost:3000
# Agent en http://localhost:8000

# El agente pagará automáticamente cuando detecte uso
```

### 2. Ver logs del agente:

```
✅ Agent paid 0.05 CRO for openai-gpt4 (user: 0xCarlos...)
   TX: 0xabc123...
```

## 📝 Arquitectura Técnica

```
┌─────────────────┐
│ Usuario Carlos  │
└────────┬────────┘
         │ "Llama API OpenAI"
         ▼
┌─────────────────┐
│ 402Routes App   │
│ (Frontend)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Express Backend │
│ (guardian proxy)│
└────────┬────────┘
         │ POST /api/agent/pay
         ▼
┌─────────────────┐      ┌──────────────────┐
│ Guardian Agent  │──────│ Agent Wallet     │
│ (FastAPI)       │      │ 0x1f24eF...      │
└────────┬────────┘      └──────────┬───────┘
         │                          │
         │ Check limits             │ Sign transaction
         │ Record usage             │ Execute payment
         │                          ▼
         │                  ┌──────────────┐
         │                  │ Cronos       │
         │                  │ Blockchain   │
         │                  │ (x402)       │
         │                  └──────────────┘
         ▼
┌─────────────────┐
│ SQLite DB       │
│ • Budget        │
│ • Usage         │
│ • Alerts        │
└─────────────────┘
```

## 🔑 Inspirado en demo/a2a

Este sistema está basado en la arquitectura `demo/a2a`:

### Similitudes:
- ✅ Agent con wallet independiente (`X402_PRIVATE_KEY`)
- ✅ EIP-3009 authorization signing
- ✅ Pago automático sin intervención del usuario
- ✅ Límites de seguridad configurables
- ✅ Balance monitoring

### Diferencias:
- 🆕 Budget tracking por usuario
- 🆕 AI-powered anomaly detection
- 🆕 Optimización automática de gastos
- 🆕 Dashboard en tiempo real

## 🎯 Próximos Pasos

1. ✅ Wallet del agente creada
2. ⏳ Fondear la wallet con CRO
3. ⏳ Configurar presupuesto de usuario
4. ⏳ Probar pago automático
5. ⏳ Ver dashboard con métricas

## 📞 Soporte

Si necesitas ayuda:
- Verifica balance: `curl http://localhost:8000/api/agent/wallet/balance`
- Check logs: terminal donde corriste `python main.py`
- Blockchain explorer: https://cronoscan.com/address/0x1f24eF...

---

**¡Listo!** Tu AI Budget Guardian con pago autónomo está configurado 🚀
