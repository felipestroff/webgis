// * Global variables
var draw;
var measure;
var freehand = false;
var center;

// * Sources
var drawSource = new ol.source.Vector({
    wrapX: false
});

var geolocationSource = new ol.source.Vector();

var measureSource = new ol.source.Vector();

var markerSource = new ol.source.Vector();

// * Interactions
var select  = new ol.interaction.Select();
var selectedFeatures = select.getFeatures();

var modify = new ol.interaction.Modify({
    source: drawSource
});

var dragBox = new ol.interaction.DragBox();

// * Overlays
var popupOverlay = new ol.Overlay({
    element: document.getElementById('popup'),
    position: [0, 0],
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});

var tooltipOverlay = new ol.Overlay({
    element: document.getElementById('tooltip'),
    offset: [0, -15],
    position: [0, 0],
    positioning: 'bottom-center',
    className: 'ol-tooltip'
});

var labelOverlay = new ol.Overlay({
    element: document.getElementById('labels'),
    offset: [0, -15],
    position: [0, 0],
    positioning: 'bottom-center',
    className: 'ol-tooltip-measure'
});

// * Vectors
var drawVector = new ol.layer.Vector({
    source: drawSource,
    zIndex: 1
});

var measureVector = new ol.layer.Vector({
    source: measureSource,
    zIndex: 1,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    })
});

var geolocationVector = new ol.layer.Vector({
    source: geolocationSource,
    zIndex: 1
});

var markerVector = new ol.layer.Vector({
    source: markerSource,
    zIndex: 2
});

// * View
var view = new ol.View({
    center: ol.proj.fromLonLat([-53, -30.5]),
    zoom: 7,
    minZoom: 7,
    maxZoom: 19,
    constrainOnlyCenter: true
});

// * Layers
var defaultBasemap = new ol.layer.Tile({
    type: 'basemap',
    source: new ol.source.OSM()
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
        new ol.interaction.DragRotateAndZoom()
    ]),
    layers: [
        defaultBasemap,
        geolocationVector,
        drawVector,
        measureVector,
        markerVector
    ],
    target: 'map',
    view: view
});

// * Features
var accuracyFeature = new ol.Feature();
var positionFeature = new ol.Feature();

positionFeature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
            color: '#3399CC'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 2
        })
    })
}));

// * Tooltips
var measureTooltipElement;
var measureTooltip;

// * Geolocation
var geolocation = new ol.Geolocation({
    trackingOptions: {
        enableHighAccuracy: true
    },
    projection: view.getProjection()
});

// * Events
$(document).ready(function() {
    // SEO
    $('.ol-zoomslider-thumb').attr('aria-label', 'Zoom');

    // Bootstrap
    $('.tool').tooltip({
        placement: 'left'
    });

    /* Custom Bootstrap submenu
    * https://codepen.io/surjithctly/pen/PJqKzQ
    */
    $('.dropdown-menu a.dropdown-toggle').on('click', function(e) {
        if (!$(this).next().hasClass('show')) {
          $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
        }
        var $subMenu = $(this).next(".dropdown-menu");
        $subMenu.toggleClass('show');
      
        $(this).parents('div.dropdown.show').on('hidden.bs.dropdown', function(e) {
          $('.dropdown-submenu .show').removeClass("show");
        });

        return false;
    });
});

$(function() {
    // jQuery contextMenu
    $.contextMenu({
        selector: '#map',
        items: {
            'center': {
                name: 'Centralizar', 
                icon: 'fas fa-expand',
                callback: centerHere
            },
            'marker': {
                name: 'Marcador',
                icon: 'fas fa-map-marker-alt',
                callback: addMarker
            },
            'delete': {
                name: 'Deletar', 
                icon: 'far fa-trash-alt',
                callback: function(key, opt, e) {
                    if (selectedFeatures.getLength() > 1) {
                        deleteFeatures();
                    }
                    else {
                        deleteFeature();
                    }

                    // close menu after action
                    return true;
                },
                visible: function(key, opt){        
                    if (selectedFeatures.getLength()) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }    
            }
        }
    });
});

map.on('singleclick', function(e) {
    //console.log('[MAP_EVENT]:', e);
});

map.on('contextmenu', function(e) {
    //console.log('[MAP_EVENT]:', e);
    center = e.coordinate;
});

