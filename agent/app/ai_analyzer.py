"""
AI analysis service using OpenAI or Deepseek for intelligent budget insights.
"""

import json
from typing import Dict, Any, List, Optional
from openai import AsyncOpenAI
from .config import settings


class AIAnalyzer:
    """AI-powered budget analysis and recommendations."""
    
    def __init__(self):
        """Initialize AI client based on configured provider."""
        self.provider = settings.AI_PROVIDER
        
        if self.provider == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY not configured")
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            self.model = settings.OPENAI_MODEL
        elif self.provider == "deepseek":
            if not settings.DEEPSEEK_API_KEY:
                raise ValueError("DEEPSEEK_API_KEY not configured")
            self.client = AsyncOpenAI(
                api_key=settings.DEEPSEEK_API_KEY,
                base_url=settings.DEEPSEEK_BASE_URL
            )
            self.model = settings.DEEPSEEK_MODEL
        else:
            raise ValueError(f"Unknown AI provider: {self.provider}")
    
    async def analyze_spending_patterns(
        self,
        usage_data: List[Dict[str, Any]],
        budget_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze spending patterns and provide insights.
        
        Args:
            usage_data: List of API usage records
            budget_info: Budget configuration and current status
            
        Returns:
            Analysis results with patterns, anomalies, and recommendations
        """
        # Prepare context for AI
        context = self._prepare_analysis_context(usage_data, budget_info)
        
        prompt = f"""
        You are an AI Budget Guardian analyzing API spending patterns. 
        
        Context:
        {json.dumps(context, indent=2)}
        
        Please analyze this data and provide:
        
        1. **Patterns Detected**: Identify spending patterns (e.g., high usage at certain times, specific APIs dominating costs)
        2. **Anomalies**: Detect unusual patterns (sudden spikes, inefficient usage)
        3. **Recommendations**: Provide actionable cost-saving recommendations
        4. **Estimated Savings**: Calculate potential savings from recommendations
        5. **Summary**: A concise executive summary
        
        Respond in JSON format:
        {{
            "patterns_detected": ["pattern1", "pattern2"],
            "anomalies": ["anomaly1", "anomaly2"],
            "recommendations": [
                {{
                    "type": "model_switch|rate_limit|consolidate|optimize",
                    "current_api": "API name",
                    "suggested_api": "Alternative API (if applicable)",
                    "description": "Detailed recommendation",
                    "estimated_monthly_savings": 25.50,
                    "priority": "high|medium|low"
                }}
            ],
            "estimated_savings": 75.00,
            "summary": "Your spending analysis summary"
        }}
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert AI financial analyst specializing in API cost optimization."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )
            
            analysis = json.loads(response.choices[0].message.content)
            return analysis
            
        except Exception as e:
            print(f"AI analysis error: {e}")
            return self._fallback_analysis(usage_data, budget_info)
    
    async def detect_unusual_pattern(
        self,
        recent_usage: List[Dict[str, Any]],
        historical_average: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Detect if current usage pattern is unusual compared to historical data.
        
        Args:
            recent_usage: Recent API calls
            historical_average: Historical usage statistics
            
        Returns:
            Alert information if pattern is unusual, None otherwise
        """
        if not recent_usage:
            return None
        
        # Calculate recent metrics
        recent_cost = sum(u.get("cost", 0) for u in recent_usage)
        recent_count = len(recent_usage)
        recent_rate = recent_count / max(1, len(recent_usage) / 60)  # calls per minute
        
        # Compare with historical
        avg_cost = historical_average.get("avg_cost_per_minute", 0)
        avg_rate = historical_average.get("avg_calls_per_minute", 0)
        
        # Check for unusual patterns
        cost_multiplier = recent_cost / max(0.01, avg_cost) if avg_cost > 0 else 1
        rate_multiplier = recent_rate / max(0.01, avg_rate) if avg_rate > 0 else 1
        
        if cost_multiplier > settings.UNUSUAL_PATTERN_MULTIPLIER or \
           rate_multiplier > settings.UNUSUAL_PATTERN_MULTIPLIER:
            
            prompt = f"""
            Unusual API usage detected:
            - Recent cost rate: ${recent_cost}/min (normal: ${avg_cost}/min)
            - Recent call rate: {recent_rate} calls/min (normal: {avg_rate} calls/min)
            - Cost multiplier: {cost_multiplier:.1f}x
            - Rate multiplier: {rate_multiplier:.1f}x
            
            Recent usage: {json.dumps(recent_usage[-10:], indent=2)}
            
            Is this likely a:
            1. Bug/infinite loop
            2. Legitimate spike in demand
            3. Testing/development activity
            4. Potential security issue
            
            Provide a brief analysis and recommended action. Respond in JSON:
            {{
                "is_unusual": true,
                "likely_cause": "bug|spike|testing|security",
                "severity": "critical|high|medium|low",
                "recommendation": "What action to take",
                "should_pause": true/false
            }}
            """
            
            try:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a security and cost analyst for API usage."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.3
                )
                
                return json.loads(response.choices[0].message.content)
                
            except Exception as e:
                print(f"Pattern detection error: {e}")
                # Fallback to rule-based detection
                return {
                    "is_unusual": True,
                    "likely_cause": "spike",
                    "severity": "high" if cost_multiplier > 5 else "medium",
                    "recommendation": f"Usage is {cost_multiplier:.1f}x normal. Review your application.",
                    "should_pause": cost_multiplier > 10
                }
        
        return None
    
    async def suggest_optimization(
        self,
        api_usage_summary: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Suggest cost optimizations based on usage patterns.
        
        Args:
            api_usage_summary: Summary of API usage by provider
            
        Returns:
            List of optimization suggestions
        """
        prompt = f"""
        Analyze this API usage and suggest cost optimizations:
        
        {json.dumps(api_usage_summary, indent=2)}
        
        Consider:
        - Switching to cheaper models for simple tasks (e.g., GPT-4 → GPT-3.5-turbo)
        - Batch processing to reduce API calls
        - Caching frequently requested data
        - Using alternative providers with better pricing
        
        Respond with JSON array of optimizations:
        [
            {{
                "type": "model_switch|batching|caching|provider_switch",
                "current_api": "Current API/model",
                "suggested_api": "Suggested alternative",
                "description": "Why this helps",
                "estimated_monthly_savings": 45.00,
                "implementation_difficulty": "easy|medium|hard",
                "priority": "high|medium|low"
            }}
        ]
        """
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a cost optimization expert for API services."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.5
            )
            
            result = json.loads(response.choices[0].message.content)
            return result.get("optimizations", [])
            
        except Exception as e:
            print(f"Optimization suggestion error: {e}")
            return []
    
    def _prepare_analysis_context(
        self,
        usage_data: List[Dict[str, Any]],
        budget_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Prepare structured context for AI analysis."""
        # Aggregate by API/provider
        api_breakdown = {}
        for usage in usage_data:
            api_key = f"{usage.get('provider')}:{usage.get('api_name')}"
            if api_key not in api_breakdown:
                api_breakdown[api_key] = {
                    "provider": usage.get("provider"),
                    "api_name": usage.get("api_name"),
                    "total_cost": 0,
                    "request_count": 0,
                    "tokens_used": 0
                }
            api_breakdown[api_key]["total_cost"] += usage.get("cost", 0)
            api_breakdown[api_key]["request_count"] += usage.get("request_count", 1)
            api_breakdown[api_key]["tokens_used"] += usage.get("tokens_used", 0)
        
        return {
            "budget": budget_info,
            "total_usage_records": len(usage_data),
            "api_breakdown": api_breakdown,
            "time_period": f"Last {len(usage_data)} transactions"
        }
    
    def _fallback_analysis(
        self,
        usage_data: List[Dict[str, Any]],
        budget_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Fallback analysis when AI is unavailable."""
        total_cost = sum(u.get("cost", 0) for u in usage_data)
        
        return {
            "patterns_detected": [
                f"Total API calls: {len(usage_data)}",
                f"Total cost: ${total_cost:.2f}"
            ],
            "anomalies": [],
            "recommendations": [{
                "type": "review",
                "description": "Review your API usage patterns manually",
                "estimated_monthly_savings": 0,
                "priority": "low"
            }],
            "estimated_savings": 0,
            "summary": "AI analysis unavailable. Basic metrics provided."
        }
