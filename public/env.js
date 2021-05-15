let map;
let mapLong = 144.946457;
let mapLat = -37.840935;
let userLat = -37.840935;
let userLong = 144.946457;
let mapZoom=12;
let calculateDistanceFunctionUrl='https://us-south.functions.appdomain.cloud/api/v1/web/ruwanganath%40hotmail.com_dev/default/getDistanceToParkingSpot'

$(document).ready(function () {
  
  $("#suburblist").change(function(){
 
    if(this.value==='non'){
      mapLong =  144.946457;
      mapLat = -37.840935;
    }else if(this.value==='carlton'){
      mapLong =  144.969861;
      mapLat = -37.801047;
    }else if(this.value==='carltonnorth'){
      mapLong =  144.973236;
      mapLat = -37.784553;
    }else if(this.value==='docklands'){
      mapLong =  144.946014;
      mapLat = -37.815018;
    }else if(this.value==='eastmelbourne'){
      mapLong =  144.9850;
      mapLat = -37.8130;
    }else if(this.value==='flemington'){
      mapLong =  144.9277;
      mapLat = -37.7833;
    }else if(this.value==='kensington'){
      mapLong =  144.9277;
      mapLat = -37.7941;
    }else if(this.value==='melb3000'){
      mapLong =  144.9639;
      mapLat = -37.8152;
    }else if(this.value==='melb3004'){
      mapLong =  144.9805;
      mapLat = -37.8302;
    }else if(this.value==='northmelb'){
      mapLong =  144.96667;
      mapLat = -37.8;
    }else if(this.value==='parkville'){
      mapLong =  144.95;
      mapLat = -37.78333;
    }else if(this.value==='portmelb'){
      mapLong =  144.94228;
      mapLat = -37.83961;
    }else if(this.value==='southwarf'){
      mapLong =  144.9520;
      mapLat = -37.8250;
    }else if(this.value==='southyarra'){
      mapLong =  144.9805;
      mapLat = -37.8302;
    }else if(this.value==='southbank'){
      mapLong =  144.96434;
      mapLat = -37.8228;
    }else if(this.value==='westmelb'){
      mapLong =  144.9291;
      mapLat = -37.8089;
    } 
    map.zoom = 15;
    map.panTo({ lat: parseFloat(mapLat), lng: parseFloat(mapLong)}) 
  }); 

  $( "#btn-info1" ).click(function() {
    setTimeout(()=>{
      mapLong = document.getElementById("info1-lon").value
      mapLat = document.getElementById("info1-lat").value
      map.zoom = 15;
      map.panTo({ lat: parseFloat(mapLat), lng: parseFloat(mapLong)}) 
    }, 1000);   
  });
  $( "#btn-info2" ).click(function() {
    setTimeout(()=>{
      mapLong = document.getElementById("info2-lon").value
      mapLat = document.getElementById("info2-lat").value
      map.zoom = 15;
    map.panTo({ lat: parseFloat(mapLat), lng: parseFloat(mapLong)}) 
    }, 1000);  
  });
  $( "#btn-info3" ).click(function() {
    setTimeout(()=>{
      mapLong = document.getElementById("info3-lon").value
      mapLat = document.getElementById("info3-lat").value
      map.zoom = 15;
      map.panTo({ lat: parseFloat(mapLat), lng: parseFloat(mapLong)}) 
    }, 1000);  
  });
  $( "#btn-info4" ).click(function() {
    setTimeout(()=>{
      mapLong = document.getElementById("info4-lon").value
      mapLat = document.getElementById("info4-lat").value
      map.zoom = 15;
      map.panTo({ lat: parseFloat(mapLat), lng: parseFloat(mapLong)}) 
    }, 1000);  
  });
  $( "#btn-info5" ).click(function() {
    setTimeout(()=>{
      mapLong = document.getElementById("info5-lon").value
      mapLat = document.getElementById("info5-lat").value
      map.zoom = 15;
      map.panTo({ lat: parseFloat(mapLat), lng: parseFloat(mapLong)}) 
    }, 1000);  
  });

  $( "#btn-viewme" ).click(function() {
      getUserCurrentLocation();
      map.zoom = 15;
      map.panTo({ lat: parseFloat(userLat), lng: parseFloat(userLong)}) 
  });

   initParkingInfoPanel();
})

