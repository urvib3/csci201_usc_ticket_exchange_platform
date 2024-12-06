document.addEventListener("DOMContentLoaded", function() {
	document.getElementById('submit').addEventListener("click", () => {
		const name = document.getElementById('fullname').value;
		const user = document.getElementById('username').value;
		const pass = document.getElementById('password').value;
		const uni = document.getElementById('university').value;
		const phoneNum = document.getElementById('phone').value;
		const socials = document.getElementById('socials').value;
		
		const data = {
			name : name,
			username : user,
			password : pass,
			university : uni,
			phoneNumber : phoneNum, 
			socials : socials
		};
		
		fetch("/Register", {
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded"},
			body: new URLSearchParams(data) 
		})
		.then(response => response.json())
		.then(data => {
			
		})
		.catch(error => {
			console.error('Error: ', error);
		});
	});
})







