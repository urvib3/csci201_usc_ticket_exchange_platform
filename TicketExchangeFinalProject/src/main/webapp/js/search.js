let tickets = [];
let currentResults = [];
const TEST_MODE = false;
let LOGGED_IN = false; 

window.onload = function() {
    const logoutBtn = document.getElementById('logoutBtn');
    const profileBtn = document.querySelector('button[onclick="window.location.href=\'profile.html\'"]');
    const homeBtn = document.querySelector('button[onclick="window.location.href=\'entryPage.html\'"]');
    
    if (localStorage.getItem('user_id')) {
        logoutBtn.style.display = 'inline-block';
        profileBtn.style.display = 'inline-block';
        homeBtn.style.display = 'none';
		LOGGED_IN = true; 
    } else {
        logoutBtn.style.display = 'none';
        profileBtn.style.display = 'none';
        homeBtn.style.display = 'inline-block';
    }
};


if (TEST_MODE) { //local json
	fetch('db/tickets.json')
    .then(response => response.json())
    .then(data => {
        tickets = data;
        console.log("Tickets loaded:", tickets);
    })
    .catch(error => {
        console.error('Error loading tickets:', error);
        document.getElementById('results').innerHTML = '<p>Unable to load tickets. Please try again later.</p>';
    });
}
else {fetch('Search')
    .then(response => response.json())
    .then(data => {
        tickets = data;
        console.log("Tickets loaded:", tickets);
    })
    .catch(error => {
        console.error('Error loading tickets:', error);
        document.getElementById('results').innerHTML = '<p>Unable to load tickets. Please try again later.</p>';
    });
}

//listener for form submission
document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();

    displayLoadingMessage();

    const keyword = document.getElementById('search-keyword').value.toLowerCase();
    const priceMin = parseInt(document.getElementById('price-min').value) || 0;
    const priceMax = parseInt(document.getElementById('price-max').value) || Number.MAX_SAFE_INTEGER;
    const dateStart = parseInt(document.getElementById('date-start').value.replace(/-/g, '')) || 0;
    const dateEnd = parseInt(document.getElementById('date-end').value.replace(/-/g, '')) || Number.MAX_SAFE_INTEGER;
    const sortBy = document.getElementById('sort-by').value;
    const negotiable = document.getElementById('negotiable').checked;

    currentResults = fetchTickets(keyword, priceMin, priceMax, dateStart, dateEnd, sortBy, negotiable);
    displayResults(currentResults);
});

//listener for "Sort By" dropdown
document.getElementById('sort-by').addEventListener('change', function () {
    const sortBy = this.value;

    currentResults = currentResults.sort((a, b) => {
        switch (sortBy) {
            case "price-asc":
                return a.ticketPrice - b.ticketPrice;
            case "price-desc":
                return b.ticketPrice - a.ticketPrice;
            case "date-asc":
                return a.startDate - b.startDate;
            case "date-desc":
                return b.startDate - a.startDate;
            case "popularity-asc":
                return a.numTickets - b.numTickets;
            case "popularity-desc":
                return b.numTickets - a.numTickets;
            default:
                return 0;
        }
    });

    displayResults(currentResults);
});

//listener for event type dropdown
document.getElementById('ticket-type').addEventListener('change', function () {
    const eventType = this.value;

    currentResults = fetchTickets(
        document.getElementById('search-keyword').value.toLowerCase(),
        parseInt(document.getElementById('price-min').value) || 0,
        parseInt(document.getElementById('price-max').value) || Number.MAX_SAFE_INTEGER,
        parseInt(document.getElementById('date-start').value.replace(/-/g, '')) || 0,
        parseInt(document.getElementById('date-end').value.replace(/-/g, '')) || Number.MAX_SAFE_INTEGER,
        document.getElementById('sort-by').value,
        document.getElementById('negotiable').checked
    );

    displayResults(currentResults);
});

