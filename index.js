



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
var Projects = myFirebase.child('projects');
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

var startListening = function() {
    Projects.on('child_added', function(snapshot) {
        var PJ = snapshot.val();


        var PJUID = snapshot.key;
        var PJTitle = document.createElement("img");
        PJTitle.src = PJ.PJTitle;

        var imgDiv = document.createElement("div");
        imgDiv.appendChild(PJTitle);
        imgDiv.className = "card-image";


        var PJName = document.createElement("span");
        PJName.textContent = PJ.PJName;
        PJName.className = "card-title";

        var PJInfo = document.createElement("p");
        PJInfo.textContent = PJ.PJInfo;
        

        var textDiv = document.createElement("div");
        textDiv.appendChild(PJName);
        textDiv.appendChild(PJInfo);
        textDiv.className = "card-content";



        var a = document.createElement("a");
        a.innerHTML = '맵으로 가기';
        a.href = "map.html?PJUid="+PJUID;

        var imgDiv = document.createElement("div");
        imgDiv.appendChild(a);
        imgDiv.className = "card-action";

        var PJDiv = document.createElement("div");
        PJDiv.appendChild(imgDiv);
        PJDiv.appendChild(textDiv);
        PJDiv.appendChild(imgDiv);
        PJDiv.className = "card horizontal";
        
        
        
        
        var results = document.getElementById("results")
        results.appendChild(PJDiv);

        
    });

}



// 데이터 읽기 시작
startListening();


$(".button-collapse").sideNav();
$('.fotorama').fotorama();