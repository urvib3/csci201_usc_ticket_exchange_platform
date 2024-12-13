function validateRegister() {
		
    const name = document.getElementById('fullname').value;
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const uni = document.getElementById('university').value;
    const phoneNum = document.getElementById('phone').value;
    const socials = document.getElementById('socials').value;
	
	// Initialize EmailJS
	emailjs.init("cw_a4yZJakgvImUL-");
	
	// Sending email asynchronously
    setTimeout(() => {
        sendVerificationEmail(user, name);
    }, 0);

	// Hashing the password before sending it
	var hashedPassword = hash(pass);
	
    const data = {
        name: name,
        username: user,
        password: hashedPassword,
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

function hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
    }
    return hash.toString(16);
}

function sendVerificationEmail(email, name) {

    emailjs.send("service_38wkwnv","template_w2yvkvh",{
	to_email: email,
	})
        .then(function (response) {
            console.log("Email sent successfully!", response.status, response.text);
            document.getElementById("registerFeedback").innerHTML = 
                "Registration successful! A verification email has been sent.";
        }, function (error) {
            console.error("Failed to send email:", error);
            document.getElementById("registerFeedback").innerHTML = 
                "Registration successful! However, we couldn't send the verification email.";
        });
}