map.on('pointermove', function(e) {
    //console.log('[MAP_EVENT]:', e);

    tooltipOverlay.setPosition(e.coordinate);
});

// Ao selecionar uma feição
select.on('select', function(e) {
    console.log('[INTERACTION_EVENT]:', e);

    // Se tiver seleção
    // Adiciona dica
    if (e.selected.length) {
        createTooltip('1 feição selecionada');
    }
    // Remove dica
    else {
        map.removeOverlay(tooltipOverlay);
    }
});

// Ao iniciar a caixa de seleção
dragBox.on('boxstart', function() {
    selectedFeatures.clear();
    map.removeOverlay(tooltipOverlay);
});

// Ao terminar a caixa de seleção
dragBox.on('boxend', function() {
    // Remove a dica anterior
    map.removeOverlay(tooltipOverlay);

    // Captura a extensão da caixa de seleção
    var extent = this.getGeometry().getExtent();

    // Para cada feição que intercepta a fonte de feições
    // Desenhos
    drawSource.forEachFeatureIntersectingExtent(extent, function(feature) {
        // Adiciona a feição para o array de selecionados
        selectedFeatures.push(feature);
    });
    // Medições
    measureSource.forEachFeatureIntersectingExtent(extent, function(feature) {
        selectedFeatures.push(feature);
    });
    // Marcadores
    markerSource.forEachFeatureIntersectingExtent(extent, function(feature) {
        selectedFeatures.push(feature);
    });

    // Cria uma dica contendo o número de feições selecionadas pela ação
    createTooltip(selectedFeatures.getLength() + ' feições selecionadas');
});

geolocation.on('change:accuracyGeometry', function() {
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());   
});

geolocation.on('change:position', function() {
    var coordinates = geolocation.getPosition();
    positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
    viewCenter(geolocation.getPosition(), 1500, 16);
});

geolocation.on('error', function(error) {
    console.error(error);

    $('#itemGeolocation i').html('location_disabled');
});

// Previne que o radio customizado (switch) feche o dropdown
$('.custom-switch').on('click', function(event) {
    event.stopPropagation();
});

// * Functions
// Layers
function clearBasemap(target) {
    map.getLayers().forEach(function (layer) {
        if (layer && layer.get('type') === 'basemap') {
            map.removeLayer(layer);
        }
    });

    $('.dropdown-item-basemap').removeClass('active');
    $(target).addClass('active');
}

function setBasemap(target, type, style) {
    clearBasemap();
    
    var source;

    if (style === 'Aerial') {
        document.getElementById('basemapLabelsSwitch').checked = false;
        document.getElementById('basemapLabelsSwitch').removeAttribute('disabled');
    }
    else {
        document.getElementById('basemapLabelsSwitch').checked = false;
        document.getElementById('basemapLabelsSwitch').setAttribute('disabled', '');
    }

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

    var basemap = new ol.layer.Tile({
        type: 'basemap',
        source: source
    });

    map.addLayer(basemap);

    $('.dropdown-item-basemap').removeClass('active');
    $(target).addClass('active');
}

function setBasemapLabels(target) {
    clearBasemap();

    var source;

    if (target.checked) {
        source = new ol.source.BingMaps({
            key: 'Agl-rpGco3Mo07n16sDpY4jsu35RAbvEwPAND7hi8-6JgIFVetQdhnZ4i_oSiNyd',
            crossOrigin: 'anonymous',
            imagerySet: 'AerialWithLabelsOnDemand'
        });
    }
    else {
        source = new ol.source.BingMaps({
            key: 'Agl-rpGco3Mo07n16sDpY4jsu35RAbvEwPAND7hi8-6JgIFVetQdhnZ4i_oSiNyd',
            crossOrigin: 'anonymous',
            imagerySet: 'Aerial'
        });
    }

    var basemap = new ol.layer.Tile({
        type: 'basemap',
        source: source
    });

    map.addLayer(basemap);

    $('.dropdown-item-basemap').removeClass('active');
    $('#itemBingAerial').addClass('active');
}

