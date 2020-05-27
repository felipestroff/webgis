# OpenLayers WebGIS

Webgis application being developed based on studies in the Openlayers library.

**1. Technology**
-----------------

Core:
- Openlayers 6.x
- Bootstrap 4.x
- Javascript
- jQuery 3.x
- HTML5
- CSS3

Libs:
- dom-to-image (https://github.com/tsayen/dom-to-image)
- jsPDF (https://github.com/MrRio/jsPDF)
- jQuery contextMenu (https://swisnl.github.io/jQuery-contextMenu)
- easyPaginate.JS (https://st3ph.github.io/jquery.easyPaginate)
- Material Design Icons (https://material.io/resources/icons)
- Font Awesome (https://fontawesome.com)

**2. Functionalities**
----------------------

Projection System: SIRGAS 2000 / WGS84 / EPSG:4326

Developed:
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

Ideas:
- Esri base maps and others (Change Basemap)
- More base map options (Overview Map)
- Scale with more options (https://openlayers.org/en/latest/examples/scale-line.html)
- Bookmarks
- Layer List / File Tree
- Export / Import Layers

**3. BUGS**
-----------

- Does not export features with type Circle, empty "GeometryCollection" attribute

**4. Development environment**
------------------------------

Following are the configurations of the developing environment that have been tested and approved by the developer.

Application Server:
- IIS
- Apache

IDE:
- Visual Studio Code (https://code.visualstudio.com)

Browsers:
- Google Chrome
- Mozilla Firefox

**Contact**
-----------
Questions send an email to: stroff.felipe@gmail.com or contact by WhatsApp: <a href="https://api.whatsapp.com/send?phone=5551980392299&text=Olá%20Felipe,%20Estou%20com%20dúvidas%20sobre%20a%20aplicação%20OpenLayers%20WebGIS." target="_blank">Click Here to send a message via WhatsApp</a>