//listener for negotiable checkbox
document.getElementById('negotiable').addEventListener('change', function () {
    const negotiable = this.checked;

    currentResults = fetchTickets(
        document.getElementById('search-keyword').value.toLowerCase(),
        parseInt(document.getElementById('price-min').value) || 0,
        parseInt(document.getElementById('price-max').value) || Number.MAX_SAFE_INTEGER,
        parseInt(document.getElementById('date-start').value.replace(/-/g, '')) || 0,
        parseInt(document.getElementById('date-end').value.replace(/-/g, '')) || Number.MAX_SAFE_INTEGER,
        document.getElementById('sort-by').value,
        negotiable
    );

    displayResults(currentResults);
});

// Reset button functionality
document.getElementById('reset-button').addEventListener('click', function () {
    document.getElementById('search-keyword').value = '';
    document.getElementById('price-min').value = '';
    document.getElementById('price-max').value = '';
    document.getElementById('date-start').value = '';
    document.getElementById('date-end').value = '';
    document.getElementById('sort-by').value = 'date-asc';
    document.getElementById('ticket-type').value = ''; // Reset ticket type dropdown
    document.getElementById('negotiable').checked = false;

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<p></p>';

    currentResults = [];
});

function tokenize(str) {
    return str.toLowerCase().split(/\s+/); // Split on spaces and convert to lowercase
}

//fetch tickets
function fetchTickets(keyword, priceMin, priceMax, dateStart, dateEnd, sortBy, negotiable) {
    const searchTokens = tokenize(keyword).map(normalizeDate).filter(token => token.trim() !== "");
    const ticketType = document.getElementById("ticket-type").value;

    return tickets.filter(ticket => {
        const eventDate = formatDateToTokens(ticket.startDate);
        const combinedText = `${ticket.eventName} ${ticket.additionalInfo} ${eventDate}`;
        const combinedTokens = tokenize(combinedText).map(normalizeDate);

        const matchesKeyword = searchTokens.every(token => combinedTokens.includes(token));
        const matchesType = ticketType === "" || ticket.type === ticketType;
        const matchesPrice = ticket.ticketPrice >= priceMin && ticket.ticketPrice <= priceMax;
        const matchesDate = (!dateStart || ticket.startDate >= dateStart) && (!dateEnd || ticket.startDate <= dateEnd);
        const matchesNegotiable = !negotiable || ticket.negotiable;

        return matchesKeyword && matchesType && matchesPrice && matchesDate && matchesNegotiable;
    }).sort((a, b) => {
        switch (sortBy) {
            case "price-asc":
                return a.ticketPrice - b.ticketPrice;
            case "price-desc":
                return b.ticketPrice - a.ticketPrice;
            case "date-asc":
                return a.startDate - b.startDate;
            case "date-desc":
                return b.startDate - a.startDate;
            case "popularity-asc":
                return a.numTickets - b.numTickets;
            case "popularity-desc":
                return b.numTickets - a.numTickets;
            default:
                return 0;
        }
    });
}



