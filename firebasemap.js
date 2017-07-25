var firebase = new Firebase("https://userproperty-850cf.firebaseio.com");

var data = {
  sender: null,
  timestamp: null,
  lat: null,
  lng: null
};
/* 인포박스 띄우기
      function makeInfoBox(controlDiv, map) {
        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.boxShadow = 'rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px';
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '2px';
        controlUI.style.marginBottom = '22px';
        controlUI.style.marginTop = '10px';
        controlUI.style.textAlign = 'center';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '100%';
        controlText.style.padding = '6px';
        controlText.textContent = '10분동안의 클릭을 표시합니다.';
        controlUI.appendChild(controlText);
      }
*/
      /**
      * Starting point for running the program. Authenticates the user.
      * @param {function()} onAuthSuccess - Called when authentication succeeds.
      */
      function initAuthentication(onAuthSuccess) {
        firebase.authAnonymously(function(error, authData) {
          if (error) {
            console.log('Login Failed!', error);
          } else {
            data.sender = authData.uid;
            onAuthSuccess();
          }
        }, {remember: 'sessionOnly'});  // Users will get a new id for every session.
      }

      /**
       * Creates a map object with a click listener and a heatmap.
       */
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -28.024, lng: 140.887},
    zoom: 3,
    styles: [{
      featureType: 'poi',
      stylers: [{ visibility: 'off' }]  // Turn off POI.
    },
    {
      featureType: 'transit.station',
      stylers: [{ visibility: 'off' }]  // Turn off bus, train stations etc.
    }],
    disableDoubleClickZoom: true,
    streetViewControl: false,
  });

  var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var markers = locations.map(function(location, i) {
          return new google.maps.Marker({
            position: location,
            label: labels[i % labels.length]
          });
  });
  var markerCluster = new MarkerClusterer(map, markers,
    {imagePath:
      'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});



  // Create the DIV to hold the control and call the makeInfoBox() constructor
  // passing in this DIV.
  var infoBoxDiv = document.createElement('div');
  makeInfoBox(infoBoxDiv, map);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(infoBoxDiv);

  // Listen for clicks and add the location of the click to firebase.
  map.addListener('click', function(e) {
    data.lat = e.latLng.lat();
    data.lng = e.latLng.lng();
    addToFirebase(data);
  });

  // Create a heatmap.
  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: [],
    map: map,
    radius: 16
  });

  initAuthentication(initFirebase.bind(undefined, heatmap));
}

var locations = [
        {lat: -31.563910, lng: 147.154312},
        {lat: -33.718234, lng: 150.363181},
        {lat: -33.727111, lng: 150.371124},
        {lat: -33.848588, lng: 151.209834},
        {lat: -33.851702, lng: 151.216968},
        {lat: -34.671264, lng: 150.863657},
        {lat: -35.304724, lng: 148.662905},
        {lat: -36.817685, lng: 175.699196},
        {lat: -36.828611, lng: 175.790222},
        {lat: -37.750000, lng: 145.116667},
        {lat: -37.759859, lng: 145.128708},
        {lat: -37.765015, lng: 145.133858},
        {lat: -37.770104, lng: 145.143299},
        {lat: -37.773700, lng: 145.145187},
        {lat: -37.774785, lng: 145.137978},
        {lat: -37.819616, lng: 144.968119},
        {lat: -38.330766, lng: 144.695692},
        {lat: -39.927193, lng: 175.053218},
        {lat: -41.330162, lng: 174.865694},
        {lat: -42.734358, lng: 147.439506},
        {lat: -42.734358, lng: 147.501315},
        {lat: -42.735258, lng: 147.438000},
        {lat: -43.999792, lng: 170.463352}
      ]



      function initFirebase(heatmap) {

        // 10 minutes before current time.
        var startTime = new Date().getTime() - (60 * 10 * 1000);

        // Reference to the clicks in Firebase.
        var clicks = firebase.child('clicks');

        // Listener for when a click is added.
        clicks.orderByChild('timestamp').startAt(startTime).on('child_added',
          function(snapshot) {

            // Get that click from firebase.
            var newPosition = snapshot.val();
            var point = new google.maps.LatLng(newPosition.lat, newPosition.lng);
            var elapsed = new Date().getTime() - newPosition.timestamp;

            // Add the point to  the heatmap.
            heatmap.getData().push(point);

            // Requests entries older than expiry time (10 minutes).
            var expirySeconds = Math.max(60 * 10 * 1000 - elapsed, 0);
            // Set client timeout to remove the point after a certain time.
            window.setTimeout(function() {
              // Delete the old point from the database.
              snapshot.ref().remove();
            }, expirySeconds);
          }
        );

        // Remove old data from the heatmap when a point is removed from firebase.
        clicks.on('child_removed', function(snapshot, prevChildKey) {
          var heatmapData = heatmap.getData();
          var i = 0;
          while (snapshot.val().lat != heatmapData.getAt(i).lat()
            || snapshot.val().lng != heatmapData.getAt(i).lng()) {
            i++;
          }
          heatmapData.removeAt(i);
        });
      }

      /**
       * Updates the last_message/ path with the current timestamp.
       * @param {function(Date)} addClick After the last message timestamp has been updated,
       *     this function is called with the current timestamp to add the
       *     click to the firebase.
       */
      function getTimestamp(addClick) {
        // Reference to location for saving the last click time.
        var ref = firebase.child('last_message/' + data.sender);

        ref.onDisconnect().remove();  // Delete reference from firebase on disconnect.

        // Set value to timestamp.
        ref.set(Firebase.ServerValue.TIMESTAMP, function(err) {
          if (err) {  // Write to last message was unsuccessful.
            console.log(err);
          } else {  // Write to last message was successful.
            ref.once('value', function(snap) {
              addClick(snap.val());  // Add click with same timestamp.
            }, function(err) {
              console.warn(err);
            });
          }
        });
      }

      /**
       * Adds a click to firebase.
       * @param {Object} data The data to be added to firebase.
       *     It contains the lat, lng, sender and timestamp.
       */
      function addToFirebase(data) {
        getTimestamp(function(timestamp) {
          // Add the new timestamp to the record data.
          data.timestamp = timestamp;
          var ref = firebase.child('clicks').push(data, function(err) {
            if (err) {  // Data was not written to firebase.
              console.warn(err);
            }
          });
        });
      }
