function validateLogin() {
	
	// CAPTCHA
    var captchaResponse = grecaptcha.getResponse();
 
    if (captchaResponse.length === 0) {
        document.getElementById("loginFeedback").innerHTML = "Please complete the CAPTCHA.";
        return false;
    }
		
		
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "Login", true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.onload = function() {
			
			if(this.status == 200) { // successful login validation
				const userID = parseInt(this.responseText, 10);
				localStorage.setItem('user_id', userID); 
    			window.location.href = "profile.html"; //change into the homepage when it is uploaded
			} else { // unsuccessful validation
				document.getElementById("loginFeedback").innerHTML = this.responseText;
			}
   }
   xhttp.send("&username=" + document.loginform.username.value + "&password=" + document.loginform.password.value);
   return false; 
 }
 
 /* alternative js code 
 
 document.addEventListener("DOMContentLoaded", function() {  
				
	document.getElementById('submit').addEventListener("click", () => {
		
		const user = document.getElementById('username').value;
		const pass = document.getElementById('password').value;
			
		const data = {
			username : user;
			password : pass;
		};

		fetch("/Login", {
	    method: "POST",
	    headers: { "Content-Type": "application/x-www-form-urlencoded" },
	    body: new URLSearchParams(data),
	  })
	    .then(response => response.JSON())
	    .then(data => {
	      console.log('Login successful:', data);
	      // Handle successful login, redirect to homepage
	    })
	    .catch(error => {
	      console.error('Error:', error.message);
	    });
	});
}
 
 */