//date-related strings in user input
function normalizeDate(str) {
    return str
        .toLowerCase()
        .replace(/\//g, '') // Replace slashes 
        .replace(/\./g, '') // Replace dots
        .replace(/nov/g, '11') // Replace month names with numbers
        .replace(/dec/g, '12')
        .replace(/jan/g, '01')
        .replace(/feb/g, '02')
        .replace(/mar/g, '03')
        .replace(/apr/g, '04')
        .replace(/may/g, '05')
        .replace(/jun/g, '06')
        .replace(/jul/g, '07')
        .replace(/aug/g, '08')
        .replace(/sep/g, '09')
        .replace(/oct/g, '10');
}

function formatDateToTokens(date) {
    const year = String(date).slice(0, 4);
    const month = String(date).slice(4, 6);
    const day = String(date).slice(6, 8);

    const numericMonthDay = `${month}${day}`;
    const textMonthDay = `${getMonthName(month)}${day}`;

    return `${numericMonthDay} ${textMonthDay}`;
}

function getMonthName(month) {
    const months = [
        'jan', 'feb', 'mar', 'apr', 'may', 'jun',
        'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ];
    return months[parseInt(month, 10) - 1];
}

//display results in the UI
function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (results.length > 0) {
        results.forEach(ticket => {
            const ticketDiv = document.createElement('div');
            ticketDiv.className = 'ticket-item';

            const formattedDate = `${String(ticket.startDate).slice(4, 6)}-${String(ticket.startDate).slice(6, 8)}-${String(ticket.startDate).slice(0, 4)}`;

            ticketDiv.innerHTML = `
                <a href="ticketDetails.html?ticketID=${ticket.ticketID}" class="ticket-link">
                    <img src="${ticket.poster || 'images/sclogo.png'}" alt="${ticket.eventName}" class="ticket-poster">
                    <div>
                        <h3>${ticket.eventName}</h3>
                        <h2 class="gradient-price">$${ticket.ticketPrice}</h2>
						<p>Date: ${formattedDate}</p>
                    </div>
                </a>
            `;

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';
	
            // if (ticket.negotiable) {
			if(true) {
                const buyButton = document.createElement('button');
                buyButton.textContent = 'Buy';
                buyButton.className = 'buy-button';
                buyButton.addEventListener('click', () => {
					if (!LOGGED_IN) {
					    alert("You must be logged in to buy a ticket");
					    return;
					}

					const ticketID = ticket.ticketID; // Assuming ticket object has ticketID
					const sellerID = ticket.user_id;   // Assuming ticket object has user_id
					const buyerID = localStorage.getItem('user_id'); 

					const url = `BuyTicket?ticketID=${ticketID}&sellerID=${sellerID}&buyerID=${buyerID}`;

					// Make the request (no need to handle the response)
					fetch(url, {
					    method: 'GET'  // Use GET or POST depending on your backend setup
					})
					.then(response => {
					    if (response.ok) {
					        // Handle the UI update or show a success message after the request
					        alert(`Successfully requested purchase: ${ticket.eventName}`);
					    } else {
					        // Handle unsuccessful response and read the error message
					        response.json()  // Parse the JSON response to get the error message
					            .then(errorData => {
					                // If the response contains a message, alert it
					                alert(`Error: ${errorData.message || 'Failed to request purchase.'}`);
					            })
					            .catch(error => {
					                // In case the error response does not contain a valid JSON message
					                alert('Failed to parse error response.');
					            });
					    }
					})

					.catch(error => {
					    // Handle any errors (e.g., network issue)
					    console.error('Error:', error);
					    alert('There was an error processing your purchase. Please try again later.');
					});

                });

				// add favorite button
				const favoriteButton = document.createElement('button');
				favoriteButton.className = 'favorite-button';

				// Create heart icon (using Unicode for heart)
				favoriteButton.innerHTML = '&#9825;'; // Empty heart
				
				
				if (LOGGED_IN) {
					const userID = localStorage.getItem('user_id');
					isFavoriteTicket(ticket.ticketID, userID, favoriteButton);  
				}
					

				favoriteButton.addEventListener('click', () => {
					
					if (!LOGGED_IN) {
					    alert("You must be logged in to favorite tickets");
					    return;
					}
					
				    const isFavorited = favoriteButton.classList.contains('favorited');

				    if (isFavorited) {
				        // If already favorited, remove favorite
				        favoriteButton.innerHTML = '&#9825;'; // Empty heart
				        favoriteButton.classList.remove('favorited');
						// Call favoriteTicket function with ticketID and user_id
						deleteFavoriteTicket(ticket.ticketID, userID);
				    } else {
				        // If not favorited, mark as favorited
				        favoriteButton.innerHTML = '&#9829;'; // Filled heart
				        favoriteButton.classList.add('favorited');

				        // Call favoriteTicket function with ticketID and user_id
				        addFavoriteTicket(ticket.ticketID, userID);
				    }
				});


                buttonContainer.appendChild(buyButton);
                buttonContainer.appendChild(favoriteButton);
            } /*else {
                const buyButton = document.createElement('button');
                buyButton.textContent = 'Buy';
                buyButton.className = 'buy-button';
                buyButton.addEventListener('click', () => {
					const ticketID = ticket.ticketID; // Assuming ticket object has ticketID
					const sellerID = ticket.user_id;   // Assuming ticket object has user_id
					const buyerID = localStorage.getItem('user_id'); 

					const url = `BuyTicket?ticketID=${ticketID}&sellerID=${sellerID}&buyerID=${buyerID}`;
					
					// Make the request (no need to handle the response)
					fetch(url, {
					    method: 'GET'  // Use GET or POST depending on your backend setup
					})
					.then(response => {
					    if (!response.ok) {
					        // If response is not OK, parse the error message and throw it
					        return response.json().then(errorData => {
					            throw new Error(errorData.message || 'An error occurred');
					        });
					    }
					    return response.json();  // If OK, continue to parse JSON
					})
					.then(data => {
					    // Handle the UI update or show a success message after the request
					    alert(`Successfully requested purchase: ${ticket.eventName}`);
					})
					.catch(error => {
					    // Handle any errors (e.g., network issue, response error)
					    console.error('Error:', error);
					    alert(`Error: ${error.message}`);  // Show the error message to the user
					});
                });

                buttonContainer.appendChild(buyButton);
            }*/

            ticketDiv.appendChild(buttonContainer);

            resultsContainer.appendChild(ticketDiv);
        });
    } else {
        resultsContainer.innerHTML = '<p>No tickets found matching your criteria.</p>';
    }
}


function displayLoadingMessage() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<p>Loading results...</p>';
}