function toggleLayers(checked) {
    var layers = map.getLayers();

    if (checked) {
        layers.forEach(function(layer) {
            if (layer.get('type') === 'wms') {
                layer.setVisible(true);
            }
        });
    }
    else {
        layers.forEach(function(layer) {
            if (layer.get('type') === 'wms') {
                layer.setVisible(false);
            }
        });
    }
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

function centerHere() {
    view.animate({
        duration: 700,
        center: center
    });
}

// Popup
function closePopup() {
    popupOverlay.setPosition(undefined);
    this.blur();
    return false;
}

function togglePopups(checked) {
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

        createTooltip('Clique para coletar informações');

        map.on('singleclick', identify);
    }
}

function identify(event) {
    closePopup();

    var coordinates = ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
    var features = map.getFeaturesAtPixel(event.pixel);
    
    if (features.length) {
        identifyFeatures(features);
    }
    else {
        identifyPoint(coordinates);
    }

    map.removeOverlay(tooltipOverlay);

    popupOverlay.setPosition(event.coordinate);
}

function identifyPoint(coordinates) {
    var formated = ol.coordinate.format(coordinates, '{x}, {y}', 3);

    document.getElementById('popup').innerHTML =
        '<div class="ol-popup-actions">' +
            '<button onclick="closePopup()" type="button" title="Fechar" class="btn btn-outline-danger ol-popup-close" style="width: 25px; height: 25px; padding: 0;">' +
                '<i class="material-icons">close</i>' +
            '</button>' +
        '</div>' +
        '<div class="ol-popup-content">' +
            '<div class="input-group">' +
                '<div class="input-group-prepend ol-popup-zoom">' +
                    '<div onclick="zoomToCoords([' + coordinates + '])" title="Zoom para" class="input-group-text">' +
                        '<i class="fas fa-search-plus"></i>' +
                    '</div>' +
                '</div>' +
                '<input type="text" value="' + formated + '" class="form-control">' +
            '</div>'
        '</div>';
}

function identifyFeatures(features) {
    // More than 1 feature
    if (features.length > 1) {
        document.getElementById('popup').innerHTML = '';

        var container = document.createElement('div');
        var count = document.createElement('span');

        container.id = 'popupPagination';

        count.classList = 'ml-2 mt-2';
        count.innerText = 'de ' + features.length;

        features.forEach(function(feature) {
            var geometry = feature.getGeometry();
            var type = geometry.getType();
            var originalCoordinates;

            if (type === 'Circle') {
                originalCoordinates = geometry.getCenter();
            }
            else if (type === 'Polygon') {
                flatCoordinates = geometry.getInteriorPoint().flatCoordinates
                originalCoordinates = [flatCoordinates[0], flatCoordinates[1]];
            }
            else {
                originalCoordinates = geometry.getCoordinates();
            }

            var coordinates = ol.proj.transform(originalCoordinates, 'EPSG:3857', 'EPSG:4326'); 
            var formated = ol.coordinate.format(coordinates, '{x}, {y}', 3);

            $(container).append(
                '<div class="ol-popup-pagination">' +
                    '<div class="ol-popup-actions">' +
                        '<button onclick="closePopup()" type="button" title="Fechar" class="btn btn-outline-danger ol-popup-close" style="width: 25px; height: 25px; padding: 0;">' +
                            '<i class="material-icons">close</i>' +
                        '</button>' +
                    '</div>' +
                    '<div class="ol-popup-content">' +
                        '<div class="input-group">' +
                            '<div class="input-group-prepend ol-popup-zoom">' +
                                '<div onclick="zoomToCoords([' + coordinates + '])" title="Zoom para" class="input-group-text">' +
                                    '<i class="fas fa-search-plus"></i>' +
                                '</div>' +
                            '</div>' +
                            '<input type="text" value="' + formated + '" class="form-control">' +
                        '</div>' +
                        '<div class="input-group">' +
                            '<div class="input-group-prepend ol-popup-geometry" title="Geometria">' +
                                '<div class="input-group-text">' +
                                    '<i class="' + setGeometryIcon(type) + '"></i>' +
                                '</div>' +
                            '</div>' +
                            '<input type="text" value="' + translateGeometry(type) + '" class="form-control">' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );
        });

        $('#popup').append(container);
        
        $('#popupPagination').easyPaginate({
            paginateElement: '.ol-popup-pagination',
            elementsPerPage: 1,
            firstButton: false,
            lastButton: false
        });
        
        $('.easyPaginateNav').append(count);
    }
    // 1 feature
    else {
        var geometry = features[0].getGeometry();
        var type = geometry.getType();
        var originalCoordinates;

        if (type === 'Circle') {
            originalCoordinates = geometry.getCenter();
        }
        else if (type === 'Polygon') {
            flatCoordinates = geometry.getInteriorPoint().flatCoordinates
            originalCoordinates = [flatCoordinates[0], flatCoordinates[1]];
        }
        else if (type === 'LineString') {
            var extent = geometry.getExtent();
            originalCoordinates = ol.extent.getCenter(extent);
        }
        else {
            originalCoordinates = geometry.getCoordinates();
        }

        var coordinates = ol.proj.transform(originalCoordinates, 'EPSG:3857', 'EPSG:4326'); 
        var formated = ol.coordinate.format(coordinates, '{x}, {y}', 3);

        document.getElementById('popup').innerHTML =
            '<div class="ol-popup-actions">' +
                '<button onclick="closePopup()" type="button" title="Fechar" class="btn btn-outline-danger ol-popup-close" style="width: 25px; height: 25px; padding: 0;">' +
                    '<i class="material-icons">close</i>' +
                '</button>' +
            '</div>' +
            '<div class="ol-popup-content">' +
                '<div class="input-group">' +
                    '<div class="input-group-prepend ol-popup-zoom" title="Zoom para">' +
                        '<div onclick="zoomToCoords([' + coordinates + '])" class="input-group-text">' +
                            '<i class="fas fa-search-plus"></i>' +
                        '</div>' +
                    '</div>' +
                    '<input type="text" value="' + formated + '" class="form-control">' +
                '</div>' +
                '<div class="input-group">' +
                    '<div class="input-group-prepend ol-popup-geometry" title="Geometria">' +
                        '<div class="input-group-text">' +
                            '<i class="' + setGeometryIcon(type) + '"></i>' +
                        '</div>' +
                    '</div>' +
                    '<input type="text" value="' + translateGeometry(type) + '" class="form-control">' +
                '</div>' +
            '</div>';
    }
}

