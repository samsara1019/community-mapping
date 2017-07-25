
var textInput = document.querySelector('#wr_subject');
var postButton = document.querySelector('#btn_submit');

postButton.addEventListener("click", function() {
  var msgUser = username;
  var msgText = textInput.value;
  //키벨류 삽입 : push
  messages.push({username:msgUser, text:msgText});
  textInput.value = "";
});