initMap = function () {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: parseFloat(mapLat), lng: parseFloat(mapLong) },
      zoom: parseFloat(mapZoom),
      streetViewControl:false,
      mapTypeControl: false,
      styles:[
        {
          featureType: "poi.business",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }],
        },
      ],
    });
    

  let socket = io();

    //listening to update map with available parking data using sockets    
    socket.on('initiate_map',  (data) => {
      console.log(data)
      getUserCurrentLocation(userLat,userLong)
      //updating available parking data
       getUpdatedAvailableParkingData(userLat,userLong)
    })

    //listening to update map with available parking data using sockets    
    socket.on('update_map',  (data) => {
      console.log(data)
      getUserCurrentLocation(userLat,userLong)
      //updating available parking data
       getUpdatedAvailableParkingData(userLat,userLong)
    })
 }


//seting up user current location on the map function
 getUserCurrentLocation = function (userLat,userLong){

    if (navigator.geolocation)
    {
      navigator.geolocation.getCurrentPosition(function(position){
        userLat = position.coords.latitude;
        userLong = position.coords.longitude;
      });
      
    }else{
      alert('Geo location is not supported');
    }
    //setting up user marker
    let userLatLng = { lat: parseFloat(userLat), lng: parseFloat(userLong)};
    new google.maps.Marker({
      position: userLatLng,
      icon: "/images/yous.png",
      map,
      title: 'Your Current Location',            
    });
 }

//setting up available parking spot markers on the map function
getUpdatedAvailableParkingData = function(userLat,userLong){
 
  $.ajax({
    url: '/getAllAvailableParkingData',
    method: "GET",
    success: function(data) {

      let arrayNearestParking = [];
      jsonData = JSON.parse(data);
      var keys = Object.keys(jsonData);

      keys.forEach(function(key){
          let myLatLng = { lat: parseFloat(jsonData[key].lat), lng: parseFloat(jsonData[key].lon)};
          let custIcon='';
          if(jsonData[key].type ==='on'){
            custIcon = "/images/ons.png";
          }else if(jsonData[key].type === 'off'){
            custIcon = "/images/offs.png";
          }else{
            custIcon = "/images/opts.png";
          }
            
          new google.maps.Marker({
            position: myLatLng,
            icon: custIcon,
            map,
            title: 'Bay/Base Property - '+jsonData[key].bay+' - '+jsonData[key].type+'-Street Parking',            
          });        

          /*
          $.ajax({
            url: calculateDistanceFunctionUrl+"?userLatitude="+userLat+"&userLongitude="+userLong+"&parkingLat="+parseFloat(jsonData[key].lat)+"&parkingLon="+parseFloat(jsonData[key].lon),
            method: "GET",
            success: function(data) {
              data = JSON.stringify(data);
              data = JSON.parse(data);            
              let object = {distance: data.dist , type: jsonData[key].type, bay:jsonData[key].bay, rate:'4.00', lat:jsonData[key].lat, lon:jsonData[key].lon , desc1:jsonData[key].desc1, desc2:jsonData[key].desc2}
              arrayNearestParking.push(object); 
            }      
          }).done(function(){
              arrayNearestParking = sortJsonObjectArrayByKey(arrayNearestParking, 'distance');   
              updateParkingList(arrayNearestParking);
              updateParkingInfoPanel(arrayNearestParking);
          })*/
      });
        arrayNearestParking = getNearestParkingSpots(parseFloat(userLat),parseFloat(userLong),data)
        updateParkingList(arrayNearestParking);
        updateParkingInfoPanel(arrayNearestParking);
    }
  });
}

