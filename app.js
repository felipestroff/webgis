// * Sources
var drawSource = new ol.source.Vector({
    wrapX: false
});

// * Vectors
var drawVector = new ol.layer.Vector({
    source: drawSource
});

// * Interactions
var select = new ol.interaction.Select({
    condition: ol.events.condition.click,
    multi: true
});

var draw;

var modify = new ol.interaction.Modify({
    source: drawSource
});

var dragBox = new ol.interaction.DragBox();

// * Tooltips
var tooltipOverlay = new ol.Overlay({
    element: document.getElementById('tooltip'),
    offset: [0, -15],
    positioning: 'bottom-center',
    className: 'ol-tooltip'
});

// * Overlays
var popupOverlay = new ol.Overlay({
    element: document.getElementById('popup'),
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});

// * Test Layer
/*var testLayer = new ol.layer.Tile({
    type: 'wms',
    source: new ol.source.TileWMS({
        url: 'http://infoambiente.stesa.com.br:8080/geoserver/wms',
        params: {
            'LAYERS': 'InfoAmbiente:EGR_INFR_Portos',
        },
        serverType: 'geoserver',
        crossOrigin: 'anonymous'
    })
});*/

// Set Z indexes
//testLayer.setZIndex(1);
drawVector.setZIndex(2);

// * View
var view = new ol.View({
    center: ol.proj.fromLonLat([-53, -30.5]),
    zoom: 7,
    minZoom: 7,
    maxZoom: 17
});

// * Map
var map = new ol.Map({
    controls: ol.control.defaults({
        attribution: false
    }).extend([
        new ol.control.ZoomSlider(),
        new ol.control.ScaleLine(),
        new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(6),
            projection: 'EPSG:4326',
            className: 'custom-mouse-position',
            undefinedHTML: ' '
        }),
        new ol.control.OverviewMap({
            tipLabel: 'Mapa geral',
            rotateWithView: true,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.TileArcGISRest({
                        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
                        crossOrigin: 'anonymous'
                    })
                })
            ]
        })
    ]),
    overlays: [
        popupOverlay
    ],
    interactions: ol.interaction.defaults().extend([
        // TODO
    ]),
    layers: [
        new ol.layer.Tile({
            type: 'basemap',
            source: new ol.source.OSM()
        }),
        drawVector,
        //testLayer
    ],
    target: 'map',
    view: view
});

// * Events
map.on('pointermove', function (event) {
    tooltipOverlay.setPosition(event.coordinate);
});

dragBox.on('boxend', function() {
    map.removeOverlay(tooltipOverlay);
});

$('.custom-switch').on('click', function (event) {
    event.stopPropagation();
});

// * Functions
// Layers
function clearBasemap(target) {

    $('.dropdown-item-basemap').removeClass('active');
    $(target).addClass('active');

    map.getLayers().forEach(function (layer) {
        if (layer && layer.get('type') === 'basemap') {
            map.removeLayer(layer);
        }
    });
}

function setBasemap(target, type, style) {

    clearBasemap();
    
    var source;

    if (type === 'osm') {
        source = new ol.source.OSM({
            crossOrigin: 'anonymous'
        });
    }
    else {
        source = new ol.source.BingMaps({
            key: 'Agl-rpGco3Mo07n16sDpY4jsu35RAbvEwPAND7hi8-6JgIFVetQdhnZ4i_oSiNyd',
            imagerySet: style,
            crossOrigin: 'anonymous'
        });
    }

    map.addLayer(new ol.layer.Tile({
        type: 'basemap',
        source: source
    }));

    $('.dropdown-item-basemap').removeClass('active');
    $(target).addClass('active');
}

// Zooms
function zoomGoto() {
    var coordinates = ol.proj.fromLonLat([-53, -30.5]);
    viewCenter(coordinates, 2000, 7);
}

function viewCenter(coordinate, duration, zoom) {
    map.getView().animate({
        center: coordinate,
        duration: duration,
        zoom: zoom
    });
}

// Popup
function closePopup() {
    popupOverlay.setPosition(undefined);
    this.blur();
    return false;
}

