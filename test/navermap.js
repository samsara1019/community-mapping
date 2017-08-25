
//firebase 선언
// config initialization이 선행되어야 합니다

var myFirebase = firebase.database().ref();

var currentUid = null;
 firebase.auth().onAuthStateChanged(function(user) {
    if (user && user.uid != currentUid) {
     currentUid = user.uid;

     username = user.displayName;

    console.log(username+"접속중");
    } else {
     currentUid = null;
     console.log("no user signed in");
    }
});
//map 변수 선언
var map;
//초기 화면 크기 설정
var w = 100, h = 100;
w = $(window).width()  - 35;
h = $(window).height() - 50;

//width가 변경될 때마다 map크기가 resize 됩니다.
$(document).ready(function(){
    $(window).resize(function() {
        w = $(window).width()  - 35;
        h = $(window).height() - 50;
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


//infowindow의 content : 한줄씩 만들고 join을 통해 합쳐줍니다.
var contentString = [
    '<div class="iw_inner">',
    //detailpage로 이어지는 버튼 생성
    '<a href="detailpage.html"><button class="button" style="vertical-align:middle"><span>플레이스 등록</span></button></a>',
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
var markers = [], infowindows = [];

//firebase db상에서 어디에 저장할지 여기서 선언
var which = myFirebase.child('markers');
//실시간 데이터베이스 처리하는 함수
var startListening = function(){
    //스냅샷을 통해 내 데이터베이스에서 정보들을 불러온다
    which.once("value").then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
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

map.setCursor('pointer');

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