// create an array to store nearset parking spots and sort by the distance to ascending order
// nearset parking spot will be on the top of the array
getNearestParkingSpots = function (userLatitude,userLongitude,data){

  let arrayParkingWithDistance= [];
  let jsonData = JSON.parse(data);
  let keys = Object.keys(jsonData);
  let dis=0;

  keys.forEach(function(key){
    dis = calculateDistance( parseFloat(userLatitude),  parseFloat(userLongitude) , parseFloat(jsonData[key].lat), parseFloat(jsonData[key].lon))
     let object = {distance:dis , type:jsonData[key].type, bay:jsonData[key].bay, rate:'Rate per Hour $4.00',lat:jsonData[key].lat, lon:jsonData[key].lon , desc1:jsonData[key].desc1, desc2:jsonData[key].desc2}
     arrayParkingWithDistance.push(object);    
  })

  arrayParkingWithDistance = sortJsonObjectArrayByKey(arrayParkingWithDistance, 'distance');
  return arrayParkingWithDistance;
}


//function to calculate distance between to geo locations in Kilometers
calculateDistance = function (userLatitude, userLongitude, parkingLat, parkingLon) {
  var userRadlLat = Math.PI * userLatitude/180;
  var parkingRadlat = Math.PI * parkingLat/180;
  var theta = userLongitude-parkingLon;
  var radtheta = Math.PI * theta/180;
  var dist = Math.sin(userRadlLat) * Math.sin(parkingRadlat) + Math.cos(userRadlLat) * Math.cos(parkingRadlat) * Math.cos(radtheta);
  if (dist > 1) {
      dist = 1;
  }
  dist = Math.acos(dist);
  dist = dist * 180/Math.PI;
  dist = dist * 60 * 1.1515;
  dist = dist * 1.609344;
  return dist
}


//function to sort json object array by a given key value
sortJsonObjectArrayByKey = function (array, key){
  return array.sort(function(valA, valB) {
  var x = valA[key]; var y = valB[key];
  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
 });
}


//function to convert json to an array
convertJsonToArray = function (json){
  var arrayOutput = [];
  var keys = Object.keys(json);
  keys.forEach(function(key){
      arrayOutput.push(json[key]);
  });
  return arrayOutput;
}

updateParkingList = function (array){
  array.forEach((element, index) => { 
     if (index===0){
        new google.maps.Marker({
          position: { lat: parseFloat(array[index].lat), lng: parseFloat(array[index].lon)},
          icon: "/images/opts.png",
          map,
          title: 'Bay/Base Property - '+array[index].bay+' - '+array[index].type+'-Street Parking',            
        });    

        $("#parking-img1").attr("src","images/opt.png");
        if(array[index].type==='on'){
          $("#parking-img12").attr("src","images/on.png");
        }else{
          $("#parking-img12").attr("src","images/off.png");
        }
     }else if(index===1){
        if(array[index].type==='on'){
          $("#parking-img2").attr("src","images/on.png");
        }else{
          $("#parking-img2").attr("src","images/off.png");
        }
     }else if(index===2){
      if(array[index].type==='on'){
        $("#parking-img3").attr("src","images/on.png");
        }else{
          $("#parking-img3").attr("src","images/off.png");
        }       
     }else if(index===3){
      if(array[index].type==='on'){
        $("#parking-img4").attr("src","images/on.png");
      }else{
        $("#parking-img4").attr("src","images/off.png");
      }       
    }else if(index===4){
      if(array[index].type==='on'){
        $("#parking-img5").attr("src","images/on.png");
      }else{
        $("#parking-img5").attr("src","images/off.png");
      }       
    }
  })
}

initParkingInfoPanel = function(){
  $("#listno").text('-');
  $("#bay").text('Bay ID - -');
  $("#rate").text('Rate per Hour $0.00');
  $("#distance").text('- KM to the Parking Spot');
  $(".timelimit").text('Parking Infomation(Time/Available Spaces)');
  $("#descone").text('-');
  $("#desctwo").text('-');
}

