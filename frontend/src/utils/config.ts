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
      metas: {},
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
    intervaloAtualizacao: 3600
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
}

export interface TipoRelatorio {
  nome: string;
  frentes: Frente[];
  metas: Meta;
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
  };
}

class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;
  private configLoaded: boolean = false;

  private constructor() {
    this.config = defaultConfig;
    this.loadConfig();
  }

  private async loadConfig() {
    console.log('Iniciando carregamento das configurações...');
    try {
      // Verificar se estamos no servidor ou no cliente
      const isServer = typeof window === 'undefined';
      
      let config;
      
      if (isServer) {
        // No servidor, usamos o caminho do sistema de arquivos
        console.log('Carregando configuração no ambiente do servidor...');
        // Apenas usamos o fallback no servidor, sem tentar carregar o arquivo
        config = defaultConfig;
      } else {
        // No cliente, podemos usar fetch normalmente
        console.log('Carregando configuração no ambiente do cliente...');
        const response = await fetch('/config/reports.config.json', { 
          cache: 'no-store' // Desabilitar cache para garantir conteúdo atualizado
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        config = await response.json();
      }
      
      this.config = config;
      this.configLoaded = true;
      
      // Log detalhado das configurações carregadas
      console.log('✅ Configurações carregadas com sucesso!');
      console.log('📊 Tipos de relatório disponíveis:', Object.keys(config.tiposRelatorio));
      
      // Verificar se cada tipo de relatório tem as planilhas configuradas
      Object.entries(config.tiposRelatorio).forEach(([tipo, tipoConfig]: [string, any]) => {
        console.log(`📌 ${tipo} - ${tipoConfig.nome}:`);
        console.log(`   - Frentes: ${tipoConfig.frentes.length}`);
        console.log(`   - Planilhas Excel: ${tipoConfig.planilhas_excel?.join(', ') || 'Não configurado'}`);
      });
    } catch (error) {
      console.warn('⚠️ Erro ao carregar configurações:', error);
      console.log('⚠️ Usando configurações padrão');
      this.config = defaultConfig;
      this.configLoaded = true; // Marcando como carregado mesmo com erro
      
      // Log das configurações padrão sendo usadas
      console.log('📊 Tipos de relatório padrão:', Object.keys(defaultConfig.tiposRelatorio));
    }
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public async reloadConfig(): Promise<void> {
    await this.loadConfig();
  }

  public isLoaded(): boolean {
    return this.configLoaded;
  }

  public getTiposRelatorio(): string[] {
    return Object.keys(this.config.tiposRelatorio);
  }

  public getTipoRelatorio(tipo: string): TipoRelatorio | undefined {
    return this.config.tiposRelatorio[tipo];
  }

  public getFrentes(tipo: string): Frente[] {
    return this.config.tiposRelatorio[tipo]?.frentes || [];
  }

  public getMetas(tipo: string): Meta {
    return this.config.tiposRelatorio[tipo]?.metas || {};
  }

  public getFontesExcel(): Fonte[] {
    return this.config.fontes.excel || [];
  }

  public getFontesImagens(): Fonte[] {
    return this.config.fontes.imagens || [];
  }

  public getComponentesConfig(tipo: string): Componentes {
    return this.config.tiposRelatorio[tipo]?.componentes || {
      mostrarImageUpload: false,
      mostrarExcelUpload: false,
      mostrarMapas: false
    };
  }

  public getDefaults() {
    return this.config.defaults;
  }
}

export const configManager = ConfigManager.getInstance(); 