// Display username
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username') || 'Guest';
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        welcomeMessage.textContent = `${username}, your next ticket awaits`;
    }
});

// Logout Button
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('user_id');
	localStorage.removeItem('username');
    window.location.href = "login.html";
});

function addFavoriteTicket(ticketID, userID) {
    // Construct the URL with query parameters
    const url = `AddFavoriteTicket?userID=${userID}&ticketID=${ticketID}`;

    // Make the GET request to the AddFavoriteTicket servlet
    fetch(url, {
        method: 'GET',  // Assuming the servlet uses GET method
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Parse the response body if the request is successful
        } else {
            throw new Error('Failed to add ticket to favorites.');
        }
    })
    .catch(error => {
        console.error('Error adding favorite ticket:', error);
        alert('An error occurred while adding the ticket to favorites.');
    });
}

function deleteFavoriteTicket(ticketID, userID) {
    // Construct the URL with query parameters
    const url = `DeleteFavoriteTicket?userID=${userID}&ticketID=${ticketID}`;

    // Make the GET request to the DeleteFavoriteTicket servlet
    fetch(url, {
        method: 'GET',  // Assuming the servlet uses GET method
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Parse the response body if the request is successful
        } else {
            throw new Error('Failed to remove ticket from favorites.');
        }
    })
    .catch(error => {
        console.error('Error deleting favorite ticket:', error);
        alert('An error occurred while removing the ticket from favorites.');
    });
}

async function isFavoriteTicket(ticketID, userID, favoriteButton) {
    // Construct the URL with query parameters
    const url = `CheckIfFavoriteTicket?userID=${userID}&ticketID=${ticketID}`;

    try {
        // Make the GET request and await the response
        const response = await fetch(url, {
            method: 'GET',  // Assuming the servlet uses GET method
        });

        if (response.ok) {
            const data = await response.json();  // Await the JSON data
			
			if((data.isFavorite === true || data.isFavorite === 'true') && favoriteButton) {
				favoriteButton.innerHTML = '&#9829;'; // Filled heart
				favoriteButton.classList.add('favorited');
			}

            // Return the parsed result (true or false)
            return String(data.isFavorite) === 'true'; // Assuming `isFavorite` is a string 'true' or 'false'
        } else {
			console.error("The servlet failed to properly check if the ticket is a fav");
            throw new Error('Failed to check if the ticket is a favorite.');
        }
    } catch (error) {
        console.error('Error checking favorite ticket:', error);
        alert('An error occurred while checking the ticket as a favorite:', error);
        return false; // Return false in case of error
    }
}