function zoomToCoords(coordinates) {
    var lat = parseFloat(coordinates[0]);
    var lon = parseFloat(coordinates[1]);
    var coordinate = ol.proj.transform([lat, lon], 'EPSG:4326', 'EPSG:3857');
    popupOverlay.setPosition(coordinate);
    viewCenter(coordinate, 2000, 17);
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
        $(target).closest('.dropdown').find('.tool').addClass('active');
        
        document.getElementById('map').style.cursor = 'pointer';

        select.set('multi', false);

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
        $(target).closest('.dropdown').find('.tool').addClass('active');
        
        document.getElementById('map').style.cursor = 'grab';

        select.set('multi', true);

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
        $(target).closest('.dropdown').find('.tool').addClass('active');
        
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
        $(target).closest('.dropdown').find('.tool').addClass('active');

        draw = new ol.interaction.Draw({
            source: drawSource,
            type: type,
            freehand: freehand
        });
    
        map.addInteraction(draw);

        createTooltip('Clique para começar a desenhar');

        draw.on('drawstart', function() {
            map.removeOverlay(tooltipOverlay);
        });

        draw.on('drawend', function(data) {
            data.feature.set('type', 'draw');
        });
    }
}

function enableShapeDraw(target, type) {
    if (target.classList.contains('active')) {
        removeInteractions();
    }
    else {
        removeInteractions();

        target.classList.add('active');
        // Parent
        $(target).closest('.dropdown').find('.tool').addClass('active');

        var geometryFunction;

        if (type === 'Square') {
            geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
        }
        else if (type === 'Star') {
            geometryFunction = function(coordinates, geometry) {
                var center = coordinates[0];
                var last = coordinates[1];
                var dx = center[0] - last[0];
                var dy = center[1] - last[1];
                var radius = Math.sqrt(dx * dx + dy * dy);
                var rotation = Math.atan2(dy, dx);
                var newCoordinates = [];
                var numPoints = 12;

                for (var i = 0; i < numPoints; ++i) {
                    var angle = rotation + i * 2 * Math.PI / numPoints;
                    var fraction = i % 2 === 0 ? 1 : 0.5;
                    var offsetX = radius * fraction * Math.cos(angle);
                    var offsetY = radius * fraction * Math.sin(angle);
                    newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
                }

                newCoordinates.push(newCoordinates[0].slice());

                if (!geometry) {
                    geometry = new ol.geom.Polygon([newCoordinates]);
                } 
                else {
                    geometry.setCoordinates([newCoordinates]);
                }
                return geometry;
            };
        }

        draw = new ol.interaction.Draw({
            source: drawSource,
            type: 'Circle',
            geometryFunction: geometryFunction
        });

        map.addInteraction(draw);

        createTooltip('Clique para começar desenhar a forma');

        draw.on('drawstart', function() {
            map.removeOverlay(tooltipOverlay);
        });

        draw.on('drawend', function(data) {
            data.feature.set('type', 'draw');
        });
    }
}

