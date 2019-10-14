///////////////////////////////////////////////////////////////////
//
//                  index Page
//
///////////////////////////////////////////////////////////////////

/**
 * Function connect
 * Get the information of the index page and transfer to the second scene
 */
function connect() {
    const url = window.location.href;
    var parts = url.split("/");
    parts[parts.length - 1] = "addPath.html?identifiant=" + document.getElementById("exampleInputFirstname").value + document.getElementById("exampleInputName").value + "&email=" + document.getElementById("exampleInputEmail1").value + "&telephone=" + document.getElementById("exampleInputPhone").value;
    window.location.href = parts.join("/");
}

window.onload = init;

///////////////////////////////////////////////////////////////////
//
//                  add Path Page
//
///////////////////////////////////////////////////////////////////

//Google Map
var map; //The Google Map Object
var marker; //The temporary clickable marker
var origin_address; //The source adress (Position of Capgemini)
var markerArray; //The Array Marker Memory of Directions

var directionsService;
var directionsRenderer;
var stepDisplay;

//Global var to get the information of database
var listPath = []

/**
 * Init Function
 */
function init() {
    var param = getParam();
    var id = document.getElementById('id');
    id.value = param.identifiant;

    var today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    date = document.getElementById('date');
    date.defaultValue = year + "-" + ("0" + month).slice(-2) + "-" + ("0" + day).slice(-2);

    const hour = today.getHours();
    const minutes = today.getMinutes();
    time = document.getElementById('time');
    time.defaultValue = ("0" + hour).slice(-2) + ":" + ("0" + minutes).slice(-2);
}

/**
 * Init the Map Object
 */
function initMap() {
    marker = false;
    origin_address = new google.maps.LatLng(48.13667064308398, -1.6226135644808437);
    markerArray = [];

    directionsService = new google.maps.DirectionsService;
    directionsRenderer = new google.maps.DirectionsRenderer;
    stepDisplay = new google.maps.InfoWindow;

    var options = {
        center: origin_address, //Set center.
        zoom: 13 //The zoom value.

    };

    //Create the map object.
    map = new google.maps.Map(document.getElementById('map'), options);
    directionsRenderer.setMap(map);
    //Listen for any clicks on the map.
    google.maps.event.addListener(map, 'click', function (event) {
        //Get the location that the user clicked.
        var clickedLocation = event.latLng;
        //If the marker hasn't been added.
        if (marker === false) {
            //Create the marker.
            marker = new google.maps.Marker({
                position: clickedLocation,
                map: map,
                draggable: true, //make it draggable
                icon: { url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" }
            });
            //Listen for drag events!
            google.maps.event.addListener(marker, 'dragend', function (event) {
                markerLocation();
            });
        } else {
            //Marker has already been added, so just change its location.
            marker.setPosition(clickedLocation);
        }
        //Update Latitude and Longitude with the new value
        var lat = document.getElementById('lat');
        lat.value = clickedLocation.lat();
        var lng = document.getElementById('lng');
        lng.value = clickedLocation.lng();
    });

    capge = new google.maps.Marker({
        position: origin_address,
        map: map,
        draggable: false, //make it draggable
        icon: { url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }
    });
}

/**
 * Function to retrieve information from index.html
 */
function getParam() {
    const params = window.location.search.substr(1).split("&");
    var out = {}
    for (var i = 0; i < params.length; i++) {
        const param = params[i].split("=");
        out[param[0]] = param[1];
    }
    return out;
}

/**
 * class Path
 * @param {*} id 
 * @param {*} lat 
 * @param {*} lng 
 * @param {*} date 
 * @param {*} time 
 */
function Path(id, lat, lng, date, time) {
    this.id = id;
    this.position = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
    this.date = date;
    this.time = time;
}

/**
 * Class to modelise a pair from a distance and an id of path
 * @param {*} index 
 * @param {*} distance 
 */
function Pair_index_distance(index, distance) {
    this.index = index;
    this.dist = distance;
}

function comparator_pair(i_d1, i_d2) {
    return (i_d2.dist - i_d1.dist);
}

/**
 * 
 * @param {*} pair_index_distance 
 */
function Car(pair_index_distance) {
    this.i_d = pair_index_distance;
    this.passengers = [];
    this.distance = 0;
    this.lastPassenger = pair_index_distance;
    this.maxDistance = pair_index_distance.dist * 1.2;
    this.numberOfPassengers = 0;
    this.maxNumberOfPassengers = 3;
    this.addPassenger = function (passenger, distance) {
        this.passengers.push(passenger);
        this.lastPassenger = passenger;
        this.distance = this.distance
            + distance;
        this.numberOfPassengers++;
    }
}



/**
 * submit the Path on Server
 */
function submitPath() {
    //Get the information from form
    var id = document.getElementById('id');
    var lat = document.getElementById('lat');
    var lng = document.getElementById('lng');
    var date = document.getElementById('date');
    var time = document.getElementById('time');

    //make the request
    requestPath(id.value, lat.value, lng.value, date.value, time.value)
}

function requestPath(id, lat, lng, date, time) {
    var m_data = "{ \"id\" : \"" + id +
        "\", \"lat\" : \"" + lat +
        "\", \"lng\" : \"" + lng +
        "\", \"date\" : \"" + date +
        "\", \"time\" : \"" + time +
        "\"}";
    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:3000/addPath",
        data: m_data,
        success: function (data) {
            requestDirection();
        }
    });
}

