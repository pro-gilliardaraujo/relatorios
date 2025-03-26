import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
});

export interface OperationalMetrics {
  state_times: Record<string, number>;
  speed_by_operation: Record<string, number>;
  idle_time: number;
}

export interface PerformanceIndicators {
  mechanical_availability: number;
  rtk_usage: number;
  total_hours: number;
  maintenance_hours: number;
}

export interface TimeAnalysis {
  group_distribution: Record<string, number>;
  top_offenders: Record<string, number>;
}

export interface DailyReportData {
  operational_metrics: OperationalMetrics;
  performance_indicators: PerformanceIndicators;
  time_analysis: TimeAnalysis;
  geographic_data: GeoJSON.FeatureCollection;
}

export const reportService = {
  async uploadFile(file: File, saveProcessed: boolean = false) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<{ message: string; data: DailyReportData }>(
      '/relatorios/upload',
      formData,
      {
        params: { save_processed: saveProcessed },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data;
  },

  async getDailyReport(date: string, equipmentIds?: string[], metrics?: string[]) {
    const response = await api.get<DailyReportData>('/relatorios/daily', {
      params: {
        report_date: date,
        equipment_ids: equipmentIds,
        metrics: metrics
      }
    });
    
    return response.data;
  },

  async getAnalytics(
    startDate: string,
    endDate: string,
    equipmentIds?: string[],
    groupBy?: string
  ) {
    const response = await api.get('/relatorios/analytics', {
      params: {
        start_date: startDate,
        end_date: endDate,
        equipment_ids: equipmentIds,
        group_by: groupBy
      }
    });
    
    return response.data;
  }
};

export default api; 