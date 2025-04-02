import { useReportStore } from '@/store/useReportStore';

export interface ReportData {
  startDate?: string;
  endDate?: string;
  frontName?: string;
  tdh?: any[];
  diesel?: any[];
  impurezaVegetal?: any[];
  disponibilidadeMecanica?: any[];
  eficienciaEnergetica?: any[];
  horaElevador?: any[];
  motorOcioso?: any[];
  usoGPS?: any[];
  frotas?: any[];
  operadores?: any[];
}

export const useReportData = () => {
  const reportStore = useReportStore();
  
  return {
    reportData: reportStore.reportData as ReportData
  };
}; 