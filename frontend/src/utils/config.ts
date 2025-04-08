// import configData from '../../../config/reports.config.json';

// Default configuration that will be replaced by fetch
const defaultConfig = {
  tiposRelatorio: {
    colheita_diario: {
      nome: "Colheita - Diário",
      frentes: [
        { id: "frente1", nome: "Frente 1 - BP Ituiutaba" },
        { id: "frente2", nome: "Frente 2 - CMAA Canápolis" },
        { id: "frente3", nome: "Frente 3 - Alexandrita" },
        { id: "frente4", nome: "Frente 4 - Zirleno" }
      ],
      metas: {
        disponibilidadeMecanica: 90,
        eficienciaEnergetica: 70,
        motorOcioso: 4,
        horaElevador: 5,
        usoGPS: 90
      },
      planilhas_excel: [
        "1_Disponibilidade Mecânica",
        "2_Eficiência Energética",
        "3_Hora Elevador",
        "4_Motor Ocioso",
        "5_Uso GPS"
      ],
      colunas_excel: {
        disponibilidade_mecanica: ["Frota", "Disponibilidade", "porcentagem"],
        eficiencia_energetica: ["Operador", "Eficiência", "porcentagem"],
        motor_ocioso: ["Operador", "Porcentagem", "porcentagem"],
        hora_elevador: ["Operador", "Horas", "horas"],
        uso_gps: ["Operador", "Porcentagem", "porcentagem"]
      },
      componentes: {
        mostrarImageUpload: true,
        mostrarExcelUpload: true,
        mostrarMapas: false
      }
    },
    colheita_semanal: {
      nome: "Colheita - Semanal",
      frentes: [
        { id: "frente1", nome: "Frente 1 - BP Ituiutaba" },
        { id: "frente2", nome: "Frente 2 - CMAA Canápolis" },
        { id: "frente3", nome: "Frente 3 - Alexandrita" },
        { id: "frente4", nome: "Frente 4 - Zirleno" }
      ],
      metas: {
        disponibilidadeMecanica: 90,
        eficienciaEnergetica: 70,
        motorOcioso: 4,
        horaElevador: 5,
        usoGPS: 90
      },
      planilhas_excel: [
        "1_Disponibilidade Mecânica",
        "2_Eficiência Energética",
        "3_Hora Elevador",
        "4_Motor Ocioso",
        "5_Uso GPS"
      ],
      colunas_excel: {
        disponibilidade_mecanica: ["Frota", "Disponibilidade", "porcentagem"],
        eficiencia_energetica: ["Operador", "Eficiência", "porcentagem"],
        motor_ocioso: ["Operador", "Porcentagem", "porcentagem"],
        hora_elevador: ["Operador", "Horas", "horas"],
        uso_gps: ["Operador", "Porcentagem", "porcentagem"]
      },
      componentes: {
        mostrarImageUpload: true,
        mostrarExcelUpload: true,
        mostrarMapas: false
      }
    },
    transbordo_diario: {
      nome: "Transbordo - Diário",
      frentes: [
        { id: "frente1", nome: "Frente 1 - BP Ituiutaba" },
        { id: "frente2", nome: "Frente 2 - CMAA Canápolis" },
        { id: "frente3", nome: "Frente 3 - Alexandrita" },
        { id: "frente4", nome: "Frente 4 - Zirleno" }
      ],
      metas: {
        disponibilidadeMecanica: 90,
        eficienciaEnergetica: 65,
        motorOcioso: 6,
        faltaApontamento: 10,
        usoGPS: 90
      },
      planilhas_excel: [
        "1_Disponibilidade Mecânica",
        "2_Eficiência Energética",
        "3_Motor Ocioso",
        "4_Falta de Apontamento",
        "5_Uso GPS"
      ],
      colunas_excel: {
        disponibilidade_mecanica: ["Frota", "Disponibilidade", "porcentagem"],
        eficiencia_energetica: ["Operador", "Eficiência", "porcentagem"],
        motor_ocioso: ["Operador", "Porcentagem", "porcentagem"],
        falta_apontamento: ["Operador", "Porcentagem", "porcentagem"],
        uso_gps: ["Operador", "Porcentagem", "porcentagem"]
      },
      componentes: {
        mostrarImageUpload: true,
        mostrarExcelUpload: true,
        mostrarMapas: false
      }
    },
    transbordo_semanal: {
      nome: "Transbordo - Semanal",
      frentes: [
        { id: "frente1", nome: "Frente 1 - BP Ituiutaba" },
        { id: "frente2", nome: "Frente 2 - CMAA Canápolis" },
        { id: "frente3", nome: "Frente 3 - Alexandrita" },
        { id: "frente4", nome: "Frente 4 - Zirleno" }
      ],
      metas: {
        disponibilidadeMecanica: 90,
        eficienciaEnergetica: 65,
        motorOcioso: 6,
        faltaApontamento: 10,
        usoGPS: 90
      },
      secoes: {
        disponibilidadeMecanica: true,
        eficienciaEnergetica: true,
        motorOcioso: true,
        faltaApontamento: true,
        usoGPS: false
      },
      planilhas_excel: [
        "1_Disponibilidade Mecânica",
        "2_Eficiência Energética",
        "3_Motor Ocioso",
        "4_Falta de Apontamento",
        "5_Uso GPS"
      ],
      colunas_excel: {
        disponibilidade_mecanica: ["Frota", "Disponibilidade", "porcentagem"],
        eficiencia_energetica: ["Operador", "Eficiência", "porcentagem"],
        motor_ocioso: ["Operador", "Porcentagem", "porcentagem"],
        falta_apontamento: ["Operador", "Porcentagem", "porcentagem"],
        uso_gps: ["Operador", "Porcentagem", "porcentagem"]
      },
      componentes: {
        mostrarImageUpload: true,
        mostrarExcelUpload: true,
        mostrarMapas: false
      }
    },
    drones_diario: {
      nome: "Drones - Diário",
      frentes: [
        { id: "ituiutaba", nome: "Aplicação Ituiutaba" },
        { id: "alexandrita", nome: "Aplicação Alexandrita" }
      ],
      metas: {
        hectaresAplicados: 80,
        horasVoo: 4,
        haHora: 18
      },
      planilhas_excel: [
        "flight record"
      ],
      colunas_excel: {
        flight_record: ["Flight time", "Day", "Sprayed area", "Flight duration(min:sec)", "Flight Duration (Decimal)"]
      },
      componentes: {
        mostrarImageUpload: true,
        mostrarExcelUpload: true,
        mostrarMapas: true
      }
    },
    drones_semanal: {
      nome: "Drones - Semanal",
      frentes: [
        { id: "ituiutaba", nome: "Aplicação Ituiutaba" },
        { id: "alexandrita", nome: "Aplicação Alexandrita" }
      ],
      metas: {
        hectaresAplicados: 400,
        horasVoo: 20,
        haHora: 18
      },
      planilhas_excel: [
        "flight record"
      ],
      colunas_excel: {
        flight_record: ["Flight time", "Day", "Sprayed area", "Flight duration(min:sec)", "Flight Duration (Decimal)"]
      },
      componentes: {
        mostrarImageUpload: true,
        mostrarExcelUpload: true,
        mostrarMapas: true
      }
    }
  },
  fontes: {
    excel: [
      { id: "sgpa", nome: "SGPA - Solinftec" },
      { id: "jd", nome: "Operations Center - John Deere" }
    ],
    imagens: [
      { id: "sgpa", nome: "SGPA - Solinftec" },
      { id: "jd", nome: "Operations Center - John Deere" },
      { id: "outro", nome: "Outra Fonte" }
    ]
  },
  defaults: {
    dataInicial: -1,
    paginacao: 10,
    atualizacaoAutomatica: false,
    intervaloAtualizacao: 3600,
    visualizacaoPrevia: false
  },
  graficos: {
    cores: {
      meta_atingida: "#48BB78",
      proximo_meta: "#90EE90",
      alerta: "#ECC94B",
      critico: "#E53E3E"
    },
    tolerancias: {
      proximo_meta: 7,
      alerta: 14,
      critico: 15
    },
    formatacao: {
      decimal: {
        casas: 4,
        separador: "."
      },
      porcentagem: {
        casas: 2,
        separador: "."
      },
      horas: {
        formato: "Xh00m"
      }
    }
  }
};

