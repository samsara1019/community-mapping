var firebase = new Firebase("https://userproperty-850cf.firebaseio.com");
var data = {
  lat: null,
  lng: null
};
var map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(37.3700065, 127.121359),
    zoom: 9
});

var contentString = [
      '<div class="iw_inner">',
      '<a href="detailpage.html"><button class="button" style="vertical-align:middle" id="toTheDetail"><span>플레이스 등록</span></button></a>',
      '</div>'
  ].join('');


var textInput = document.querySelector('#text');
var closeButton = document.querySelector('#close');
var infowindow = new naver.maps.InfoWindow({
    content: contentString,
    maxWidth: 160,
    backgroundColor: "#eee",
    borderColor: "#2db400",
    borderWidth: 5,
    anchorSize: new naver.maps.Size(30, 30),
    anchorSkew: true,
    anchorColor: "#eee",
    pixelOffset: new naver.maps.Point(20, -20)
});

var lastaction =null;

naver.maps.Event.addListener(map, 'rightclick', function(e) {
  var point = e.coord;
  var marker =new naver.maps.Marker({
      map: map,
      position: point
  });

  data.lat = e.coord._lat;
  data.lng = e.coord._lng;
  lastaction = addToFirebase(data);
  if (infowindow.getMap()) {
     infowindow.close();
  } else {
     infowindow.open(map, marker);
  }
  naver.maps.Event.addListener(map, 'click', function(e) {
    if (infowindow.getMap()) {
       infowindow.close();
    }
    removeItem(lastaction);
  });

  function removeItem(ref) {
    marker.setMap(null);
    // Now we can get back to that item we just pushed via .child().
    ref.remove(function(error) {
      alert(error ? "Uh oh!" : "플레이스 등록이 취소되었습니다!");
    });
  }
});



function addToFirebase(data) {
    var ref = firebase.child('clicks').push(data, function(err) {
      if (err) {  // Data was not written to firebase.
        console.warn(err);
      }
    });
    return ref;
};
