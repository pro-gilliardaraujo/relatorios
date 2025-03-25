import base64
import sys
from io import BytesIO
from pathlib import Path
from typing import Dict, List, Optional, Union

import pandas as pd
import streamlit as st
import streamlit.components.v1 as components
from PIL import Image
from streamlit.runtime.uploaded_file_manager import UploadedFile

# Adiciona o diretório src ao PYTHONPATH
src_path = Path(__file__).parent.parent
if str(src_path) not in sys.path:
    sys.path.append(str(src_path))

from processors.plantadeiras_processor import PlantadeirasProcessor

# Configuração da página
st.set_page_config(
    page_title="Boletim Diário - Plantadeiras",
    page_icon="🚜",
    layout="wide"
)

# Tipos de mapas/imagens
TIPOS_MAPAS = {
    'area_plantio': 'Área de Plantio',
    'mapa_velocidade': 'Mapa de Velocidade',
    'mapa_rpm': 'Mapa de RPM',
    'consumo_combustivel': 'Consumo de Combustível',
    'temperatura_motor': 'Mapa de Temperatura do Motor',
    'area_total': 'Mapa por Área Total'
}

def create_paste_area(key: str, label: str) -> None:
    """Cria uma área de colagem de imagem com suporte a Ctrl+V."""
    paste_area_html = f"""
        <div
            id="paste-area-{key}"
            style="
                width: 100%;
                height: 100px;
                border: 2px dashed #cccccc;
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 10px;
                cursor: pointer;
                background-color: #f8f9fa;
            "
            onclick="this.querySelector('input').click()"
        >
            <input
                type="file"
                accept="image/*"
                style="display: none"
                onchange="handleImageSelect(event, '{key}')"
            >
            <div style="text-align: center; color: #666;">
                <div>Cole sua imagem aqui (Ctrl+V)</div>
                <div style="font-size: 0.8em">ou clique para selecionar</div>
            </div>
        </div>
        <script>
            const pasteArea_{key} = document.getElementById('paste-area-{key}');
            
            // Função para converter blob para base64
            function blobToBase64(blob) {{
                return new Promise((resolve, reject) => {{
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                }});
            }}
            
            // Manipula a colagem de imagem
            async function handlePaste_{key}(e) {{
                const items = e.clipboardData?.items;
                for (let item of items) {{
                    if (item.type.indexOf('image') === 0) {{
                        e.preventDefault();
                        const blob = item.getAsFile();
                        const base64 = await blobToBase64(blob);
                        window.parent.postMessage({{
                            type: 'image-pasted',
                            key: '{key}',
                            data: base64
                        }}, '*');
                        break;
                    }}
                }}
            }}
            
            // Manipula a seleção de arquivo
            async function handleImageSelect(event, key) {{
                const file = event.target.files[0];
                if (file && file.type.startsWith('image/')) {{
                    const base64 = await blobToBase64(file);
                    window.parent.postMessage({{
                        type: 'image-pasted',
                        key: key,
                        data: base64
                    }}, '*');
                }}
            }}
            
            // Adiciona listeners
            document.addEventListener('paste', (e) => handlePaste_{key}(e));
            pasteArea_{key}.addEventListener('dragover', (e) => e.preventDefault());
            pasteArea_{key}.addEventListener('drop', async (e) => {{
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {{
                    const base64 = await blobToBase64(file);
                    window.parent.postMessage({{
                        type: 'image-pasted',
                        key: '{key}',
                        data: base64
                    }}, '*');
                }}
            }});
        </script>
    """
    components.html(paste_area_html, height=120)

def process_uploaded_image(uploaded_file: Optional[UploadedFile]) -> Optional[Image.Image]:
    """Processa a imagem enviada e retorna um objeto PIL Image."""
    if uploaded_file is not None:
        image_bytes = uploaded_file.read()
        return Image.open(BytesIO(image_bytes))
    return None

def process_base64_image(base64_str: str) -> Optional[Image.Image]:
    """Processa uma imagem em formato base64 e retorna um objeto PIL Image."""
    try:
        # Remove o cabeçalho do data URL se presente
        if ',' in base64_str:
            base64_str = base64_str.split(',')[1]
        
        # Decodifica o base64 e cria uma imagem
        image_bytes = base64.b64decode(base64_str)
        return Image.open(BytesIO(image_bytes))
    except Exception as e:
        st.error(f"Erro ao processar imagem: {str(e)}")
        return None

