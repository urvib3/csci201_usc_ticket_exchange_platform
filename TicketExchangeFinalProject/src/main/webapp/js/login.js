function validateLogin() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "Login", true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.onload = function() {
			
			if(this.status == 200) { // successful login validation
				const userID = parseInt(this.responseText, 10);
				localStorage.setItem('user_id', userID); 
    			window.location.href = "entryPage.html";
			} else { // unsuccessful validation
				document.getElementById("loginFeedback").innerHTML = this.responseText;
			}
   }
   xhttp.send("&username=" + document.loginform.username.value + "&password=" + document.loginform.password.value);
   return false; 
 }