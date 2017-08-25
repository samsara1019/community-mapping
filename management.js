var config = {
    apiKey: "AIzaSyDNSBtgIvpLzy5c6X6WVqUJ9_m22dJ46a0",
    authDomain: "logincheck-f1857.firebaseapp.com",
    databaseURL: "https://logincheck-f1857.firebaseio.com",
    projectId: "logincheck-f1857",
    storageBucket: "logincheck-f1857.appspot.com",
    messagingSenderId: "696285582631"
};
firebase.initializeApp(config);

var auth = firebase.auth();

var myFirebase = firebase.database().ref();
var Projects = myFirebase.child('Projects');

var storage = firebase.storage();
var provider = new firebase.auth.FacebookAuthProvider();
var logout = document.getElementById("login");



logout.addEventListener("click", function() {
    var cuser = firebase.auth().currentUser;
    if(cuser){
        firebase.auth().signOut().then(function() {
            console.log("로그아웃됨")
        }, function(error) {
            console.log(error);
        });
        return
    }else{
        auth.signInWithRedirect(provider);
        console.log("로그인중")
        return
    }
    
});

auth.onAuthStateChanged(function(user) {
    if (user) {
        username = user.displayName;
        userlevel = user.level;
        userEmail = user.email;
        photoURL = user.photoURL;
        document.getElementById("userName").innerHTML =username;
        document.getElementById("userEmail").innerHTML =userEmail;
        document.getElementById("userPhoto").src =photoURL;
        document.getElementById("login").textContent = "로그아웃하기"

    } else {
        document.getElementById("userName").innerHTML = "로그인을해주세요";
        document.getElementById("userEmail").innerHTML = "로그인을해주세요";
        document.getElementById("login").textContent = "로그인하기";
        document.getElementById("userPhoto").src =null;
    }
});




var map;
//초기 화면 크기 설정
var w = 100, h = 100;
w = $(window).width()  - 300;
h = $(window).height() - 300;

//width가 변경될 때마다 map크기가 resize 됩니다.
$(document).ready(function(){
    $(window).resize(function() {
        w = $(window).width()  - 300;
        h = $(window).height() - 300;
        map.setSize(new naver.maps.Size(w, h));
    });
});

//네이버 맵 선언
map = new naver.maps.Map('map', {
    //초기 위치는 한림대학교입니다.
    center: new naver.maps.LatLng(37.896912, 127.737006),
    //zoom은 정수값으로 자유롭게 조절
    zoom: 9,
    //초기 화면 크기로 size가 설정됩니다.
    size : new naver.maps.Size(w, h)
});


var point = map.getCenter();
//마커를 만든다
var marker =new naver.maps.Marker({
    map: map,
    position: point,
    //드래그가 가능하게 설정
    draggable: true
});


var i = 1;

$(function() {
  $("#addCategory").bind("click", function() {
    var div = $("<div />");
    div.html(GetDynamicTextBox(""));
    $("#TextBoxContainer").append(div);
    i ++;
    console.log(i)
  });
  $("body").on("click", ".remove", function() {
    $(this).closest("#g").remove();
    i--;
    console.log(i)
  });
});

function GetDynamicTextBox(value) {
    var q = i+1;
  return '<div id="g">'+
        '<div class="col s10">'+
            '<input id="CGName'+q+'" name = "DynamicTextBox" type="text" value = "' + value + '" />&nbsp;' +
        '</div>'+
        '<div class="col s2">'+
            '<div class="btn btn-floating remove" id="addCategory"><i class="material-icons">clear</i></div>'+
        '</div>'+
    '</div>'
}


var file = null;
var fileButton = document.getElementById('PJTitle');
fileButton.addEventListener('change',function(e){
    file = e.target.files[0];
    var storageRef = firebase.storage().ref('pics/'+file.name);
    storageRef.put(file);
});



$(function(){
    var data={};

 
    naver.maps.Event.addListener(marker, 'dragend', function(e) {
        //위도와 경도는 e.coord._lat/_lng 형식으로 저장되어있다.
        var point = e.coord;
        console.log(point)
        data.PJLat = point._lat;
        data.PJLng = point._lng;

    });

    $('#PJForm').submit(function(event){
        console.log("submit to firebase");

        var PJName = $('#PJName').val();
        
        var PJInfo = $('#PJInfo').val();
        var PJExposure = $('#label1').val();
        var PJCommentable = $('#label2').val();
        var PJTitle = document.getElementById("PJTitle").files;
        data.PJName = PJName;
        data.PJInfo = PJInfo;
        data.PJExposure = PJExposure;
        data.PJCommentable = PJCommentable;
        
        
        var log = myFirebase.child('projects').push(data);

        

        var j = 0
        for (j = 0 ; j <i  ; j ++){
            var Category = {};
            var y = j+1;
            eval("var CGName" + y + " = $('#CGName" + y + "').val();");
            eval("Category.CGName = CGName"+y+";");
            log.child('Category').push(Category);
        }

        
        return false;
    })
})












$(".button-collapse").sideNav();

$('.modal').modal();