function requestDirection() {
    listPath = []
    var date = document.getElementById('date');
    var time = document.getElementById('time');
    $.ajax({
        type: "POST",
        url: "http://127.0.0.1:3000/getPaths",
        data: "{\"date\" : \"" + date.value +
            "\", \"time\" : \"" + time.value +
            "\"}",
        success: function (data) {
            computeDirection(data);
        }
    });
}

function computeDirection(data) {
    var json = JSON.parse(data);
    var id = document.getElementById('id');
    for (let index = 0; index < json.length; index++) {
        const element = json[index];
        if (element.id != id) {
            listPath.push(new Path(element.id, element.lat,
                element.lng, element.date,
                element.time));
        }
    }
    computeDistance();
}

function computeDistance() {
    var origins = [];
    origins[0] = origin_address;
    for (let index = 0; index < listPath.length; index++) {
        origins[index + 1] = listPath[index].position;
    }
    var destinations = origins;

    var distanceService = new google.maps.DistanceMatrixService();

    distanceService.getDistanceMatrix({
        origins: origins,
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        durationInTraffic: true,
        avoidHighways: false,
        avoidTolls: false
    },
        function (response, status) {
            if (status !== google.maps.DistanceMatrixStatus.OK) {
                console.log('Error:', status);
            } else {
                createCars(response)
            }
        });
}

function createCars(distanceMatrix) {
    function askDistance(index1, index2) {
        return distanceMatrix.rows[index1].elements[index2].distance.value;
    }
    var listPairIdDistance = [];
    var cars = [];
    //Initialize list with distance user-destination
    for (var index = 0; index < listPath.length; index++) {
        listPairIdDistance[index] = new Pair_index_distance(index, askDistance(index + 1, 0));
    }
    listPairIdDistance.sort(comparator_pair);
    for (var index = 0; index < listPairIdDistance.length; index++) {
        if (listPairIdDistance[index]) {
            var car = new Car(listPairIdDistance[index]);
            for (var index2 = index + 1; index2 < listPairIdDistance.length; index2++) {
                if (listPairIdDistance[index2]) {
                    distance_between2 = askDistance(car.lastPassenger.index + 1, listPairIdDistance[index2].index + 1)
                    if (car.distance
                        + distance_between2
                        + askDistance(index2 + 1, 0)
                        < car.maxDistance) {
                        car.addPassenger(listPairIdDistance[index2], distance_between2);
                        delete listPairIdDistance[index2];
                    }
                }
                if (car.numberOfPassengers >= car.maxNumberOfPassengers) {
                    break;
                }
            }
            cars.push(car);
        }
    }
    var id = document.getElementById('id');
    mycar = findIdInCars(id.value, cars);
    if(mycar){
        displayCar(mycar);
    }
}

function findIdInCars(id, cars) {
    for (let index = 0; index < cars.length; index++) {
        const car = cars[index];
        if (listPath[car.i_d.index].id == id) {
            return car;
        } else {
            for (let index2 = 0; index2 < car.passengers.length; index2++) {
                const passagers = car.passengers[index2];
                console.log(listPath[passagers.index].id);
                if (listPath[passagers.index].id == id) {
                    return car;
                }
            }
        }
    }
    return undefined;
}

function displayCar(car) {
    var output = document.getElementById('output');
    var data = "";
    data += "<b>Resultat : </b><br>Conducteur : " + listPath[car.i_d.index].id + "<br>";
    for (let index = 0; index < car.passengers.length; index++) {
        const element = car.passengers[index];
        data += "Passager #" + (index + 1) + " : " + listPath[element.index].id + "<br>";
    }
    output.innerHTML = data;

    deleteMarkers(markerArray);
    calculateAndDisplayRoute(directionsService, directionsRenderer, car);
}

function calculateAndDisplayRoute(directionsService, directionsRenderer, car) {
    var waypts = [];
    for (var i = 0; i < car.passengers.length; i++) {
        const element = car.passengers[i];
        waypts.push({
            location: listPath[element.index].position,
            stopover: true
        });
    }

    directionsService.route({
        origin: listPath[car.i_d.index].position,
        destination: origin_address,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function deleteMarkers(markersArray) {
    for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
    }
    markersArray = [];
}