# Inicialização do estado da sessão
if 'images' not in st.session_state:
    st.session_state.images = {}
if 'processor' not in st.session_state:
    st.session_state.processor = PlantadeirasProcessor()

# Título
st.title("Boletim Diário - Plantadeiras")

# Sidebar
with st.sidebar:
    st.header("Configurações")
    uploaded_file = st.file_uploader(
        "Carregar arquivo Excel/CSV",
        type=['xlsx', 'csv'],
        help="Selecione o arquivo com os dados das plantadeiras"
    )

# Layout principal
col1, col2 = st.columns([2, 1])

with col1:
    st.header("Dados e Gráficos")
    
    if uploaded_file is not None:
        try:
            # Salva o arquivo temporariamente
            temp_path = Path("temp_data") / uploaded_file.name
            temp_path.parent.mkdir(exist_ok=True)
            
            with open(temp_path, "wb") as f:
                f.write(uploaded_file.getvalue())
            
            # Carrega e processa os dados
            st.session_state.processor.load_data(temp_path)
            
            # Valida os dados
            is_valid, erros = st.session_state.processor.validate_data()
            
            if not is_valid:
                st.error("Erros encontrados nos dados:")
                for erro in erros:
                    st.error(f"- {erro}")
            else:
                # Processa os dados
                resultados = st.session_state.processor.process_data()
                graficos = st.session_state.processor.generate_graphs(resultados)
                
                # Exibe os gráficos
                for nome, fig in graficos.items():
                    st.plotly_chart(fig, use_container_width=True)
                
                # Exibe métricas principais
                st.subheader("Métricas Principais")
                for equipamento, dados in resultados.items():
                    with st.expander(f"Equipamento {equipamento}"):
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.metric("Disponibilidade", f"{dados['disponibilidade']:.1f}%")
                        with col2:
                            st.metric("Utilização", f"{dados['utilizacao']:.1f}%")
                        with col3:
                            st.metric("Velocidade Média", f"{dados['velocidade_media']:.1f} km/h")
                
        except Exception as e:
            st.error(f"Erro ao processar o arquivo: {str(e)}")
            
        finally:
            # Limpa o arquivo temporário
            if temp_path.exists():
                temp_path.unlink()
    else:
        st.info("Por favor, carregue um arquivo Excel ou CSV para começar.")

with col2:
    st.header("Mapas e Imagens")
    
    # Cria tabs para organizar os mapas
    tabs = st.tabs(list(TIPOS_MAPAS.values()))
    
    for (tipo, label), tab in zip(TIPOS_MAPAS.items(), tabs):
        with tab:
            # Inicializa o estado para este tipo de mapa se não existir
            if tipo not in st.session_state.images:
                st.session_state.images[tipo] = None
            
            # Área de upload
            st.write(f"### {label}")
            
            # Cria área de colagem com suporte a Ctrl+V
            create_paste_area(tipo, label)
            
            # Exibe a imagem se existir
            if st.session_state.images[tipo] is not None:
                st.image(st.session_state.images[tipo], caption=label, use_column_width=True)
                if st.button(f"Remover imagem", key=f"remove_{tipo}"):
                    st.session_state.images[tipo] = None
                    st.rerun()
    
    # Botão para limpar todas as imagens
    if any(img is not None for img in st.session_state.images.values()):
        st.write("---")
        if st.button("Limpar todas as imagens"):
            st.session_state.images = {tipo: None for tipo in TIPOS_MAPAS}
            st.rerun()

# Adiciona o JavaScript para receber as mensagens das áreas de colagem
components.html(
    """
    <script>
        window.addEventListener('message', async (e) => {
            if (e.data.type === 'image-pasted') {
                // Envia o evento para o Streamlit
                await window.Streamlit.setComponentValue({
                    type: 'image-pasted',
                    key: e.data.key,
                    data: e.data.data
                });
            }
        });
    </script>
    """,
    height=0,
    key='message-handler'
) 