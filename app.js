$(function () {
    $('[data-tooltip="true"]').tooltip();
  })

// * Controls
var zoomslider = new ol.control.ZoomSlider();

var mousePosition = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(4),
    projection: 'EPSG:4326',
    className: 'custom-mouse-position',
    undefinedHTML: ' '
});

var scaleLine = new ol.control.ScaleLine();

var map = new ol.Map({
    controls: ol.control.defaults().extend([
        zoomslider,
        mousePosition,
        scaleLine
    ]),
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-52, -30]),
        zoom: 7
    })
});