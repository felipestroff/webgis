// * Sources
var source = new ol.source.Vector();

// * Interactions
var select = new ol.interaction.Select({
    condition: ol.events.condition.click,
    multi: true
});

var modify = new ol.interaction.Modify({
    source: source
});

var dragBox = new ol.interaction.DragBox();

// * Tooltips
var tooltip = new ol.Overlay({
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
        })
    ],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-53, -30.5]),
        zoom: 7
    })
});

// * Events
map.on('pointermove', function (event) {
    tooltip.setPosition(event.coordinate);
});

dragBox.on('boxend', function() {
    map.removeOverlay(tooltip);
});

// * Functions
function closePopup() {
    popupOverlay.setPosition(undefined);
    this.blur();
    return false;
}

// Layers
function clearBasemap(target) {

    $('.dropdown-item-basemap').removeClass('active');
    $(target).addClass('active');

    map.getLayers().forEach(function (layer) {
        if (layer.get('type') === 'basemap') {
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

    map.addLayer(
        new ol.layer.Tile({
            type: 'basemap',
            source: source
        })
    );

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
        console.log(features);
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

    document.getElementById('popup').classList.remove('d-none');
}

function zoomToCoords(target) {
    var coordinates = $(target).data('coordinates');
    var lat = parseFloat(coordinates[0]);
    var lon = parseFloat(coordinates[1]);
    var coordinate = ol.proj.transform([lat, lon], 'EPSG:4326', 'EPSG:3857');
    closePopup();
    viewCenter(coordinate, 2000, 15);
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
        $(target).closest('li').addClass('active');
        
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

// Utils
function createTooltip(html) {

    tooltip.element.innerHTML = html;

    map.addOverlay(tooltip);

    tooltip.element.classList.remove('d-none');
}

function removeInteractions() {

    $('.tool, .dropdown-item').removeClass('active');

    document.getElementById('map').style.cursor = 'default';

    map.removeInteraction(select);
    map.removeInteraction(modify);
    map.removeInteraction(dragBox);

    map.removeOverlay(tooltip);

    tooltip.element.classList.add('d-none');

    map.un('singleclick', identify);
}