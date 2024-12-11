function validateLogin() {
	
	// CAPTCHA
    var captchaResponse = grecaptcha.getResponse();
 
    if (captchaResponse.length === 0) {
        document.getElementById("loginFeedback").innerHTML = "Please complete the CAPTCHA.";
        return false;
    }
	
	// Hashing the password
    var password = document.loginform.password.value;
    var hashedPassword = hash(password);
		
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "Login", true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.onload = function() {
			
			if(this.status == 200) { // successful login validation
				const userID = parseInt(this.responseText, 10);
				localStorage.setItem('username',document.loginform.username.value)
				localStorage.setItem('user_id', userID); 
    			window.location.href = "profile.html"; //change into the homepage when it is uploaded
			} else { // unsuccessful validation
				document.getElementById("loginFeedback").innerHTML = this.responseText;
			}
   }
   xhttp.send("&username=" + document.loginform.username.value + "&password=" + hashedPassword);
   return false; 
 }
 
 function hash(str) {
     let hash = 0;
     for (let i = 0; i < str.length; i++) {
         hash = ((hash << 5) - hash) + str.charCodeAt(i); // Hashing function (based on bit shifting)
     }
     return hash.toString(16);
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