function clearDraw() {
    if (confirm('Tem certeza?\nEssa ação irá excluir todos os desenhos')) {
        drawSource.clear();
    }
}

function toggleFreehand(checked) {
    freehand = checked;
}

// Measure
function enableMeasure(target, type) {
    if (target.classList.contains('active')) {
        removeInteractions();
    }
    else {
        removeInteractions();

        target.classList.add('active');
        // Parent
        $(target).closest('.dropdown').find('.tool').addClass('active');

        measure = new ol.interaction.Draw({
            source: measureSource,
            type: type,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    })
                })
            })
        });
    
        map.addInteraction(measure);

        createMeasureTooltip();
        createTooltip('Clique para começar a medir');

        var listener;

        measure.on('drawstart', function(evt) {
            map.removeOverlay(tooltipOverlay);

            var sketch = evt.feature;
            var tooltipCoord = evt.coordinate;

            listener = sketch.getGeometry().on('change', function(evt) {
                var geom = evt.target;
                var output;
                if (geom instanceof ol.geom.Polygon) {
                    output = formatArea(geom);
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } 
                else if (geom instanceof ol.geom.LineString) {
                    output = formatLength(geom);
                    tooltipCoord = geom.getLastCoordinate();
                }

                measureTooltipElement.innerHTML = output;
                measureTooltip.setPosition(tooltipCoord);
            });
        });

        measure.on('drawend', function(data) {
            data.feature.set('type', 'measure');
            data.feature.set('label', measureTooltipElement.innerHTML);

            measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
            measureTooltip.setOffset([0, -7]);
            // unset sketch
            sketch = null;
            // unset tooltip so that a new one can be created
            measureTooltipElement = null;

            createMeasureTooltip();

            ol.Observable.unByKey(listener);
        });
    }
}

function formatLength(line) {
    var length = ol.sphere.getLength(line);
    var output;
    if (length > 100) {
      output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
    } 
    else {
      output = (Math.round(length * 100) / 100) + ' ' + 'm';
    }
    return output;
}

function formatArea(polygon) {
    var area = ol.sphere.getArea(polygon);
    var output;
    if (area > 10000) {
        output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
    }
    else {
        output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
    }
    return output;
}

function clearMeasure() {
    if (confirm('Tem certeza?\nEssa ação irá excluir todos as medições')) {
        measureSource.clear();
        $('.ol-tooltip-static').closest('.ol-overlay-container').remove();
    }
}

// Print
function print(e) {
    e.preventDefault();

    var type = document.getElementById('printType').value;

    // export options for html-to-image.
    // See: https://github.com/bubkoo/html-to-image#options
    var options = {
        filter: function(element) {
            return element.className ? element.className.indexOf('ol-overlaycontainer-stopevent') === -1 : true;
        }
    };

    if (type === 'pdf') {
        printPDF(options);
    }
    else {
        printPNG(options);
    }
}

