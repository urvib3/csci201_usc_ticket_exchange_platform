function validateRegister() {
	

    const name = document.getElementById('fullname').value;
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const uni = document.getElementById('university').value;
    const phoneNum = document.getElementById('phone').value;
    const socials = document.getElementById('socials').value;

    const data = {
        name: name,
        username: user,
        password: pass,
        university: uni,
        phone: phoneNum, 
        socials: socials
    };
	
	// Serialize the data object into URL-encoded format
	const urlEncodedData = new URLSearchParams(data).toString();
	
	 var xhttp = new XMLHttpRequest();
	 xhttp.open("POST", "Register", true);
	 xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	 xhttp.onload = function() {
			
			if(this.status == 200) { // successful login validation
	 			window.location.href = "login.html"; //change into the homepage when it is uploaded
			} else { // unsuccessful validation
				document.getElementById("registerFeedback").innerHTML = this.responseText;
			}
	}
	xhttp.send(urlEncodedData);
	return false;
}


