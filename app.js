// * Controls
var attribution = new ol.control.Attribution();

var zoomslider = new ol.control.ZoomSlider();

var mousePosition = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(6),
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