function printPDF(options) {
    var btn = document.getElementById('printBtn');

    btn.disabled = true;
    btn.innerText = 'Carregando...';
    document.body.style.cursor = 'progress';

    var format = document.getElementById('printFormat').value;
    var resolution = document.getElementById('printResolution').value;
    var dims = {
        a0: [1189, 841],
        a1: [841, 594],
        a2: [594, 420],
        a3: [420, 297],
        a4: [297, 210],
        a5: [210, 148]
    };
    var dim = dims[format];
    var width = Math.round(dim[0] * resolution / 25.4);
    var height = Math.round(dim[1] * resolution / 25.4);
    var size = map.getSize();
    var viewResolution = map.getView().getResolution();
    var printSize = [width, height];
    var scaling = Math.min(width / size[0], height / size[1]);

    map.once('rendercomplete', function() {
        options.width = width;
        options.height = height;
        domtoimage.toJpeg(map.getViewport(), options).then(function(dataUrl) {
            var pdf = new jsPDF('landscape', undefined, format);
            pdf.addImage(dataUrl, 'JPEG', 0, 0, dim[0], dim[1]);
            pdf.save('map.pdf');
            // Reset original map size
            map.setSize(size);
            map.getView().setResolution(viewResolution);
            btn.disabled = false;
            btn.innerText = 'Imprimir';
            document.body.style.cursor = 'auto';
        });
    });

    // Set print size
    map.setSize(printSize);
    map.getView().setResolution(viewResolution / scaling);
}

function printPNG(options) {
    map.once('rendercomplete', function() {
        domtoimage.toPng(map.getTargetElement(), options).then(function(dataURL) {
            var link = document.createElement('a');
            link.download = 'map.png';
            link.href = dataURL;
            link.click();
            link.remove();
        });
    });
    map.renderSync();
}

function changePrintFormat(format) {
    if (format == 'png') {
        $('#printFormat').closest('.form-group').hide();
        $('#printResolution').closest('.form-group').hide();
    }
    else {
        $('#printFormat').closest('.form-group').show();
        $('#printResolution').closest('.form-group').show();
    }
}

// Geolocation
function enableGeolocation() {
    var icon = document.getElementById('geolocationIcon');

    if (icon.textContent.includes('gps_off')) {
        geolocation.setTracking(true);
        geolocationVector.getSource().addFeatures([
            accuracyFeature,
            positionFeature
        ]);
        icon.innerHTML = 'gps_fixed';
    }
    else {
        geolocation.setTracking(false);
        geolocationVector.getSource().removeFeature(accuracyFeature);
        geolocationVector.getSource().removeFeature(positionFeature);
        icon.innerHTML = 'gps_off';
    } 
}

// Features
function addMarker() {
    var marker = new ol.Feature({
        geometry: new ol.geom.Point(center),
        type: 'marker'
    });

    var style = new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 0.9],
          src: 'images/marker.png'
        })
    });

    marker.setStyle(style);

    markerSource.addFeature(marker);
}

function exportFeatures(e) {
    e.preventDefault();

    var format = document.getElementById('exportFormat').value; // Captura o formato pelo campo do formulário
    var draw = document.getElementById('exportDrawSwitch').checked; // Captura como boleano o campo selecionado no formulário
    var measure = document.getElementById('exportMeasureSwitch').checked;
    var marker = document.getElementById('exportMarkerSwitch').checked;
    var writer; // Inicia um gravador global
    var features = []; // Inicia um array global de feições

    // Validação de formatos
    if (format === 'geojson') {
        writer = new ol.format.GeoJSON(); // Inicia um leitor GeoJSON
    }
    else if (format === 'kml') {
        writer = new ol.format.KML(); // Inicia um leitor KML
    }

    // Grava todas as feições no array global
    // Se for selecionado desenhos
    if (draw) {
        features.push(drawSource.getFeatures()); // Grava todas as feições de desenho no array global
    }
    // Se for selecionado medições
    if (measure) {
        features.push(measureSource.getFeatures()); // Grava todas as feições de medição no array global
    }
    // Se for selecionado marcadores
    if (marker) {
        features.push(markerSource.getFeatures()); // Grava todas as feições de desenho no array global
    }

    // Se existir feições no array
    if (features.length) {
        var output = writer.writeFeatures(features.flat()); // Grava os arrays em um array só
        var data = new Blob([output]); // Cria um arquivo de feições
        var link = document.createElement('a'); // Cria um link no HTML

        link.download = 'features.' + format; // Atribuí um nome ao link
        link.href = URL.createObjectURL(data); // Atribuí uma URL para o link
        link.click(); // Clica no link
        link.remove(); // Deleta o link do HTML
    }
}