updateParkingInfoPanel = function (array){
let listNo;
let bay;
let rate;
let distance;
let descOne
let descTwo;

  $( "#btn-info1" ).click(function() {
    listNo = '1';
    bay = array[0].bay;
    rate = 'Rate per Hour $'+array[0].rate;
    distance = array[0].distance
    descOne = array[0].desc1;
    descTwo = array[0].desc2;
    $("#listno").text(listNo);
    $("#bay").text('Bay ID - '+bay);
    $("#rate").text(array[0].rate);
    $("#distance").text(distance.toFixed(4)+' KM to the Parking Spot');
    $(".timelimit").text('Parking Infomation(Time/Available Spaces)');
    $("#descone").text(descOne);
    $("#desctwo").text(descTwo);
    $("#info1-lat").val(array[0].lat);
    $("#info1-lon").val(array[0].lon);
    document.getElementById("navarray").value = JSON.stringify(array[0]);
    document.getElementById("navarrayindexselected").value = listNo; 
  });
  $( "#btn-info2" ).click(function() {
    listNo = '2';
    bay = array[1].bay;
    rate = 'Rate per Hour $'+array[1].rate;
    distance = array[1].distance
    descOne = array[1].desc1;
    descTwo = array[1].desc2;
    $("#listno").text(listNo);
    $("#bay").text('Bay ID - '+bay);
    $("#rate").text(array[1].rate);
    $("#distance").text(distance.toFixed(4)+' KM to the Parking Spot');
    $(".timelimit").text('Parking Infomation(Time/Available Spaces)');
    $("#descone").text(descOne);
    $("#desctwo").text(descTwo);
    $("#info2-lat").val(array[1].lat);
    $("#info2-lon").val(array[1].lon);
    document.getElementById("navarray").value = JSON.stringify(array[1]);
    document.getElementById("navarrayindexselected").value = listNo;
  });
  $( "#btn-info3" ).click(function() {
    listNo = '3';
    bay = array[2].bay;
    rate = 'Rate per Hour $'+array[2].rate;
    distance = array[2].distance
    descOne = array[2].desc1;
    descTwo = array[2].desc2;
    $("#listno").text(listNo);
    $("#bay").text('Bay ID - '+bay);
    $("#rate").text(array[2].rate);
    $("#distance").text(distance.toFixed(4)+' KM to the Parking Spot');
    $(".timelimit").text('Parking Infomation(Time/Available Spaces)');
    $("#descone").text(descOne);
    $("#desctwo").text(descTwo);
    $("#info3-lat").val(array[2].lat);
    $("#info3-lon").val(array[2].lon);
    document.getElementById("navarray").value = JSON.stringify(array[2]);
    document.getElementById("navarrayindexselected").value = listNo;
  });
  $( "#btn-info4" ).click(function() {
    listNo = '4';
    bay = array[3].bay;
    rate = 'Rate per Hour $'+array[3].rate;
    distance = array[3].distance
    descOne = array[3].desc1;
    descTwo = array[3].desc2;
    $("#listno").text(listNo);
    $("#bay").text('Bay ID - '+bay);
    $("#rate").text(array[3].rate);
    $("#distance").text(distance.toFixed(4)+' KM to the Parking Spot');
    $(".timelimit").text('Parking Infomation(Time/Available Spaces)');
    $("#descone").text(descOne);
    $("#desctwo").text(descTwo);
    $("#info4-lat").val(array[3].lat);
    $("#info4-lon").val(array[3].lon);
    document.getElementById("navarray").value = JSON.stringify(array[3]);
    document.getElementById("navarrayindexselected").value = listNo;
  });
  $( "#btn-info5" ).click(function() {
    listNo = '5';
    bay = array[4].bay;
    rate = 'Rate per Hour $'+array[4].rate;
    distance = array[4].distance
    descOne = array[4].desc1;
    descTwo = array[4].desc2;
    $("#listno").text(listNo);
    $("#bay").text('Bay ID - '+bay);
    $("#rate").text(array[4].rate);
    $("#distance").text(distance.toFixed(4)+' KM to the Parking Spot');
    $(".timelimit").text('Parking Infomation(Time/Available Spaces)');
    $("#descone").text(descOne);
    $("#desctwo").text(descTwo);
    $("#info5-lat").val(array[4].lat);
    $("#info5-lon").val(array[4].lon);
    document.getElementById("navarray").value = JSON.stringify(array[4]);
    document.getElementById("navarrayindexselected").value = listNo;
  });
}