function togglePopup(checked) {
    if (checked) {
        document.getElementById('popup').classList.remove('d-none');
    }
    else {
        document.getElementById('popup').classList.add('d-none');
    }
}

// Identify
function enableIdentify(target) {
    if (target.classList.contains('active')) {
        removeInteractions();
    }
    else {
        removeInteractions();

        target.classList.add('active');

        document.getElementById('map').style.cursor = 'help';

        map.on('singleclick', identify);
    }
}

function identify(event) {

    var coordinates = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
    var features = map.getFeaturesAtPixel(event.pixel);
    
    if (features.length) {
        // TODO
    }
    else {
        identifyPoint(coordinates);
    }

    popupOverlay.setPosition(event.coordinate);
}

function identifyPoint(coordinates) {

    var formated = ol.coordinate.format(coordinates, '{x}, {y}', 3);

    $('#popup-zoom').data('coordinates', coordinates);

    document.getElementById('popup-content').innerHTML =
        '<div class="input-group input-group-sm">' +
            '<div class="input-group-prepend">' +
                '<div class="input-group-text">Coordenadas:</div>' +
            '</div>' +
            '<input type="text" value="' + formated + '" id="popup-coordinates" class="form-control">' +
        '</div>';
}

function zoomToCoords(target) {
    var coordinates = $(target).data('coordinates');
    var lat = parseFloat(coordinates[0]);
    var lon = parseFloat(coordinates[1]);
    var coordinate = ol.proj.transform([lat, lon], 'EPSG:4326', 'EPSG:3857');
    closePopup();
    viewCenter(coordinate, 2000, 17);
}

function copyCoords() {
    var copyText = document.getElementById('popup-coordinates');
    copyText.select();
    document.execCommand('Copy');
}

// Selects
// Unique
function enableSelect(target) {
    if (target.classList.contains('active')) {
        removeInteractions();
    }
    else {
        removeInteractions();

        target.classList.add('active');
        // Parent
        $(target).closest('.tool').addClass('active');
        
        document.getElementById('map').style.cursor = 'pointer';
        map.addInteraction(select);

        createTooltip('Clique em uma feição');
    }
}

// Multiple
function enableMultiSelect(target) {
    if (target.classList.contains('active')) {
        removeInteractions();
    }
    else {
        removeInteractions();

        target.classList.add('active');
        // Parent
        $(target).closest('li').addClass('active');
        
        document.getElementById('map').style.cursor = 'grab';
        map.addInteraction(select);
        map.addInteraction(dragBox);

        createTooltip('Clique e arraste para selecionar feições');
    }
}

// Edit
function enableEdit(target) {
    if (target.classList.contains('active')) {
        removeInteractions();
    }
    else {
        removeInteractions();

        target.classList.add('active');
        // Parent
        $(target).closest('li').addClass('active');
        
        map.addInteraction(modify);

        createTooltip('Clique em uma feição para editar');
    }
}

// Draw
function enableDraw(target, type) {

    if (target.classList.contains('active')) {
        removeInteractions();
    }
    else {
        removeInteractions();

        target.classList.add('active');
        // Parent
        $(target).closest('li').addClass('active');

        draw = new ol.interaction.Draw({
            source: drawSource,
            type: type,
            freehand: document.getElementById('freehandSwitch').checked
        });
    
        map.addInteraction(draw);
    }
}

function clearDraw() {
    if (confirm('Tem certeza?\nEssa ação irá excluir todos os desenhos')) {
        drawSource.clear();
    }
}

// Utils
function createTooltip(html) {

    tooltipOverlay.element.innerHTML = html;

    map.addOverlay(tooltipOverlay);
}

function toggleTooltip(checked) {
    if (checked) {
        tooltipOverlay.element.classList.remove('d-none');
    }
    else {
        tooltipOverlay.element.classList.add('d-none');
    }
}

function removeInteractions() {

    $('.tool, .dropdown-item').removeClass('active');

    document.getElementById('map').style.cursor = 'default';

    map.removeInteraction(select);
    map.removeInteraction(modify);
    map.removeInteraction(dragBox);
    map.removeInteraction(draw);

    map.removeOverlay(tooltipOverlay);

    map.un('singleclick', identify);
}