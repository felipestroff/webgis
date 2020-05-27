# Openlayers WebGIS

Aplicação sendo desenvolvida com base em estudos na biblioteca Openlayers.

**1. Tecnologias**
------------------

Core:
- Openlayers 6.x
- Bootstrap 4.x
- Javascript
- jQuery 3.x
- HTML5
- CSS3

Bibliotecas:
- dom-to-image (https://github.com/tsayen/dom-to-image)
- jsPDF (https://github.com/MrRio/jsPDF)
- jQuery contextMenu (https://swisnl.github.io/jQuery-contextMenu)
- easyPaginate.JS (https://st3ph.github.io/jquery.easyPaginate)
- Material Design Icons (https://material.io/resources/icons)
- Font Awesome (https://fontawesome.com)

**2. Funcionalidades**
----------------------

Sistema de Projeção: SIRGAS 2000 / WGS84 / EPSG:4326

Desenvolvido:
- Zoom Slider
- Mouse Position (coordinates)
- Rotate (shift + drag)
- Scale Line
- Overview Map
- Default Map View
- Geolocation
- Change Basemap
    - Blank/none
    - Bing Aerial
    - Bing Aerial With Labels
    - Bing Road
    - OpenStreetMap
- Identify Map
    - Show, and Copy Coordinates
    - Zoom To
- Draw and Edit
    - Point
    - Line
    - Polygon
    - Circle
    - Shapes
        - Square
        - Star
    - Freehand Option
    - Clear all
- Measure
    - Area (Polygon)
    - Length (LineString)
    - Clear all
- Toggle
    - Popups
    - Layers
    - Labels
    - Tips
- Select
    - Single
    - Multiple
    - Edit (Draw)
- Context Menu
    - Center
    - Marker
    - Delete Features
        - Single
        - Multiple
- Export Map
    - PDF
    - PNG
- Export Features
    - Draws
    - Measures
    - Markers
- Import Features
    - Draws
    - Measures
    - Markers

Ideias:
- Mapas bases da Esri e outros (Change Basemap)
- Mais opções de mapas base (Overview Map)
- Escala com mais opções (https://openlayers.org/en/latest/examples/scale-line.html)
- Marcadores
- Lista de Camadas / Árvore de Arquivos
- Exportar/Importar Camadas

**3. BUGS**
-----------

- Não exporta feições com o tipo Círculo (Circle), atributo "GeometryCollection" vazio

**4. Ambiente de Desenvolvimento**
----------------------------------

A seguir as configurações de ambiente em desenvolvimento que foram testadas e homologadas pelo desenvolvedor.

Servidor de Aplicação:
- IIS
- Apache

IDE:
- Visual Studio Code (https://code.visualstudio.com)

Navegadores:
- Google Chrome
- Mozilla Firefox

Estrutura:
- ```fonts```: Diretório de fontes personalizadas
- ```images```: Diretório de imagens
- ```lib```: Diretório de bibliotecas externas
- ```styles```: Diretório de estilos
- ```app.js```: Regras de negócio e funcionalidades front-end
- ```favicon.ico```: Ícone da aba do navegador
- ```index.html```: Página e interface inicial
- ```manifest.json```: Manifesto para Web Progressive App (https://developers.google.com/web/progressive-web-apps)
- ```web.config```: Configurações locais do IIS