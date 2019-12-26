// * Controls
var attribution = new ol.control.Attribution();

var zoomslider = new ol.control.ZoomSlider();

var mousePosition = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(4),
    projection: 'EPSG:4326',
    className: 'custom-mouse-position',
    undefinedHTML: ' '
});

var scaleLine = new ol.control.ScaleLine();

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
        zoomslider,
        mousePosition,
        scaleLine
    ]),
    overlays: [
        popupOverlay
    ],
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-53, -30.5]),
        zoom: 7
    })
});

// * Functions
function closePopup() {
    popupOverlay.setPosition(undefined);
    this.blur();
    return false;
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
        target.classList.remove('active');
        document.getElementById('map').style.cursor = 'default';
        map.un('singleclick', identify);
    }
    else {
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

    var formated = ol.coordinate.format(coordinates, '{y}, {x}', 5);

    document.getElementById('popup-content').innerHTML =
        '<div>' +
            '<label style="margin-right: 5px;">Coordenadas:</label>' +
            '<input type="text" value="' + formated + '" class="input-code" readonly>' +
        '</div>';

    document.getElementById('popup').classList.remove('d-none');
}