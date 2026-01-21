/**
 * Guardian service client for AI Budget Guardian integration
 */

const GUARDIAN_URL = process.env.GUARDIAN_URL || 'http://localhost:8000';

interface BudgetConfig {
  user_address: string;
  monthly_limit: number;
  warning_threshold?: number;
  pause_threshold?: number;
  guardian_wallet?: string;
}

interface ApiUsage {
  user_address: string;
  api_id: string;
  api_name: string;
  provider: string;
  cost: number;
  request_count?: number;
  tokens_used?: number;
  endpoint?: string;
  status?: string;
  metadata?: Record<string, any>;
}

interface BudgetStatus {
  user_address: string;
  monthly_limit: number;
  current_spend: number;
  remaining_budget: number;
  percentage_used: number;
  days_remaining: number;
  is_paused: boolean;
  recent_alerts: any[];
  optimizations_available: any[];
}

class GuardianService {
  private baseURL: string;

  constructor() {
    this.baseURL = GUARDIAN_URL;
  }

  private async fetchGuardian(endpoint: string, options?: RequestInit): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Guardian API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Guardian fetch error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Create or update budget configuration
   */
  async createBudgetConfig(config: BudgetConfig): Promise<any> {
    try {
      return await this.fetchGuardian('/api/budget/config', {
        method: 'POST',
        body: JSON.stringify(config),
      });
    } catch (error) {
      console.error('Error creating budget config:', error);
      throw error;
    }
  }

  /**
   * Get budget status for a user
   */
  async getBudgetStatus(userAddress: string): Promise<BudgetStatus> {
    try {
      return await this.fetchGuardian(`/api/budget/status/${userAddress}`);
    } catch (error) {
      console.error('Error getting budget status:', error);
      throw error;
    }
  }

  /**
   * Record API usage
   */
  async recordUsage(usage: ApiUsage): Promise<any> {
    try {
      return await this.fetchGuardian('/api/usage/record', {
        method: 'POST',
        body: JSON.stringify(usage),
      });
    } catch (error) {
      console.error('Error recording usage:', error);
      // Don't throw - we don't want to break the API call if guardian is down
      return null;
    }
  }

  /**
   * Get alerts for a user
   */
  async getAlerts(userAddress: string, unreadOnly: boolean = false): Promise<any[]> {
    try {
      const params = unreadOnly ? '?unread_only=true' : '';
      const data = await this.fetchGuardian(`/api/alerts/${userAddress}${params}`);
      return data;
    } catch (error) {
      console.error('Error getting alerts:', error);
      return [];
    }
  }

  /**
   * Get optimizations for a user
   */
  async getOptimizations(userAddress: string): Promise<any[]> {
    try {
      return await this.fetchGuardian(`/api/optimizations/${userAddress}`);
    } catch (error) {
      console.error('Error getting optimizations:', error);
      return [];
    }
  }

  /**
   * Perform AI analysis
   */
  async analyzeSpending(userAddress: string, timeWindowHours: number = 24): Promise<any> {
    try {
      return await this.fetchGuardian('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({
          user_address: userAddress,
          time_window_hours: timeWindowHours,
          include_recommendations: true,
        }),
      });
    } catch (error) {
      console.error('Error analyzing spending:', error);
      throw error;
    }
  }

  /**
   * Get monthly report
   */
  async getMonthlyReport(userAddress: string): Promise<any> {
    try {
      return await this.fetchGuardian(`/api/report/${userAddress}/monthly`);
    } catch (error) {
      console.error('Error getting monthly report:', error);
      throw error;
    }
  }

  /**
   * Check if Guardian is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const data = await this.fetchGuardian('/health');
      return data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user should be blocked from API calls
   */
  async shouldBlockUser(userAddress: string): Promise<boolean> {
    try {
      const status = await this.getBudgetStatus(userAddress);
      return status.is_paused;
    } catch (error) {
      // If guardian is down, don't block users
      return false;
    }
  }
}

export const guardianService = new GuardianService();
