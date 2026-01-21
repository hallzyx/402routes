"""
Budget Guardian service - Core business logic.
Includes autonomous payment handling via agent wallet (inspired by demo/a2a).
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from .database import BudgetConfig, ApiUsage, BudgetAlert, Optimization, MonthlyReport
from .schemas import (
    BudgetConfigCreate, ApiUsageCreate, BudgetStatusResponse,
    BudgetAlertResponse, OptimizationResponse
)
from .ai_analyzer import AIAnalyzer
from .config import settings


class BudgetGuardianService:
    """
    Core service for budget monitoring and optimization.
    
    This service now includes autonomous payment capabilities where the AI agent
    can pay for API usage automatically using its own wallet (agent_wallet.py).
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_analyzer = AIAnalyzer()
        self._agent_wallet = None  # Lazy load to avoid circular imports
    
    @property
    def agent_wallet(self):
        """Lazy-load agent wallet service."""
        if self._agent_wallet is None:
            from .agent_wallet import get_agent_wallet
            try:
                self._agent_wallet = get_agent_wallet()
            except ValueError as e:
                print(f"⚠️  Agent wallet not configured: {e}")
                self._agent_wallet = None
        return self._agent_wallet
    
    async def create_budget_config(
        self,
        config_data: BudgetConfigCreate
    ) -> BudgetConfig:
        """Create or update budget configuration."""
        # Check if config exists
        stmt = select(BudgetConfig).where(
            BudgetConfig.user_address == config_data.user_address
        )
        result = await self.db.execute(stmt)
        existing_config = result.scalar_one_or_none()
        
        if existing_config:
            # Update existing
            existing_config.monthly_limit = config_data.monthly_limit
            existing_config.warning_threshold = config_data.warning_threshold
            existing_config.pause_threshold = config_data.pause_threshold
            existing_config.guardian_wallet = config_data.guardian_wallet
            existing_config.updated_at = datetime.utcnow()
            await self.db.commit()
            await self.db.refresh(existing_config)
            return existing_config
        
        # Create new
        new_config = BudgetConfig(**config_data.model_dump())
        self.db.add(new_config)
        await self.db.commit()
        await self.db.refresh(new_config)
        return new_config
    
    async def record_api_usage(
        self,
        usage_data: ApiUsageCreate
    ) -> Dict[str, Any]:
        """
        Record API usage and check for budget alerts.
        
        Returns:
            Dict with usage record and any triggered alerts
        """
        # Create usage record
        usage = ApiUsage(**usage_data.model_dump())
        self.db.add(usage)
        await self.db.commit()
        await self.db.refresh(usage)
        
        # Check budget status
        status = await self.get_budget_status(usage_data.user_address)
        alerts = []
        
        # Check thresholds
        if status["percentage_used"] >= 100 and status["is_paused"]:
            alert = await self._create_alert(
                user_address=usage_data.user_address,
                alert_type="pause",
                severity="critical",
                message=f"⚠️ BUDGET PAUSED: You've reached 100% of your ${status['monthly_limit']} budget",
                current_spend=status["current_spend"],
                budget_limit=status["monthly_limit"],
                recommendation="Increase your budget limit or wait until next month"
            )
            alerts.append(alert)
        elif status["percentage_used"] >= 95:
            alert = await self._create_alert(
                user_address=usage_data.user_address,
                alert_type="critical",
                severity="critical",
                message=f"🚨 CRITICAL: {status['percentage_used']:.0f}% of budget used (${status['current_spend']:.2f}/${status['monthly_limit']})",
                current_spend=status["current_spend"],
                budget_limit=status["monthly_limit"],
                recommendation="Budget almost exhausted. Consider pausing non-essential API calls."
            )
            alerts.append(alert)
        elif status["percentage_used"] >= 80:
            alert = await self._create_alert(
                user_address=usage_data.user_address,
                alert_type="warning",
                severity="warning",
                message=f"⚠️ WARNING: {status['percentage_used']:.0f}% of budget used with {status['days_remaining']} days remaining",
                current_spend=status["current_spend"],
                budget_limit=status["monthly_limit"],
                recommendation=None
            )
            alerts.append(alert)
        
        # Check for unusual patterns
        await self._check_unusual_patterns(usage_data.user_address)
        
        return {
            "usage": usage,
            "alerts": alerts,
            "budget_status": status
        }
    
    async def get_budget_status(
        self,
        user_address: str
    ) -> BudgetStatusResponse:
        """Get current budget status."""
        # Get budget config
        config_stmt = select(BudgetConfig).where(
            BudgetConfig.user_address == user_address
        )
        config_result = await self.db.execute(config_stmt)
        config = config_result.scalar_one_or_none()
        
        if not config:
            raise ValueError(f"No budget configuration found for {user_address}")
        
        # Get current month's spending
        current_month = datetime.utcnow().strftime("%Y-%m")
        start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        usage_stmt = select(func.sum(ApiUsage.cost)).where(
            and_(
                ApiUsage.user_address == user_address,
                ApiUsage.timestamp >= start_of_month
            )
        )
        result = await self.db.execute(usage_stmt)
        current_spend = result.scalar() or 0.0
        
        # Calculate metrics
        remaining_budget = max(0, config.monthly_limit - current_spend)
        percentage_used = (current_spend / config.monthly_limit * 100) if config.monthly_limit > 0 else 0
        
        # Days remaining in month
        today = datetime.utcnow().date()
        if today.month == 12:
            next_month = datetime(today.year + 1, 1, 1).date()
        else:
            next_month = datetime(today.year, today.month + 1, 1).date()
        days_remaining = (next_month - today).days
        
        # Check if paused
        is_paused = percentage_used >= (config.pause_threshold * 100) and config.is_active
        
        # Get recent alerts
        alerts_stmt = select(BudgetAlert).where(
            BudgetAlert.user_address == user_address
        ).order_by(BudgetAlert.created_at.desc()).limit(5)
        alerts_result = await self.db.execute(alerts_stmt)
        recent_alerts = alerts_result.scalars().all()
        
        # Get available optimizations
        opt_stmt = select(Optimization).where(
            and_(
                Optimization.user_address == user_address,
                Optimization.is_applied == False
            )
        ).order_by(Optimization.estimated_savings.desc()).limit(5)
        opt_result = await self.db.execute(opt_stmt)
        optimizations = opt_result.scalars().all()
        
        return {
            "user_address": user_address,
            "monthly_limit": config.monthly_limit,
            "current_spend": current_spend,
            "remaining_budget": remaining_budget,
            "percentage_used": percentage_used,
            "days_remaining": days_remaining,
            "is_paused": is_paused,
            "recent_alerts": [BudgetAlertResponse.model_validate(a) for a in recent_alerts],
            "optimizations_available": [OptimizationResponse.model_validate(o) for o in optimizations]
        }
    
    async def analyze_spending(
        self,
        user_address: str,
        time_window_hours: int = 24
    ) -> Dict[str, Any]:
        """Perform AI analysis of spending patterns."""
        # Get usage data
        since = datetime.utcnow() - timedelta(hours=time_window_hours)
        usage_stmt = select(ApiUsage).where(
            and_(
                ApiUsage.user_address == user_address,
                ApiUsage.timestamp >= since
            )
        ).order_by(ApiUsage.timestamp.desc())
        
        usage_result = await self.db.execute(usage_stmt)
        usage_records = usage_result.scalars().all()
        
        # Get budget info
        status = await self.get_budget_status(user_address)
        
        # Prepare data for AI
        usage_data = [
            {
                "api_name": u.api_name,
                "provider": u.provider,
                "cost": u.cost,
                "request_count": u.request_count,
                "tokens_used": u.tokens_used,
                "timestamp": u.timestamp.isoformat()
            }
            for u in usage_records
        ]
        
        budget_info = {
            "monthly_limit": status["monthly_limit"],
            "current_spend": status["current_spend"],
            "percentage_used": status["percentage_used"],
            "days_remaining": status["days_remaining"]
        }
        
        # Run AI analysis
        analysis = await self.ai_analyzer.analyze_spending_patterns(
            usage_data=usage_data,
            budget_info=budget_info
        )
        
        # Store optimization suggestions
        for rec in analysis.get("recommendations", []):
            opt = Optimization(
                user_address=user_address,
                optimization_type=rec.get("type", "unknown"),
                current_api=rec.get("current_api", ""),
                suggested_api=rec.get("suggested_api"),
                estimated_savings=rec.get("estimated_monthly_savings", 0),
                description=rec.get("description", ""),
                extra_data=rec
            )
            self.db.add(opt)
        
        await self.db.commit()
        
        # Calculate API breakdown
        api_breakdown = {}
        for u in usage_records:
            key = f"{u.provider}:{u.api_name}"
            if key not in api_breakdown:
                api_breakdown[key] = {
                    "provider": u.provider,
                    "api_name": u.api_name,
                    "total_cost": 0,
                    "request_count": 0,
                    "avg_cost_per_request": 0
                }
            api_breakdown[key]["total_cost"] += u.cost
            api_breakdown[key]["request_count"] += u.request_count
        
        # Calculate averages
        for key in api_breakdown:
            data = api_breakdown[key]
            if data["request_count"] > 0:
                data["avg_cost_per_request"] = data["total_cost"] / data["request_count"]
        
        return {
            "user_address": user_address,
            "analysis_period": f"Last {time_window_hours} hours",
            "total_spend": sum(u.cost for u in usage_records),
            "api_breakdown": api_breakdown,
            "patterns_detected": analysis.get("patterns_detected", []),
            "anomalies": analysis.get("anomalies", []),
            "recommendations": analysis.get("recommendations", []),
            "estimated_savings": analysis.get("estimated_savings", 0),
            "summary": analysis.get("summary", "")
        }
    
    async def _check_unusual_patterns(self, user_address: str):
        """Check for unusual usage patterns."""
        # Get recent usage (last 5 minutes)
        recent_time = datetime.utcnow() - timedelta(minutes=settings.ANALYSIS_WINDOW_MINUTES)
        recent_stmt = select(ApiUsage).where(
            and_(
                ApiUsage.user_address == user_address,
                ApiUsage.timestamp >= recent_time
            )
        )
        recent_result = await self.db.execute(recent_stmt)
        recent_usage = recent_result.scalars().all()
        
        if len(recent_usage) < 10:  # Not enough data
            return
        
        # Get historical average
        hist_time = datetime.utcnow() - timedelta(days=7)
        hist_stmt = select(
            func.count(ApiUsage.id).label("total_calls"),
            func.sum(ApiUsage.cost).label("total_cost")
        ).where(
            and_(
                ApiUsage.user_address == user_address,
                ApiUsage.timestamp >= hist_time,
                ApiUsage.timestamp < recent_time
            )
        )
        hist_result = await self.db.execute(hist_stmt)
        hist_data = hist_result.one()
        
        # Calculate averages
        minutes_in_week = 7 * 24 * 60
        avg_calls_per_minute = hist_data.total_calls / minutes_in_week if hist_data.total_calls else 0
        avg_cost_per_minute = hist_data.total_cost / minutes_in_week if hist_data.total_cost else 0
        
        historical_avg = {
            "avg_calls_per_minute": avg_calls_per_minute,
            "avg_cost_per_minute": avg_cost_per_minute
        }
        
        # Prepare recent usage for AI
        recent_usage_data = [
            {
                "api_name": u.api_name,
                "provider": u.provider,
                "cost": u.cost,
                "timestamp": u.timestamp.isoformat()
            }
            for u in recent_usage
        ]
        
        # Check with AI
        anomaly = await self.ai_analyzer.detect_unusual_pattern(
            recent_usage=recent_usage_data,
            historical_average=historical_avg
        )
        
        if anomaly and anomaly.get("is_unusual"):
            # Create alert
            severity = anomaly.get("severity", "medium")
            await self._create_alert(
                user_address=user_address,
                alert_type="unusual_pattern",
                severity=severity,
                message=f"🔍 Unusual pattern detected: {anomaly.get('likely_cause', 'unknown')}",
                current_spend=sum(u.cost for u in recent_usage),
                budget_limit=0,  # Not budget-related
                recommendation=anomaly.get("recommendation"),
                extra_data=anomaly
            )
            
            # Auto-pause if severe
            if anomaly.get("should_pause"):
                config_stmt = select(BudgetConfig).where(
                    BudgetConfig.user_address == user_address
                )
                config_result = await self.db.execute(config_stmt)
                config = config_result.scalar_one_or_none()
                if config:
                    config.is_active = False
                    await self.db.commit()
    
    async def _create_alert(
        self,
        user_address: str,
        alert_type: str,
        severity: str,
        message: str,
        current_spend: float,
        budget_limit: float,
        recommendation: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ) -> BudgetAlert:
        """Create a budget alert."""
        # Check if similar alert exists recently
        recent_time = datetime.utcnow() - timedelta(hours=1)
        existing_stmt = select(BudgetAlert).where(
            and_(
                BudgetAlert.user_address == user_address,
                BudgetAlert.alert_type == alert_type,
                BudgetAlert.created_at >= recent_time
            )
        )
        result = await self.db.execute(existing_stmt)
        existing = result.scalar_one_or_none()
        
        if existing:
            return existing  # Don't spam alerts
        
        alert = BudgetAlert(
            user_address=user_address,
            alert_type=alert_type,
            severity=severity,
            message=message,
            current_spend=current_spend,
            budget_limit=budget_limit,
            recommendation=recommendation,
            extra_data=extra_data
        )
        self.db.add(alert)
        await self.db.commit()
        await self.db.refresh(alert)
        return alert
    
    async def generate_monthly_report(self, user_address: str) -> MonthlyReport:
        """Generate monthly spending report."""
        current_month = datetime.utcnow().strftime("%Y-%m")
        start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Get budget config
        config_stmt = select(BudgetConfig).where(
            BudgetConfig.user_address == user_address
        )
        config_result = await self.db.execute(config_stmt)
        config = config_result.scalar_one_or_none()
        
        if not config:
            raise ValueError(f"No budget configuration found for {user_address}")
        
        # Get usage
        usage_stmt = select(ApiUsage).where(
            and_(
                ApiUsage.user_address == user_address,
                ApiUsage.timestamp >= start_of_month
            )
        )
        usage_result = await self.db.execute(usage_stmt)
        usage_records = usage_result.scalars().all()
        
        # API breakdown
        api_breakdown = {}
        for u in usage_records:
            key = f"{u.provider}:{u.api_name}"
            api_breakdown[key] = api_breakdown.get(key, 0) + u.cost
        
        total_spent = sum(u.cost for u in usage_records)
        
        # Count alerts
        alerts_stmt = select(func.count(BudgetAlert.id)).where(
            and_(
                BudgetAlert.user_address == user_address,
                BudgetAlert.created_at >= start_of_month
            )
        )
        alerts_result = await self.db.execute(alerts_stmt)
        alerts_count = alerts_result.scalar() or 0
        
        # Count optimizations
        opt_stmt = select(
            func.count(Optimization.id),
            func.sum(Optimization.estimated_savings)
        ).where(
            and_(
                Optimization.user_address == user_address,
                Optimization.is_applied == True,
                Optimization.applied_at >= start_of_month
            )
        )
        opt_result = await self.db.execute(opt_stmt)
        opt_data = opt_result.one()
        
        report = MonthlyReport(
            user_address=user_address,
            month=current_month,
            total_spent=total_spent,
            budget_limit=config.monthly_limit,
            api_breakdown=api_breakdown,
            alerts_triggered=alerts_count,
            optimizations_applied=opt_data[0] or 0,
            cost_saved=opt_data[1] or 0,
            projected_cost_without_guardian=total_spent + (opt_data[1] or 0)
        )
        
        self.db.add(report)
        await self.db.commit()
        await self.db.refresh(report)
        
        return report
