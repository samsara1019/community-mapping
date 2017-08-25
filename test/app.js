

//var myFirebase = new Firebase('https://userproperty-850cf.firebaseio.com');
var myFirebase = firebase.database().ref();

var textInput = document.querySelector('#text');
var postButton = document.querySelector('#post');
var loggoutButton = document.querySelector('#logout');
var tothemapButton =document.querySelector('#tothemap');
var messages = myFirebase.child('messages');
//로그인처리부분
var username = null;
postButton.style.display = "none";
textInput.style.display = "none";




//데이터 읽어서 출력하는 함수
var startListening = function() {
messages.on('child_added', function(snapshot) {
  var msg = snapshot.val();

  var msgUsernameElement = document.createElement("b");
  msgUsernameElement.textContent = msg.username;

  var msgTextElement = document.createElement("p");
  msgTextElement.textContent = msg.text;

  var msgElement = document.createElement("div");
  msgElement.appendChild(msgUsernameElement);
  msgElement.appendChild(msgTextElement);

  msgElement.className = "msg";
  document.getElementById("results").appendChild(msgElement);
});
}


// 데이터 읽기 시작
startListening();



postButton.addEventListener("click", function() {
  var msgUser = username;
  var msgText = textInput.value;
  //키벨류 삽입 : push
  messages.push({username:msgUser, text:msgText});
  textInput.value = "";
});


loggoutButton.addEventListener("click", function(){
  firebase.auth().signOut().then(function() {
    console.log('logged out successfully')

  }, function(error) {
    console.log('로그아웃에 실패했습니다.')
  });

});



tothemapButton.addEventListener("click", function(){
    location.href="navermap.html";
});
