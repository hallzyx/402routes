from typing import Union
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from crypto_com_developer_platform_client import Client, Wallet
import os


app = FastAPI()

# Inicializar el cliente de Crypto.com
try:
    Client.init(
        api_key=os.getenv("CRYPTO_COM_API_KEY", "YOUR_API_KEY"),
        provider=os.getenv("CRYPTO_COM_PROVIDER")  # Optional
    )
    crypto_client_initialized = True
except Exception as e:
    crypto_client_initialized = False
    print(f"Error initializing Crypto.com client: {e}")

# Not safe! Add your own allowed domains
origins = [
    "*",
] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define what you will receiving in request
class TypePayload(BaseModel):
    content: str

# Example GET route for app
@app.get("/")
def read_root():
    return {"Message": "Hello World! FastAPI is working."}

# Example POST route for app
@app.post("/getdata")
async def create_secret(payload: TypePayload):
    with open('output_file.txt', 'a') as f:
        now = datetime.now()
        formatted_date = now.strftime("%B %d, %Y at %I:%M %p")
        f.write(formatted_date + ": " + payload.content)
        f.write('\n')
    return payload.content

@app.get("/wasa")
async def say_wasa():
    return {"ehm":"wasaaaaaa"}

@app.get("/crypto/health")
async def crypto_health_check():
    """
    Endpoint para verificar si el cliente de Crypto.com se inicializó correctamente
    """
    if not crypto_client_initialized:
        raise HTTPException(
            status_code=503, 
            detail="Crypto.com client not initialized"
        )
    
    return {
        "status": "ok",
        "message": "Crypto.com client initialized successfully",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/crypto/status")
async def crypto_client_status():
    """
    Endpoint más detallado sobre el estado del cliente
    """
    return {
        "initialized": crypto_client_initialized,
        "api_key_configured": "sk-proj-f52c8fe8d315116576be0eb3dbb774b7:3ae8881a008ecba90679eaef37bf2f6990cfcf88259d0347e6cfd9273fe7cae800ce95c1b5f2b705ef8623f507ac780e",
        "provider_configured": bool(os.getenv("CRYPTO_COM_PROVIDER")),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/wallet/get")
async def create_wallet():
    """
    Endpoint para crear una nueva wallet usando Crypto.com SDK
    """
    if not crypto_client_initialized:
        raise HTTPException(
            status_code=503, 
            detail="Crypto.com client not initialized"
        )
    
    try:
        wallet = await Wallet.get_balance("0x6F21C2155bF93b49348a422A604310F8CCd6ec74")
        
        return {
            wallet
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating wallet: {str(e)}"
        )