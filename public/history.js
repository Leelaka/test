let map;
let mapLong = 144.946457;
let mapLat = -37.840935;
let userLat = -37.840935;
let userLong = 144.946457;
let mapZoom=12;
let dup_history_data;
let marker_array=[]

$(document).ready(function () {

  // if (navigator.geolocation)
  // {
  //   navigator.geolocation.getCurrentPosition(function(position){
  //     userLat = position.coords.latitude;
  //     userLong = position.coords.longitude;
  //   });


    
  // }else{
  //   alert('Geo location is not supported');
  // }
  
  
})

function initMap() {
  const markerArray = [];
  // Instantiate a directions service.
  const directionsService = new google.maps.DirectionsService();
  // Create a map and center it on Manhattan.
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: parseFloat(mapZoom),
    center: { lat: parseFloat(mapLat), lng: parseFloat(mapLong) },
    streetViewControl:false,
  });

  for(var i=0;i<dup_history_data.length;i++)
  {
    //console.log(parseFloat(dup_history_data[i]['lat']));
    var hLatLng= new google.maps.LatLng(parseFloat(dup_history_data[i]['lat']),parseFloat(dup_history_data[i]['lon']));
    marker=new google.maps.Marker({
      position: hLatLng,
      icon:'images/opts.png',
      title: 'Duration: '+dup_history_data[i]['duration'],
      map,
      label:{fontSize:'11px',text:dup_history_data[i]['bay_id'].toString()},         
    });
    marker_array.push(marker);
  }

  google.maps.event.clearListeners(map);
  /* var myLatLng = new google.maps.LatLng(-37.840935, 144.946457);
  new google.maps.Marker({
    position: myLatLng,
    icon:"/images/yous.png",
    map,
    title: 'hello',            
  }); */
  // Create a renderer for directions and bind it to the map.
  /* const directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
  // Instantiate an info window to hold step text.
  const stepDisplay = new google.maps.InfoWindow();
  // Display the route between the initial start and end selections.
  calculateAndDisplayRoute(
    directionsRenderer,
    directionsService,
    markerArray,
    stepDisplay,
    map
  );

  // Listen to change events from the start and end lists.
  const onChangeHandler = function () {
    calculateAndDisplayRoute(
      directionsRenderer,
      directionsService,
      markerArray,
      stepDisplay,
      map
    );
  };
 */

  //document.getElementById("start").addEventListener("change", onChangeHandler);
  //document.getElementById("end").addEventListener("change", onChangeHandler);

  
}

function zoomTolocation(loc_index)
{
  //var bounds=new google.maps.LatLngBounds();
  //map.fitBounds(bounds);
  map.setZoom(15);
  marker_array[loc_index].setTitle('Duration: '+dup_history_data[loc_index]['duration']);
  map.panTo(marker_array[loc_index].position);
}

function setHistoryData(historydata)
{
  dup_history_data=historydata;
}

function addBayMarker(lat,lon)
{
  console.log(lat);
  console.log(lon);
  var marker=new google.maps.Marker({
    position:new google.maps.LatLng(parseFloat(lat),parseFloat(lon)),
    icon:"/images/yous.png",
    title:"bay",
    map: map,
  });
}

function calculateAndDisplayRoute(
  directionsRenderer,
  directionsService,
  markerArray,
  stepDisplay,
  map
) {
  // First, remove any existing markers from the map.
  for (let i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(null);
  }
  // Retrieve the start and end locations and create a DirectionsRequest using
  // WALKING directions.
  directionsService.route(
    {
      origin: document.getElementById("start").value,
      destination: document.getElementById("end").value,
      travelMode: google.maps.TravelMode.WALKING,
    },
    (result, status) => {
      // Route the directions and pass the response to a function to create
      // markers for each step.
      if (status === "OK" && result) {
        document.getElementById("warnings-panel").innerHTML =
          "<b>" + result.routes[0].warnings + "</b>";
        directionsRenderer.setDirections(result);
        showSteps(result, markerArray, stepDisplay, map);
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
}

function showSteps(directionResult, markerArray, stepDisplay, map) {
  // For each step, place a marker, and add the text to the marker's infowindow.
  // Also attach the marker to an array so we can keep track of it and remove it
  // when calculating new routes.
  const myRoute = directionResult.routes[0].legs[0];

  for (let i = 0; i < myRoute.steps.length; i++) {
    const marker = (markerArray[i] =
      markerArray[i] || new google.maps.Marker());
    marker.setMap(map);
    marker.setPosition(myRoute.steps[i].start_location);
    attachInstructionText(
      stepDisplay,
      marker,
      myRoute.steps[i].instructions,
      map
    );
  }
}

function attachInstructionText(stepDisplay, marker, text, map) {
  google.maps.event.addListener(marker, "click", () => {
    // Open an info window when the marker is clicked on, containing the text
    // of the step.
    stepDisplay.setContent(text);
    stepDisplay.open(map, marker);
  });
}