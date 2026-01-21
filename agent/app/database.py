"""
Database models for AI Budget Guardian.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from .config import settings

Base = declarative_base()


class BudgetConfig(Base):
    """User budget configuration."""
    __tablename__ = "budget_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_address = Column(String, unique=True, index=True, nullable=False)
    monthly_limit = Column(Float, nullable=False)
    warning_threshold = Column(Float, default=0.8)
    pause_threshold = Column(Float, default=1.0)
    guardian_wallet = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ApiUsage(Base):
    """API usage tracking."""
    __tablename__ = "api_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    user_address = Column(String, index=True, nullable=False)
    api_id = Column(String, index=True, nullable=False)
    api_name = Column(String, nullable=False)
    provider = Column(String, nullable=False)  # openai, deepseek, sendgrid, etc.
    cost = Column(Float, nullable=False)
    request_count = Column(Integer, default=1)
    tokens_used = Column(Integer, nullable=True)
    endpoint = Column(String, nullable=True)
    status = Column(String, default="success")  # success, failed, blocked
    extra_data = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class BudgetAlert(Base):
    """Budget alerts and notifications."""
    __tablename__ = "budget_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_address = Column(String, index=True, nullable=False)
    alert_type = Column(String, nullable=False)  # warning, critical, pause, unusual_pattern
    severity = Column(String, default="info")  # info, warning, critical
    message = Column(Text, nullable=False)
    current_spend = Column(Float, nullable=False)
    budget_limit = Column(Float, nullable=False)
    recommendation = Column(Text, nullable=True)
    extra_data = Column(JSON, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class Optimization(Base):
    """Cost optimization suggestions."""
    __tablename__ = "optimizations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_address = Column(String, index=True, nullable=False)
    optimization_type = Column(String, nullable=False)  # model_switch, rate_limit, consolidate
    current_api = Column(String, nullable=False)
    suggested_api = Column(String, nullable=True)
    estimated_savings = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    is_applied = Column(Boolean, default=False)
    applied_at = Column(DateTime, nullable=True)
    extra_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class MonthlyReport(Base):
    """Monthly spending reports."""
    __tablename__ = "monthly_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_address = Column(String, index=True, nullable=False)
    month = Column(String, nullable=False)  # YYYY-MM
    total_spent = Column(Float, nullable=False)
    budget_limit = Column(Float, nullable=False)
    api_breakdown = Column(JSON, nullable=False)  # {api_name: cost}
    alerts_triggered = Column(Integer, default=0)
    optimizations_applied = Column(Integer, default=0)
    cost_saved = Column(Float, default=0.0)
    projected_cost_without_guardian = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# Database engine and session
engine = create_async_engine(settings.DATABASE_URL, echo=True)
async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncSession:
    """Get database session."""
    async with async_session_maker() as session:
        yield session