function importFeatures(e) {
    var file = e.target.files[0]; // Captura o arquivo físico do campo
    var ext = file.name.split('.').pop();
    var reader = new FileReader(); // Inicia um leitor de arquivos

    reader.readAsDataURL(file); // Lê o arquivo
    reader.onload = readed; // Ao carregar arquivo, chama uma função  

    function readed() {
        if (ext === 'geojson') {
            importGeojsonFeatures(reader.result);
        }
        else if (ext === 'kml') {
            importKmlFeatures(reader.result);
        }
    }

    e.target.value = '';
}

function importGeojsonFeatures(result) {
    // Lê o resultado como JSON utilizando jQuery
    $.getJSON(result, function(data) {
        var extent;

        data.features.forEach(function(feature) {
            var type = feature.properties.type; // Captura o tipo de feição

            // Se existir desenhos
            if (type === 'draw') {
                var draw = new ol.format.GeoJSON().readFeature(feature); // Lê a feição como GeoJSON

                drawSource.addFeature(draw); // Adiciona desenho na fonte

                extent = drawSource.getExtent(); // Captura a extensão da fonte dos desenhos
            }
            // Se existir medições
            if (type === 'measure') {
                var measure = new ol.format.GeoJSON().readFeature(feature); // Lê a feição como GeoJSON
                var geom = measure.getGeometry();
                var output;

                measureSource.addFeature(measure); // Adiciona medição na fonte
                
                createMeasureTooltip();

                if (geom instanceof ol.geom.Polygon) {
                    output = formatArea(geom);
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } 
                else if (geom instanceof ol.geom.LineString) {
                    output = formatLength(geom);
                    tooltipCoord = geom.getLastCoordinate();
                }

                measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
                measureTooltipElement.innerHTML = output;

                measureTooltip.setPosition(tooltipCoord);
                measureTooltip.setOffset([0, -7]);

                measureTooltipElement = null;

                extent = measureSource.getExtent(); // Captura a extensão da fonte das medições
            }
            // Se existir marcadores
            if (type === 'marker') {
                var marker = new ol.format.GeoJSON().readFeature(feature); // Lê a feição como GeoJSON
                var style = new ol.style.Style({
                    image: new ol.style.Icon({
                      anchor: [0.5, 0.9],
                      src: 'images/marker.png'
                    })
                });
            
                marker.setStyle(style);

                markerSource.addFeature(marker); // Adiciona marcador na fonte

                extent = markerSource.getExtent(); // Captura a extensão da fonte dos marcadores
            }
        });

        var lon = extent[(extent.length / 2)]; // Divide todas as coordenadas do array de extensão por 2
        var lat = extent[(extent.length / 2) - 1]; // Divide todas as coordenadas do array de extensão por 2 e volta uma posição
        var center = [lon, lat]; // Concatena a longitude com latitude em formato de coordenada [x, y]

        viewCenter(center, 0, 7); // Centraliza a view nessas coordenadas, animação 0ms, zoom 7
    });
}

// TODO
function importKmlFeatures(result) {
}

function deleteFeature() {
    if (confirm('Tem certeza?\nEssa ação irá excluir a feição selecionada')) {
        var feature = selectedFeatures.getArray()[0];
        var type = feature.get('type');

        if (type === 'draw') {
            drawSource.removeFeature(feature);
        }
        else if (type === 'measure') {
            var geom = feature.getGeometry();
            var tooltipCoord;

            if (geom instanceof ol.geom.Polygon) {
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } 
            else if (geom instanceof ol.geom.LineString) {
                tooltipCoord = geom.getLastCoordinate();
            }

            map.getOverlays().forEach(function(overlay) {
                if (overlay) { 
                    var position = overlay.getPosition();

                    if (JSON.stringify(position) === JSON.stringify(tooltipCoord)) {
                        measureSource.removeFeature(feature);
                        map.removeOverlay(overlay);
                    }
                }
            });
        }
        else if (type === 'marker') {
            markerSource.removeFeature(feature);
        }

        map.removeOverlay(tooltipOverlay);
    }
}

