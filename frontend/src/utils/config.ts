import configData from '../../../config/reports.config.json';

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

  private constructor() {
    this.config = configData;
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
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
    return this.config.fontes.excel;
  }

  public getFontesImagens(): Fonte[] {
    return this.config.fontes.imagens;
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