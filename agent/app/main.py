"""
AI Budget Guardian - FastAPI Application
"""

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from .database import init_db, get_db
from .guardian_service import BudgetGuardianService
from .schemas import (
    BudgetConfigCreate,
    BudgetConfigResponse,
    ApiUsageCreate,
    BudgetStatusResponse,
    BudgetAlertResponse,
    OptimizationResponse,
    AnalysisRequest,
    AnalysisResponse,
    MonthlyReportResponse
)
from .config import settings

app = FastAPI(
    title="AI Budget Guardian",
    description="Intelligent API spending monitor and optimizer for 402Routes",
    version="0.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    await init_db()
    print(f"🤖 AI Budget Guardian started")
    print(f"🧠 AI Provider: {settings.AI_PROVIDER}")
    print(f"🔗 Backend URL: {settings.BACKEND_URL}")


@app.get("/")
async def root():
    """Health check."""
    return {
        "service": "AI Budget Guardian",
        "status": "operational",
        "ai_provider": settings.AI_PROVIDER,
        "version": "0.1.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "ai_provider": settings.AI_PROVIDER,
        "database": "connected",
        "backend_url": settings.BACKEND_URL
    }


@app.post("/api/budget/config", response_model=BudgetConfigResponse)
async def create_budget_config(
    config: BudgetConfigCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create or update budget configuration."""
    try:
        service = BudgetGuardianService(db)
        result = await service.create_budget_config(config)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/budget/status/{user_address}", response_model=BudgetStatusResponse)
async def get_budget_status(
    user_address: str,
    db: AsyncSession = Depends(get_db)
):
    """Get current budget status."""
    try:
        service = BudgetGuardianService(db)
        status = await service.get_budget_status(user_address)
        return status
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/usage/record")
async def record_usage(
    usage: ApiUsageCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Record API usage and trigger monitoring.
    This endpoint is called by the backend after each API call.
    """
    try:
        service = BudgetGuardianService(db)
        result = await service.record_api_usage(usage)
        
        # If alerts were triggered, notify user (background task)
        if result["alerts"]:
            background_tasks.add_task(
                notify_user_alerts,
                user_address=usage.user_address,
                alerts=result["alerts"]
            )
        
        return {
            "ok": True,
            "usage_id": result["usage"].id,
            "alerts_triggered": len(result["alerts"]),
            "budget_status": result["budget_status"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/alerts/{user_address}", response_model=List[BudgetAlertResponse])
async def get_alerts(
    user_address: str,
    limit: int = 20,
    unread_only: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """Get user alerts."""
    try:
        from sqlalchemy import select, and_
        from .database import BudgetAlert
        
        stmt = select(BudgetAlert).where(
            BudgetAlert.user_address == user_address
        )
        
        if unread_only:
            stmt = stmt.where(BudgetAlert.is_read == False)
        
        stmt = stmt.order_by(BudgetAlert.created_at.desc()).limit(limit)
        
        result = await db.execute(stmt)
        alerts = result.scalars().all()
        
        return [BudgetAlertResponse.model_validate(a) for a in alerts]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/alerts/{alert_id}/mark-read")
async def mark_alert_read(
    alert_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Mark alert as read."""
    try:
        from sqlalchemy import select
        from .database import BudgetAlert
        
        stmt = select(BudgetAlert).where(BudgetAlert.id == alert_id)
        result = await db.execute(stmt)
        alert = result.scalar_one_or_none()
        
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        alert.is_read = True
        await db.commit()
        
        return {"ok": True, "message": "Alert marked as read"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/optimizations/{user_address}", response_model=List[OptimizationResponse])
async def get_optimizations(
    user_address: str,
    applied_only: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """Get optimization suggestions."""
    try:
        from sqlalchemy import select, and_
        from .database import Optimization
        
        stmt = select(Optimization).where(
            Optimization.user_address == user_address
        )
        
        if applied_only:
            stmt = stmt.where(Optimization.is_applied == True)
        else:
            stmt = stmt.where(Optimization.is_applied == False)
        
        stmt = stmt.order_by(Optimization.estimated_savings.desc())
        
        result = await db.execute(stmt)
        optimizations = result.scalars().all()
        
        return [OptimizationResponse.model_validate(o) for o in optimizations]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/optimizations/{optimization_id}/apply")
async def apply_optimization(
    optimization_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Mark optimization as applied."""
    try:
        from datetime import datetime
        from sqlalchemy import select
        from .database import Optimization
        
        stmt = select(Optimization).where(Optimization.id == optimization_id)
        result = await db.execute(stmt)
        optimization = result.scalar_one_or_none()
        
        if not optimization:
            raise HTTPException(status_code=404, detail="Optimization not found")
        
        optimization.is_applied = True
        optimization.applied_at = datetime.utcnow()
        await db.commit()
        
        return {
            "ok": True,
            "message": "Optimization marked as applied",
            "estimated_savings": optimization.estimated_savings
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_spending(
    request: AnalysisRequest,
    db: AsyncSession = Depends(get_db)
):
    """Perform AI analysis of spending patterns."""
    try:
        service = BudgetGuardianService(db)
        analysis = await service.analyze_spending(
            user_address=request.user_address,
            time_window_hours=request.time_window_hours
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/report/{user_address}/monthly", response_model=MonthlyReportResponse)
async def get_monthly_report(
    user_address: str,
    db: AsyncSession = Depends(get_db)
):
    """Get or generate monthly report."""
    try:
        from datetime import datetime
        from sqlalchemy import select, and_
        from .database import MonthlyReport
        
        current_month = datetime.utcnow().strftime("%Y-%m")
        
        # Check if report exists
        stmt = select(MonthlyReport).where(
            and_(
                MonthlyReport.user_address == user_address,
                MonthlyReport.month == current_month
            )
        )
        result = await db.execute(stmt)
        report = result.scalar_one_or_none()
        
        if not report:
            # Generate new report
            service = BudgetGuardianService(db)
            report = await service.generate_monthly_report(user_address)
        
        return MonthlyReportResponse.model_validate(report)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def notify_user_alerts(user_address: str, alerts: List):
    """
    Background task to notify user about alerts.
    Can be extended to send webhooks, emails, etc.
    """
    # TODO: Implement webhook notifications to backend
    # TODO: Implement email notifications
    print(f"📬 Alerts for {user_address}: {len(alerts)} new alerts")
    for alert in alerts:
        print(f"  - {alert.severity.upper()}: {alert.message}")


# ═══════════════════════════════════════════════════════════════════════
# 🤖 Agent Wallet Endpoints (Autonomous Payment System)
# Inspired by demo/a2a architecture
# ═══════════════════════════════════════════════════════════════════════

@app.get("/api/agent/wallet/status")
async def get_agent_wallet_status(db: AsyncSession = Depends(get_db)):
    """
    Get agent wallet status including balance and spending limits.
    
    This endpoint allows monitoring the autonomous agent's wallet that
    pays for API usage automatically.
    """
    try:
        from .agent_wallet import get_agent_wallet
        
        wallet = get_agent_wallet()
        status = await wallet.get_wallet_status(db)
        
        return {
            "ok": True,
            "data": status
        }
    except ValueError as e:
        # Agent wallet not configured
        return {
            "ok": False,
            "error": str(e),
            "message": "Agent wallet not configured. Run create-agent-wallet.js first."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/agent/pay")
async def agent_autonomous_payment(
    user_address: str,
    api_id: str,
    cost_cro: float,
    db: AsyncSession = Depends(get_db)
):
    """
    Execute autonomous payment for API usage.
    
    This endpoint is called when the agent needs to pay for an API call
    on behalf of a user. The agent uses its own wallet (AGENT_PRIVATE_KEY)
    to sign and execute the payment transaction.
    
    Flow (similar to demo/a2a):
    1. Check if payment is allowed (budget limits)
    2. Create EIP-3009 authorization
    3. Submit to x402 facilitator
    4. Record usage in database
    5. Return transaction hash
    
    Args:
        user_address: User whose budget is being spent
        api_id: API being called
        cost_cro: Cost in CRO
    
    Returns:
        Transaction details
    """
    try:
        from .agent_wallet import get_agent_wallet
        from decimal import Decimal
        
        wallet = get_agent_wallet()
        
        # Execute autonomous payment
        success, tx_hash, error = await wallet.pay_for_api_usage(
            user_address=user_address,
            api_id=api_id,
            cost_cro=Decimal(str(cost_cro)),
            db=db
        )
        
        if not success:
            return {
                "ok": False,
                "error": error
            }
        
        # Record usage
        service = BudgetGuardianService(db)
        usage = await service.record_api_usage(ApiUsageCreate(
            user_address=user_address,
            api_id=api_id,
            cost=cost_cro,
            payment_method="agent_auto",
            transaction_hash=tx_hash
        ))
        
        return {
            "ok": True,
            "data": {
                "transaction_hash": tx_hash,
                "cost_cro": cost_cro,
                "usage_id": usage.id,
                "message": "Payment executed autonomously by agent"
            }
        }
        
    except ValueError as e:
        return {
            "ok": False,
            "error": str(e),
            "message": "Agent wallet not configured"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/agent/wallet/balance")
async def get_agent_balance():
    """
    Get current agent wallet balance.
    Quick endpoint for balance checking.
    """
    try:
        from .agent_wallet import get_agent_wallet
        
        wallet = get_agent_wallet()
        balance = await wallet.get_balance()
        
        return {
            "ok": True,
            "data": {
                "address": wallet.account.address,
                "balance_cro": float(balance),
                "needs_funding": balance < 2.0,
                "blockchain_url": f"https://cronoscan.com/address/{wallet.account.address}"
            }
        }
    except ValueError as e:
        return {
            "ok": False,
            "error": str(e),
            "message": "Agent wallet not configured"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
