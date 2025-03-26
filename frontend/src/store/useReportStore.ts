import { create } from 'zustand';

interface Image {
  id: string;
  data: string;
  containerId: string;
  fonte: string;
}

interface ChartFonte {
  containerId: string;
  fonte: string;
}

interface ReportState {
  images: Image[];
  chartFontes: ChartFonte[];
  isReportGenerated: boolean;
  addImage: (image: Omit<Image, 'id'>) => void;
  removeImage: (containerId: string) => void;
  clearImages: () => void;
  setReportGenerated: (status: boolean) => void;
  updateImageFonte: (containerId: string, fonte: string) => void;
  setChartFonte: (containerId: string, fonte: string) => void;
  clearChartFontes: () => void;
}

export const useReportStore = create<ReportState>((set) => ({
  images: [],
  chartFontes: [],
  isReportGenerated: false,

  addImage: (image) => set((state) => ({
    images: [
      ...state.images.filter(img => img.containerId !== image.containerId),
      { ...image, id: Date.now().toString() }
    ]
  })),

  removeImage: (containerId) => set((state) => ({
    images: state.images.filter(img => img.containerId !== containerId)
  })),

  clearImages: () => set({ images: [] }),

  setReportGenerated: (status) => set({ isReportGenerated: status }),

  updateImageFonte: (containerId, fonte) => set((state) => ({
    images: state.images.map(img =>
      img.containerId === containerId
        ? { ...img, fonte }
        : img
    )
  })),

  setChartFonte: (containerId, fonte) => set((state) => ({
    chartFontes: [
      ...state.chartFontes.filter(f => f.containerId !== containerId),
      { containerId, fonte }
    ]
  })),

  clearChartFontes: () => set({ chartFontes: [] })
})); 