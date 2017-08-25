var config = {
    apiKey: "AIzaSyDNSBtgIvpLzy5c6X6WVqUJ9_m22dJ46a0",
    authDomain: "logincheck-f1857.firebaseapp.com",
    databaseURL: "https://logincheck-f1857.firebaseio.com",
    projectId: "logincheck-f1857",
    storageBucket: "logincheck-f1857.appspot.com",
    messagingSenderId: "696285582631"
};
firebase.initializeApp(config);

var myFirebase = firebase.database().ref();

var auth = firebase.auth();
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


function Request(){
 var requestParam ="";
 
 //getParameter 펑션
  this.getParameter = function(param){
  //현재 주소를 decoding
  var url = unescape(location.href); 
  //파라미터만 자르고, 다시 &그분자를 잘라서 배열에 넣는다. 
   var paramArr = (url.substring(url.indexOf("?")+1,url.length)).split("&"); 
 
   for(var i = 0 ; i < paramArr.length ; i++){
     var temp = paramArr[i].split("="); //파라미터 변수명을 담음
 
     if(temp[0].toUpperCase() == param.toUpperCase()){
       // 변수명과 일치할 경우 데이터 삽입
       requestParam = paramArr[i].split("=")[1]; 
       break;
     }
   }
   return requestParam;
 }
}

  // Request 객체 생성
 var request = new Request();

const PJUID = request.getParameter("PJUid");



var map;
//초기 화면 크기 설정
var w = 780, h = 100;

h = $(window).height() - 50;
/*
w = $('mapwrap').width()-100;


//width가 변경될 때마다 map크기가 resize 됩니다.
$(document).ready(function(){
    $(window).resize(function() {
        w = $(window).width()-1;
        h = $(window).height() - 50;
        map.setSize(new naver.maps.Size(w, h));
    });
});
*/

var Projects = myFirebase.child('projects/'+PJUID+'/');

Projects.on('value', function(snapshot) {
    var PJ = snapshot.val();
    var PJLat = PJ.PJLat;
    var PJLng = PJ.PJLng;

    map = new naver.maps.Map('map', 
    {
        //초기 위치는 한림대학교입니다.
        center: new naver.maps.LatLng(PJLat,PJLng),
        //zoom은 정수값으로 자유롭게 조절
        zoom: 9,
        //초기 화면 크기로 size가 설정됩니다.
        size : new naver.maps.Size(500, h)
    });
});





//infowindow의 content : 한줄씩 만들고 join을 통해 합쳐줍니다.
var contentString = [
    '<div class="iw_inner">',
    //detailpage로 이어지는 버튼 생성
    '<a href="detailpage.html?PJUid='+PJUID+'"><button class="button" style="vertical-align:middle"><span>플레이스 등록</span></button></a>',
    '</div>'
].join('');


//infowindow
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




//마커를 생성하는 함수
function makeMarker(){
    //position이 될 위치는 맵 가운데로 초기화 합니다.
    var point = map.getCenter();
    //마커를 만든다
    var marker =new naver.maps.Marker({
        map: map,
        position: point,
        //드래그가 가능하게 설정
        draggable: true
    });
    //드래그가 끝났을때 발동하는 함수. e를 매개변수로 받는다 (위치정보)
    naver.maps.Event.addListener(marker, 'dragend', function(e) {
        //위도와 경도는 e.coord._lat/_lng 형식으로 저장되어있다.
        var point = e.coord;
        var lat = point._lat;
        var lng = point._lng;
        //배열로 저장한다.
        var arr = [lat,lng];
        //세션에 배열을 저장한다. 세션에서 값을 가져올때 배열을 해체할 예정
        if (window.sessionStorage) {
            localStorage.setItem("point", JSON.stringify(arr));
        }
        //마커 위치에 infowindow를 연다.
        infowindow.open(map, marker);
        //맵 아무데나 클릭하면 동작이 취소된다.
        naver.maps.Event.addListener(map, 'click', function(){
            //첫번째 삭제동작에서만 마커가 삭제되는 오류 존재......
            if (infowindow.getMap()) {
                infowindow.close();
                marker.setMap(null);
                alert( "플레이스 등록이 취소되었습니다!");
            } 
        });
    });
}
//마커들과 마커마다의 정보를 처리하는 이벤트
//마커들과 정보창들을 담을 배열을 만든다.
var infowindows = [];

var PJUIDLocation = myFirebase.child('projects/'+PJUID+'/Category');

