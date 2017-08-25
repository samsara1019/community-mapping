var myFirebase = firebase.database().ref();
var data = {
  lat: null,
  lng: null,
  placeName: null,
  placeInfo: null
};
var subjectInput = document.querySelector('#wr_subject');
var contentInput = document.querySelector('#wr_content');
var postButton = document.querySelector('#btn_submit');

postButton.addEventListener("click", function() {
  data.placeName = subjectInput.value;
  data.placeInfo = contentInput.value;

  var point = localStorage.getItem("point");
  var arr = JSON.parse(point);

  data.lat = arr[0];
  data.lng = arr[1];

  myFirebase.child('markers').push(data);
  messages.push({username:msgUser, text:msgText});
  
});




