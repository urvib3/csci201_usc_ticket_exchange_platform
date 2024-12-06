document.addEventListener("DOMContentLoaded", function() {
	const resetButton = document.getElementById("submit-reset");
	const emailInput = document.getElementById("email").value.trim();
	
	resetButton.addEventListener("click", () => {
		const data = {
			email : emailInput
		};
		
		//we should check if the email is in our database, i'm not sure how to send an email for resetting email either link or like a 
		// temporary code or something?   
		fetch("/forgotPassword", {
			method: "POST",
			headers: {"Content-Type" : "application/x-www-form-urlencoded"},
			body: data,
		})
		.then((response) => {
			if (response.ok) {
				alert("Password reset link sent! Check your email");
			}
			else {
				alert("Failed to send password reset link. Please try again.");
			}
		})
		.catch((error) => {
			console.error("Error: ", error);
			alert("An error as occurred, please try again");
		});
	});
})