USER FLOW #1: Provider Publica API en 402way (MVP)
Objetivo del Flow
Permitir que un API provider publique su API en el marketplace 402way en menos de 3 minutos, conectando su wallet y definiendo pricing básico.

PASO 1: Landing Page
Pantalla: Homepage

text
402way - x402 API Marketplace

[Hero Section]
Monetize Your API with Automatic Payments
Let AI agents discover and pay for your API automatically - no API keys, no billing headaches.

[Publish API] ← CTA Button (morado, prominente)
User action: Click "Publish API"

PASO 2: Connect Wallet
Pantalla: Wallet Connection Modal

text
┌─────────────────────────────────────┐
│ Connect Your Wallet                 │
├─────────────────────────────────────┤
│                                     │
│ Connect your wallet to start        │
│ publishing APIs on 402way           │
│                                     │
│ 🦊 MetaMask                         │
│                                     │
│                                     │
│                                     │
│                                     │
│         [Cancel]                    │
└─────────────────────────────────────┘
User action:

Selecciona MetaMask

MetaMask popup aparece

Usuario aprueba conexión

Wallet conectada: 0x742d...bEb

Backend:

POST /api/providers

Body: { wallet_address: "0x742d..." }

Crea provider en DB

Return provider_id

Resultado: Redirect automático a formulario de publicación

PASO 3: API Information Form
Pantalla: Publish Your API

text
┌───────────────────────────────────────────────┐
│ Publish Your API                              │
├───────────────────────────────────────────────┤
│                                               │
│ API Name *                                    │
│ [_____________________________]               │
│ Example: WeatherPro                           │
│                                               │
│ Description                                   │
│ [_____________________________]               │
│ [_____________________________]               │
│ Brief description of what your API does       │
│                                               │
│ Category *                                    │
│ [▼ Select Category____________]               │
│   - Weather                                   │
│   - Finance                                   │
│   - AI/ML                                     │
│   - Web3                                      │
│   - Other                                     │
│                                               │
│ Endpoint URL *                                │
│ [_____________________________]               │
│ Example: https://api.weatherpro.com           │
│ ⓘ Your real API endpoint                      │
│                                               │
│ Price per Call (USDC) *                       │
│ [______]                                      │
│ Example: 0.001                                │
│ ≈ $0.001 per request                          │
│                                               │
│                                               │
│         [Cancel]  [Publish API] →             │
└───────────────────────────────────────────────┘
Campos:

API Name: Text input (3-255 chars, required)

Description: Textarea (max 500 chars, optional)

Category: Dropdown (required)

Endpoint URL: Text input (URL validation, required)

Price per Call: Number input (> 0, max 8 decimals, required)

Validaciones frontend:

API Name no vacío

URL válida (https://...)

Price > 0

Category seleccionada

User action: Llena formulario y click "Publish API"

PASO 4: Backend Processing
Request:

text
POST /api/apis
Content-Type: application/json
Authorization: Bearer {wallet_signature}

{
  "name": "WeatherPro",
  "description": "Real-time weather data with forecasts",
  "category": "weather",
  "endpoint_url": "https://api.weatherpro.com",
  "price_per_call": "0.001"
}
Backend actions:

Verificar que provider existe (wallet autenticada)

Validar todos los campos

Generar UUID para API

Crear registro en tabla apis:

id: uuid-456

provider_id: uuid-123 (del wallet)

name, description, category, endpoint_url, price_per_call

is_active: true

total_calls: 0

total_revenue: 0

Return API creada

Response:

json
{
  "id": "api-uuid-456",
  "name": "WeatherPro",
  "category": "weather",
  "price_per_call": "0.001",
  "status": "active",
  "created_at": "2026-01-17T21:30:00Z"
}
PASO 5: Success Confirmation
Pantalla: API Published Successfully

text
┌─────────────────────────────────────────────┐
│             ✅ API Published!                │
├─────────────────────────────────────────────┤
│                                             │
│ Your API is now live on 402way!             │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ WeatherPro                              │ │
│ │ weather • 0.001 USDC per call           │ │
│ │ Status: 🟢 Active                       │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Next Steps:                                 │
│ • AI agents can now discover your API      │
│ • You'll receive payments automatically    │
│ • Monitor usage in your dashboard          │
│                                             │
│ API Endpoint for Agents:                    │
│ https://(APP_URL)/api/weather-uuid-456      │
│ [Copy Link]                                 │
│                                             │
│                                             │
│ [View in Marketplace] [Publish Another API] │
└─────────────────────────────────────────────┘

Note: The user must include 1 endpoint in the registration of his api.


User actions:

"View in Marketplace" → Redirect a /apis/api-uuid-456 (página pública del API)

"Publish Another API" → Volver a formulario vacío (PASO 3)

PASO 6 (Opcional MVP): View in Marketplace
Pantalla: Public API Page (vista simplificada)

text
┌─────────────────────────────────────────────┐
│ WeatherPro                                  │
│ by 0x742d...bEb                             │
├─────────────────────────────────────────────┤
│                                             │
│ Real-time weather data with forecasts       │
│                                             │
│ Category: Weather                           │
│ Price: 0.001 USDC per call                  │
│ Status: Active                              │
│                                             │
│ Endpoint for AI Agents:                     │
│ https://402way.com/api/weather-uuid-456     │
│                                             │
│                                             │
│ [Test API] [Edit] [View Stats]              │
└─────────────────────────────────────────────┘
Resumen del Flow MVP
Pasos totales: 5 (6 si cuenta confirmación)
Landing → Click "Publish API"

Connect Wallet → Approve

Fill Form (4 campos core)

Submit → Backend procesa

Success screen → API live

Tiempo estimado: 2-3 minutos
Datos mínimos requeridos:
✅ Wallet address (autenticación)

✅ API Name

✅ Category

✅ Endpoint URL

✅ Price per call (USDC)


Ventajas vs RapidAPI:
Sin signup tradicional - solo wallet connect

Sin API keys - x402 maneja auth

Sin billing setup - payments on-chain automáticos

Un solo formulario - vs múltiples pantallas en RapidAPI

Instantáneo - API live inmediatamente (no approval)

Validaciones Críticas
Frontend:
Wallet conectada antes de mostrar form

URL debe empezar con https://

Price > 0 y <= 1 USDC (límite razonable para MVP)

Todos los campos required completados


Backend:
Provider existe en DB (wallet válida)

URL no está duplicada (opcional: permitir duplicados para diferentes providers)

Price formato decimal válido

Category existe en lista predefinida

Estados de Error
Error 1: Wallet ya existe

text
⚠️ Wallet Already Registered
This wallet already has an account. 
[Go to Dashboard]
Error 2: Invalid URL

text
❌ Invalid Endpoint URL
Please enter a valid HTTPS URL
Example: https://api.example.com
Error 3: Price out of range

text
❌ Invalid Price
Price must be between 0.0001 and 1 USDC
Error 4: Network error

text
❌ Connection Error
Could not publish API. Please try again.
[Retry]