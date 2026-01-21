"""
AI Budget Guardian - Entry point
"""

import uvicorn
from app.config import settings


def main():
    """Run the AI Budget Guardian server."""
    print("🤖 Starting AI Budget Guardian...")
    print(f"🧠 AI Provider: {settings.AI_PROVIDER}")
    print(f"🔗 Backend URL: {settings.BACKEND_URL}")
    print(f"📡 Listening on {settings.HOST}:{settings.PORT}")
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level="info"
    )


if __name__ == "__main__":
    main()
