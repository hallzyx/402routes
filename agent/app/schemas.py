"""
Pydantic schemas for API requests and responses.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class BudgetConfigCreate(BaseModel):
    """Create budget configuration."""
    user_address: str
    monthly_limit: float = Field(gt=0)
    warning_threshold: float = Field(default=0.8, ge=0, le=1)
    pause_threshold: float = Field(default=1.0, ge=0, le=1)
    guardian_wallet: Optional[str] = None


class BudgetConfigResponse(BaseModel):
    """Budget configuration response."""
    id: int
    user_address: str
    monthly_limit: float
    warning_threshold: float
    pause_threshold: float
    guardian_wallet: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ApiUsageCreate(BaseModel):
    """Record API usage."""
    user_address: str
    api_id: str
    api_name: str
    provider: str
    cost: float
    request_count: int = 1
    tokens_used: Optional[int] = None
    endpoint: Optional[str] = None
    status: str = "success"
    metadata: Optional[Dict[str, Any]] = None


class ApiUsageResponse(BaseModel):
    """API usage response."""
    id: int
    user_address: str
    api_id: str
    api_name: str
    provider: str
    cost: float
    request_count: int
    tokens_used: Optional[int]
    endpoint: Optional[str]
    status: str
    metadata: Optional[Dict[str, Any]]
    timestamp: datetime
    
    class Config:
        from_attributes = True


class BudgetAlertResponse(BaseModel):
    """Budget alert response."""
    id: int
    user_address: str
    alert_type: str
    severity: str
    message: str
    current_spend: float
    budget_limit: float
    recommendation: Optional[str]
    extra_data: Optional[Dict[str, Any]]
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class OptimizationResponse(BaseModel):
    """Optimization suggestion response."""
    id: int
    user_address: str
    optimization_type: str
    current_api: str
    suggested_api: Optional[str]
    estimated_savings: float
    description: str
    is_applied: bool
    applied_at: Optional[datetime]
    extra_data: Optional[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True


class BudgetStatusResponse(BaseModel):
    """Current budget status."""
    user_address: str
    monthly_limit: float
    current_spend: float
    remaining_budget: float
    percentage_used: float
    days_remaining: int
    is_paused: bool
    recent_alerts: List[BudgetAlertResponse]
    optimizations_available: List[OptimizationResponse]


class MonthlyReportResponse(BaseModel):
    """Monthly report response."""
    id: int
    user_address: str
    month: str
    total_spent: float
    budget_limit: float
    api_breakdown: Dict[str, float]
    alerts_triggered: int
    optimizations_applied: int
    cost_saved: float
    projected_cost_without_guardian: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True


class AnalysisRequest(BaseModel):
    """Request for AI analysis."""
    user_address: str
    time_window_hours: int = Field(default=24, ge=1, le=720)
    include_recommendations: bool = True


class AnalysisResponse(BaseModel):
    """AI analysis response."""
    user_address: str
    analysis_period: str
    total_spend: float
    api_breakdown: Dict[str, Dict[str, Any]]
    patterns_detected: List[str]
    anomalies: List[str]
    recommendations: List[Dict[str, Any]]
    estimated_savings: float
    summary: str
