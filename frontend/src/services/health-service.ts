/**
 * Health check API service
 */

import axiosInstance from '@/utils/api-client';
import { HealthCheckSchema } from '@/schemas';
import type { HealthCheck } from '@/schemas';

export const healthService = {
  /**
   * Check API health
   */
  async checkHealth(): Promise<HealthCheck> {
    const response = await axiosInstance.get('/health');
    return HealthCheckSchema.parse(response.data);
  },
};