export interface Frente {
  id: string;
  nome: string;
}

export interface Meta {
  [key: string]: number;
}

export interface Componentes {
  mostrarImageUpload: boolean;
  mostrarExcelUpload: boolean;
  mostrarMapas: boolean;
  usarFrentesCheckbox?: boolean;
}

export interface TipoRelatorio {
  nome: string;
  frentes: Frente[];
  metas: Meta;
  secoes?: {
    [key: string]: boolean;
  };
  planilhas_excel: string[];
  colunas_excel: {
    [key: string]: string[];
  };
  componentes: Componentes;
}

export interface Fonte {
  id: string;
  nome: string;
}

export interface Config {
  tiposRelatorio: {
    [key: string]: TipoRelatorio;
  };
  fontes: {
    excel: Fonte[];
    imagens: Fonte[];
  };
  defaults: {
    dataInicial: number;
    paginacao: number;
    atualizacaoAutomatica: boolean;
    intervaloAtualizacao: number;
    visualizacaoPrevia?: boolean;
  };
}

export class ConfigManager {
  private config: any = defaultConfig;  // Inicializa com defaultConfig em vez de null
  private static instance: ConfigManager;

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  async reloadConfig() {
    try {
      const response = await fetch('/config/reports.config.json');
      this.config = await response.json();
      console.log('✅ Configurações carregadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      console.log('⚠️ Usando configurações padrão');
      this.config = defaultConfig;
    }
  }

  isLoaded(): boolean {
    return this.config !== null && this.config !== undefined;
  }

  getConfig(): any {
    if (!this.config) {
      console.warn('⚠️ Configurações não carregadas, usando configuração padrão');
      return defaultConfig;
    }
    return this.config;
  }

  public getTiposRelatorio(): string[] {
    return Object.keys(this.getConfig().tiposRelatorio);
  }

  public getTipoRelatorio(tipo: string): TipoRelatorio | undefined {
    return this.getConfig().tiposRelatorio[tipo];
  }

  public getFrentes(tipo: string): Frente[] {
    return this.getConfig().tiposRelatorio[tipo]?.frentes || [];
  }

  public getMetas(tipo: string): Meta {
    return this.getConfig().tiposRelatorio[tipo]?.metas || {};
  }

  public getFontesExcel(): Fonte[] {
    return this.getConfig().fontes?.excel || defaultConfig.fontes.excel;
  }

  public getFontesImagens(): Fonte[] {
    return this.getConfig().fontes?.imagens || defaultConfig.fontes.imagens;
  }

  public getComponentesConfig(tipo: string): Componentes {
    return this.getConfig().tiposRelatorio[tipo]?.componentes || {
      mostrarImageUpload: false,
      mostrarExcelUpload: false,
      mostrarMapas: false
    };
  }

  public getDefaults() {
    return this.getConfig().defaults || defaultConfig.defaults;
  }

  public getVisualizacaoPrevia(): boolean {
    return this.getConfig().defaults?.visualizacaoPrevia ?? false;
  }

  public getGraficosConfig() {
    return this.getConfig().graficos || defaultConfig.graficos;
  }
}

export const configManager = ConfigManager.getInstance(); 