//실시간 데이터베이스 처리하는 함수
var startListening = function(){
    var markers=[];
    //스냅샷을 통해 내 데이터베이스에서 정보들을 불러온다
    PJUIDLocation.once("value").then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
        var a = childSnapshot.key;
        var b = snapshot.child(a).child('markers')
        b.forEach(function(childSnapshot){
            //정보들을 변수에 저장한다
            var totalData = childSnapshot.val();
            var latData = childSnapshot.val().lat;
            var lngData = childSnapshot.val().lng;
            var subjectData = childSnapshot.val().placeName;
            var infoData = childSnapshot.val().placeInfo;

            var marker =new naver.maps.Marker({
                map: map,
                position: new naver.maps.LatLng(latData, lngData)
            });

            var info = new naver.maps.InfoWindow({
                content: '<div style="width:150px;text-align:center;padding:10px;">장소명 "'+ subjectData +'"</br>장소설명"'+ infoData +'"</div>'
            });
            //위에서 만든 마커와 인포를 배열에 push한다
            markers.push(marker);
            infowindows.push(info);
        })
            


        });
        //마커마다 인덱싱하여 그에 맞는 인포윈도우를 여는 함수
        function getClickHandler(seq) {
            return function(e) {
                var marker = markers[seq],
                    infoWindow = infowindows[seq];

                if (infoWindow.getMap()) {
                    infoWindow.close();
                } else {
                    infoWindow.open(map, marker);
                }
            }
        }
        //마커들 인덱싱
        for (var i=0, ii=markers.length; i<ii; i++) {
            naver.maps.Event.addListener(markers[i], 'click', getClickHandler(i));
        }
    });
}

//마커들 업데이트를 처리하는 함수
function updateMarkers(map, markers) {
    var marker, position;
    for (var i = 0; i < markers.length; i++) {
        marker = markers[i]
        position = marker.getPosition();
        showMarker(map, marker);
    }
}
//마커들이 보여지게 하는 함수
function showMarker(map, marker) {
    if (marker.setMap()) return;
    marker.setMap(map);
}

//실시간 데이터베이스 처리 함수를 호출한다
startListening();

//지오코딩을 통한 검색결과를 나타낼 infoWindowCoord
var infoWindowCoord = new naver.maps.InfoWindow({
    anchorSkew: true
});

function searchCoordinateToAddress(latlng) {
    var tm128 = naver.maps.TransCoord.fromLatLngToTM128(latlng);

    infoWindowCoord.close();

    naver.maps.Service.reverseGeocode({
        location: tm128,
        coordType: naver.maps.Service.CoordType.TM128
    }, function(status, response) {
        if (status === naver.maps.Service.Status.ERROR) {
            return alert('Something Wrong!');
        }

        var items = response.result.items,
            htmlAddresses = [];

        for (var i=0, ii=items.length, item, addrType; i<ii; i++) {
            item = items[i];
            addrType = item.isRoadAddress ? '[도로명 주소]' : '[지번 주소]';

            htmlAddresses.push((i+1) +'. '+ addrType +' '+ item.address);
            htmlAddresses.push('&nbsp&nbsp&nbsp -> '+ item.point.x +','+ item.point.y);
        }

        infoWindowCoord.setContent([
                '<div style="padding:10px;min-width:200px;line-height:150%;">',
                '<h4 style="margin-top:5px;">검색 좌표 : '+ response.result.userquery +'</h4><br />',
                htmlAddresses.join('<br />'),
                '</div>'
            ].join('\n'));

        infoWindowCoord.open(map, latlng);
    });
}


function searchAddressToCoordinate(address) {
    naver.maps.Service.geocode({
        address: address
    }, function(status, response) {
        if (status === naver.maps.Service.Status.ERROR) {
            return alert('Something Wrong!');
        }

        var item = response.result.items[0],
            addrType = item.isRoadAddress ? '[도로명 주소]' : '[지번 주소]',
            point = new naver.maps.Point(item.point.x, item.point.y);

        infoWindowCoord.setContent([
                '<div class="close" onclick="infoWindowCoord.close(map);" title="닫기" style="position: absolute;top: 10px;right: 10px;color: #888;width: 17px;height: 17px;background: url(http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/overlay_close.png);"></div>',
                '<div style="padding:10px;min-width:200px;line-height:150%;">',
                '<h4 style="margin-top:5px;">검색 주소 : '+ response.result.userquery +'</h4><br />',
                addrType +' '+ item.address +'<br />',
                '&nbsp&nbsp&nbsp -> '+ point.x +','+ point.y,
                '</div>'
            ].join('\n'));


        map.setCenter(point);
        
        infoWindowCoord.open(map, point);
        

    });
}

function initGeocoder() {
    

    $('#address').on('keydown', function(e) {
        var keyCode = e.which;

        if (keyCode === 13) { // Enter Key
            searchAddressToCoordinate($('#address').val());
        }
    });

    
    var addressInput = document.querySelector('#address');
    var searchButton = document.querySelector('#search');
    
    if(searchButton){
    searchButton.addEventListener("click", function() {
        var address = addressInput.value;
        searchAddressToCoordinate(address);
    
    });
    }
}

naver.maps.onJSContentLoaded = initGeocoder;


//파노라마와 지오코딩을 함께 사용하면 오류가 발생중 ......
var pano = null;
/*
naver.maps.onJSContentLoaded = function() {
    // 아이디 혹은 지도좌표로 파노라마를 표시할 수 있습니다.
    pano = new naver.maps.Panorama("pano", {
        // panoId: "OregDk87L7tsQ35dcpp+Mg==",
        position: new naver.maps.LatLng(37.3599605, 127.1058814),
        pov: {
            pan: -135,
            tilt: 29,
            fov: 100
        }
    });
};

*/



$(".button-collapse").sideNav();