function deleteFeatures() {
    if (confirm('Tem certeza?\nEssa ação irá excluir as feições selecionadas')) {
        selectedFeatures.forEach(function(feature) {
            var type = feature.get('type');
            
            if (type === 'draw') {
                drawSource.removeFeature(feature);
            }
            else if (type === 'measure') {
                var geom = feature.getGeometry();
                var tooltipCoord;

                if (geom instanceof ol.geom.Polygon) {
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } 
                else if (geom instanceof ol.geom.LineString) {
                    tooltipCoord = geom.getLastCoordinate();
                }

                map.getOverlays().forEach(function(overlay) {
                    if (overlay) { 
                        var position = overlay.getPosition();

                        if (JSON.stringify(position) === JSON.stringify(tooltipCoord)) {
                            measureSource.removeFeature(feature);
                            map.removeOverlay(overlay);
                        }
                    }
                });
            }
            else if (type === 'marker') {
                markerSource.removeFeature(feature);
            }
        });
        
        map.removeOverlay(tooltipOverlay);
    }
}

// Utils
function createTooltip(html) {
    tooltipOverlay.element.innerHTML = html;
    map.addOverlay(tooltipOverlay);
}

function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        position: [0, 0],
        positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);
}

function toggleTooltips(checked) {
    if (checked) {
        tooltipOverlay.element.classList.remove('d-none');
    }
    else {
        tooltipOverlay.element.classList.add('d-none');
    }
}

function toggleLabels(checked) {
    if (checked) {
        $('.ol-tooltip-static').show();
    }
    else {
        $('.ol-tooltip-static').hide();
    }
}

function toggleFeatures(checked) {
    if (checked) {
        drawVector.setVisible(true);
        measureVector.setVisible(true);
        geolocationVector.setVisible(true);
    }
    else {
        drawVector.setVisible(false);
        measureVector.setVisible(false);
        geolocationVector.setVisible(false);
    } 
}

function toggleMarkers(checked) {
    if (checked) {
        markerVector.setVisible(true);
    }
    else {
        markerVector.setVisible(false);
    } 
}

function removeInteractions() {
    $('.tool, .dropdown-item').removeClass('active');

    document.getElementById('map').style.cursor = 'default';

    map.removeInteraction(select);
    map.removeInteraction(modify);
    map.removeInteraction(dragBox);
    map.removeInteraction(draw);
    map.removeInteraction(measure);

    map.removeOverlay(tooltipOverlay);

    map.un('singleclick', identify);
}

function translateGeometry(type) {
    var result;
    switch (type) {
        case 'Polygon':
            result = 'Polígono';
            break;
        case 'Circle':
            result = 'Círculo';
            break;
        case 'LineString':
            result = 'Linha';
            break;
        case 'Anel Linear':
            result = '';
            break;
        case 'MultiLineString':
            result = 'Múltiplas Linhas';
            break;
        case 'MultiPoint':
            result = 'Múltiplos Pontos';
            break;
        case 'MultiPolygon':
            result = 'Múltiplos Polígonos';
            break;
        case 'Point':
            result = 'Ponto';
            break;
        case 'SimpleGeometry':
            result = 'Simples';
            break;
    }
    return result;
}

function setGeometryIcon(type) {
    var icon;
    switch (type) {
        case 'Polygon':
            icon = 'fas fa-draw-polygon';
            break;
        case 'Circle':
            icon = 'far fa-circle';
            break;
        case 'LineString':
            icon = 'fas fa-minus';
            break;
        case 'Anel Linear':
            icon = 'far fa-circle';
            break;
        case 'MultiLineString':
            icon = 'fas fa-grip-lines';
            break;
        case 'MultiPoint':
            icon = 'fas fa-spinner';
            break;
        case 'MultiPolygon':
            icon = 'fas fa-draw-polygon';
            break;
        case 'Point':
            icon = 'fas fa-circle';
            break;
        case 'SimpleGeometry':
            icon = 'far fa-square';
            break;
    }
    return icon;
}

function ajaxRequest(type, url, data) {
    return $.ajax({
        type: type,
        url: url,
        data: data,
        beforeSend: function (request) {
            console.info('.. REQUESTING ..');
            console.log(request);
        },
        success: function(response) {
            console.info('* SUCCESS *');
            console.log(response);
        },
        error: function(error) {
            console.info('! ERROR !');
            console.log(error);
        }
    });
}