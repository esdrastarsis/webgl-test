# Visualizador 3D — Three.js + Sketchfab

Visualizador interativo de modelos 3D na web utilizando **Three.js**, com suporte a modelos do **Sketchfab** no formato glTF/GLB.

## Funcionalidades

| Recurso | Descrição |
|---------|-----------|
| **Carregamento glTF/GLB** | Suporte a modelos 3D com texturas, materiais PBR e animações |
| **Draco Compression** | Decodificação automática de meshes comprimidos com Draco |
| **OrbitControls** | Rotação, zoom e pan livres com damping suave |
| **Iluminação 3-point** | Key light, fill light e rim light com sombras PCF Soft |
| **Auto-fit** | Modelo é centralizado e escalado automaticamente |
| **Animações** | Reproduz animações do modelo automaticamente |
| **Tone Mapping** | ACES Filmic para visual cinematográfico |
| **HUD** | FPS counter, informações do modelo, painel de controles |
| **Atalhos de teclado** | Reset, wireframe, toggle grid, toggle luzes |
| **Responsivo** | Adapta-se a qualquer tamanho de tela |
| **Loading com progresso** | Barra de progresso animada durante o carregamento |


## Modelo utilizado

    Nome: PC Computer - Left 4 Dead 2 - Gnome Chompski (Free download)
    Fonte: https://sketchfab.com/3d-models/pc-computer-left-4-dead-2-gnome-chompski-d0fd8671225740dc85c740f32442cf89
    Formato: glTF em model/scene.gltf
    Licença: CC Attribution (download gratuito).


## Como usar

### 1. Clone ou baixe o projeto

```bash
git clone https://github.com/esdrastarsis/webgl-test
cd webgl-test
```

### 2. Sirva com um servidor local

O navegador exige um servidor HTTP para carregar módulos ES e modelos 3D. Use qualquer um:

```bash
# Python
python3 -m http.server 8000

# Node.js (npx)
npx -y serve .
```

Abra no navegador: **http://localhost:8000**

## Estrutura do projeto:
```
webgl-test/
├── index.html
├── style.css
├── main.js
├── README.md
└── model/
    ├── scene.gltf
    ├── scene.bin
    └── textures/
```

## Controles

| Entrada | Ação |
|---------|------|
| Mouse: Botão esquerdo + arrastar | Rotacionar câmera |
| Mouse: Botão direito + arrastar | Pan (mover lateralmente) |
| Mouse: Scroll | Zoom in/out |
| Teclado: `R` | Resetar câmera para posição inicial |
| Teclado: `G` | Alternar visibilidade do grid |
| Teclado: `W` | Alternar modo wireframe |
| Teclado: `L` | Alternar luzes (on/off) |

## Tecnologias

- **[Three.js](https://threejs.org/)** v0.170 — Biblioteca 3D para WebGL
- **[GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)** — Carregador de modelos glTF/GLB
- **[DRACOLoader](https://threejs.org/docs/#examples/en/loaders/DRACOLoader)** — Decodificador de compressão Draco
- **[OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)** — Controles de câmera orbitais
- **HTML5 / CSS3** — Interface e estilização
- **ES Modules** — Importação via Import Maps (CDN)
