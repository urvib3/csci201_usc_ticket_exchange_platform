// Global variables
let tickets = [];
let currentResults = []; // Current displayed results
let isMyListingsActive = false; 
let isMyInfoActive = false;
let isIncomingOffersActive = false;
let isOutgoingOffersActive = false;
let isFavoritesActive = false;
let isPastOffersActive = false;

const TEST_MODE = false; // Set to true for testing with local JSON

document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username') || 'Guest';
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        welcomeMessage.textContent = `${username}, welcome`;
    }
});

// ====== Event Listeners ======

// My Listings
document.getElementById('mylistings-button').addEventListener('click', async () => {
    toggleSection('mylistings');
});

// My Info
document.getElementById('myinfo-button').addEventListener('click', async () => {
    toggleSection('myinfo');
});

// Incoming Offers
document.getElementById('incoming-offers-button').addEventListener('click', async () => {
    toggleSection('incoming-offers');
});

// Outgoing Offers
document.getElementById('outgoing-offers-button').addEventListener('click', async () => {
    toggleSection('outgoing-offers');
});

// Favorites
document.getElementById('favorites-button').addEventListener('click', async () => {
    toggleSection('favorites');
});

// Past Offers
document.getElementById('past-offers-button').addEventListener('click', async () => {
    toggleSection('past-offers');
});

// Sort By dropdown
document.getElementById('sort-by').addEventListener('change', function () {
    const sortBy = this.value;
    currentResults = currentResults.sort((a, b) => {
        switch (sortBy) {
            case "price-asc":
                return a.ticketPrice - b.ticketPrice;
            case "price-desc":
                return b.ticketPrice - a.ticketPrice;
            case "date-asc":
                return new Date(a.startDate) - new Date(b.startDate);
            case "date-desc":
                return new Date(b.startDate) - new Date(a.startDate);
            case "popularity-asc":
                return a.numTickets - b.numTickets;
            case "popularity-desc":
                return b.numTickets - a.numTickets;
            default:
                return 0;
        }
    });
    displayResults(currentResults, 'tickets');
});

// ====== Section Toggle Logic ======
function toggleSection(section) {
    // First deactivate all sections
    deactivateAllSections();

    switch(section) {
        case 'mylistings':
            isMyListingsActive = true;
            activateButton('mylistings-button');
            fetchMyListings();
            break;

        case 'myinfo':
            isMyInfoActive = true;
            activateButton('myinfo-button');
            fetchMyInfo();
            break;

        case 'incoming-offers':
            isIncomingOffersActive = true;
            activateButton('incoming-offers-button');
            fetchIncomingOffers();
            break;

        case 'outgoing-offers':
            isOutgoingOffersActive = true;
            activateButton('outgoing-offers-button');
            fetchOutgoingOffers();
            break;

        case 'favorites':
            isFavoritesActive = true;
            activateButton('favorites-button');
            fetchFavorites();
            break;

        case 'past-offers':
            isPastOffersActive = true;
            activateButton('past-offers-button');
            fetchPastOffers();
            break;
    }
}

// Deactivate all sections
function deactivateAllSections() {
    isMyListingsActive = false;
    isMyInfoActive = false;
    isIncomingOffersActive = false;
    isOutgoingOffersActive = false;
    isFavoritesActive = false;
    isPastOffersActive = false;

    // Deactivate buttons
    resetButton('mylistings-button');
    resetButton('myinfo-button');
    resetButton('incoming-offers-button');
    resetButton('outgoing-offers-button');
    resetButton('favorites-button');
    resetButton('past-offers-button');

    // Clear containers
    document.getElementById('results').innerHTML = '';
    document.getElementById('my-info-container').innerHTML = '';
    document.getElementById('my-info-container').style.display = 'none';
    document.getElementById('sort-by-container').style.display = 'none';
    document.getElementById('add-button-container').style.display = 'none';
}

// Activate a button
function activateButton(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.style.backgroundColor = '#007bff'; 
        button.style.color = '#fff';
    }
}

// Reset a button
function resetButton(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.style.backgroundColor = '';
        button.style.color = '';
    }
}

// ====== Fetching Data ======

// Fetch My Listings
async function fetchMyListings() {
    const userId = localStorage.getItem('user_id');
    if(!userId&&!TEST_MODE) {
        document.getElementById('welcome-message').textContent = 'Error Authenticating';
        return;
    }

    displayLoadingMessage();
    try {
        let response;
        if (TEST_MODE) {
            response = await fetch('db/mytickets.json');
        } else {
            response = await fetch('UserTicketListings?user_id=' + encodeURIComponent(userId));
        }
        if (!response.ok) {
            const errorResponse = await response.json(); 
            throw new Error(errorResponse.message || `HTTP error! Status: ${response.status}`);
        }

        tickets = await response.json();
        currentResults = [...tickets];

        if (currentResults.length > 0) {
            displayResults(currentResults, 'tickets', true); // show edit buttons
            document.getElementById('sort-by-container').style.display = 'block';
            document.getElementById('add-button-container').style.display = 'block';
        } else {
            document.getElementById('results').innerHTML = '<p>No tickets found.</p>';
        }
    } catch (error) {
        console.error('Error fetching tickets:', error);
        document.getElementById('results').innerHTML = `<p>${error.message}</p>`;
    }
}

// Fetch My Info
async function fetchMyInfo() {
    const userId = localStorage.getItem('user_id');
    if(!userId&&!TEST_MODE) {
        document.getElementById('welcome-message').textContent = 'Error Authenticating'; 
        return;
    }

    try {
        let response;
        if (TEST_MODE) {
            response = await fetch('db/myinfo.json');
        } else {
            response = await fetch('UserInfo?user_id=' + encodeURIComponent(userId));
        }
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const userInfo = await response.json();

        const myInfoContainer = document.getElementById('my-info-container');
        myInfoContainer.innerHTML = `
            <div class="info">
                <p>Name: ${userInfo.fullname}</p>
                <p>Username: ${userInfo.username}</p>
                <p>University: ${userInfo.university}</p>
                <p>Phone Number: ${userInfo.phone}</p>
                <p>Socials: ${userInfo.socials}</p>
            </div>
        `;
        myInfoContainer.style.display = 'block';
    } catch (error) {
        console.error('Error fetching user info:', error);
        document.getElementById('my-info-container').innerHTML = '<p>Error fetching your information. Please try again later.</p>';
    }
}

// Fetch Incoming Offers
async function fetchIncomingOffers() {
    const userId = localStorage.getItem('user_id');
    if (!userId&&!TEST_MODE) {
        document.getElementById('welcome-message').textContent = 'Error Authenticating'; 
        return;
    }

    displayLoadingMessage();
    try {
        let response;
        if (TEST_MODE) {
            response = await fetch('db/incomingOffers.json');
        } else {
            response = await fetch('UserIncomingOffers?user_id=' + encodeURIComponent(userId));
        }
        if (!response.ok) {
            throw new Error(`No incoming offers`);
        }

        const offers = await response.json();
        currentResults = [...offers];

        if (currentResults.length > 0) {
            displayResults(currentResults, 'incoming');
        } else {
            document.getElementById('results').innerHTML = '<p>No incoming offers found.</p>';
        }
    } catch (error) {
        console.error('Error fetching incoming offers:', error);
        document.getElementById('results').innerHTML = `<p>${error.message}</p>`;
    }
}

// Fetch Outgoing Offers
async function fetchOutgoingOffers() {
    const userId = localStorage.getItem('user_id');
    if (!userId&&!TEST_MODE) {
        document.getElementById('welcome-message').textContent = 'Error Authenticating'; 
        return;
    }

    displayLoadingMessage();
    try {
        let response;
        if (TEST_MODE) {
            response = await fetch('db/outgoingOffers.json');
        } else {
            response = await fetch('UserOutgoingOffers?user_id=' + encodeURIComponent(userId));
        }
        if (!response.ok) {
            throw new Error(`No outgoing offers`);
        }

        const offers = await response.json();
        currentResults = [...offers];

        if (currentResults.length > 0) {
            displayResults(currentResults, 'outgoing');
        } else {
            document.getElementById('results').innerHTML = '<p>No outgoing offers found.</p>';
        }
    } catch (error) {
        console.error('Error fetching outgoing offers:', error);
        document.getElementById('results').innerHTML = `<p>${error.message}</p>`;
    }
}

// Fetch Favorites
async function fetchFavorites() {
    const userId = localStorage.getItem('user_id');
    if (!userId&&!TEST_MODE) {
        document.getElementById('welcome-message').textContent = 'Error Authenticating'; 
        return;
    }

    displayLoadingMessage();
    try {
        let response;
        if (TEST_MODE) {
            response = await fetch('db/favorites.json');
        } else {
            response = await fetch('UserFavorites?user_id=' + encodeURIComponent(userId));
        }
        if (!response.ok) {
            throw new Error(`No favorites`);
        }

        const favorites = await response.json();
        currentResults = [...favorites];

        if (currentResults.length > 0) {
            displayResults(currentResults, 'favorites');
        } else {
            document.getElementById('results').innerHTML = '<p>No favorites found.</p>';
        }
    } catch (error) {
        console.error('Error fetching favorites:', error);
        document.getElementById('results').innerHTML = `<p>${error.message}</p>`;
    }
}

// Fetch Past Offers
async function fetchPastOffers() {
    const userId = localStorage.getItem('user_id');
    if (!userId&&!TEST_MODE) {
        document.getElementById('welcome-message').textContent = 'Error Authenticating'; 
        return;
    }

    displayLoadingMessage();
    try {
        let response;
        if (TEST_MODE) {
            response = await fetch('db/pastOffers.json');
        } else {
            response = await fetch('UserPastOffers?user_id=' + encodeURIComponent(userId));
        }
        if (!response.ok) {
            throw new Error(`No offer history currently`);
        }

        const pastOffers = await response.json();
        currentResults = [...pastOffers];

        if (currentResults.length > 0) {
            displayResults(currentResults, 'past');
        } else {
            document.getElementById('results').innerHTML = '<p>No past offers found.</p>';
        }
    } catch (error) {
        console.error('Error fetching past offers:', error);
        document.getElementById('results').innerHTML = `<p>${error.message}</p>`;
    }
}

// ====== Display Results ======
function displayResults(results, type, showEditButton = false) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; 

    results.forEach(item => {
        // Create a container div
        let itemDiv = document.createElement('div');
        let linkClass = '';
        let posterClass = '';
        let linkHref = '#';

        // Determine styling based on type
        switch (type) {
            case 'tickets':
                itemDiv.className = 'ticket-item';
                linkClass = 'ticket-link';
                posterClass = 'ticket-poster';
                linkHref = `ticketDetails.html?ticketID=${item.ticketID}`;
                break;
            case 'incoming':
				itemDiv.className = 'ticket-item';
                linkClass = 'ticket-link';
                posterClass = 'ticket-poster';
                // For offers, you might link to a details page or a user profile
                linkHref = `ticketDetails.html?ticketID=${item.ticketID}`;
                break;
            case 'outgoing':
				itemDiv.className = 'ticket-item';
                linkClass = 'ticket-link';
                posterClass = 'ticket-poster';
                // For offers, you might link to a details page or a user profile
                linkHref = `ticketDetails.html?ticketID=${item.ticketID}`;
                break;
            case 'favorites':
				itemDiv.className = 'ticket-item';
                linkClass = 'ticket-link';
                posterClass = 'ticket-poster';
                linkHref = `ticketDetails.html?ticketID=${item.ticketID}`;
                break;
            case 'past':
				itemDiv.className = 'ticket-item';
                linkClass = 'ticket-link';
                posterClass = 'ticket-poster';
                linkHref = `ticketDetails.html?ticketID=${item.ticketID}`;
                break;
            default:
                itemDiv.className = 'ticket-item';
                linkClass = 'ticket-link';
                posterClass = 'ticket-poster';
        }

        // Construct HTML based on data structure
        // Adjust property names according to your actual data
		let imageUrl = item.poster || 'images/sclogo.png';
		let title = item.eventName || item.title || 'No Title';
		let price = item.ticketPrice ? `$${item.ticketPrice}` : (item.offerPrice ? `$${item.offerPrice}` : '');
		let date = formatDate(item.startDate) || formatDate(item.date) || '';
		let details = item.additionalInfo || item.details || '';

		let itemHTML = `
		    <a href="${linkHref}" class="${linkClass}">
		        <img src="${imageUrl}" alt="${title}" class="${posterClass}">
		        <div>
		            <h3>${title}</h3>
		            ${price ? `<p>Price: ${price}</p>` : ''}
		            ${date ? `<p>Date: ${date}</p>` : ''}
		            ${details ? `<p>Details: ${details}</p>` : ''}
		        </div>
		`;

		if (type === 'incoming') {
		    itemHTML += `
		        <div class="buyer-info" style="margin-left: 100px; text-align: left; width: 250px;">
		            <p><strong>Buyer Name:</strong> ${item.buyerUsername}</p>
		            <p><strong>Phone:</strong> ${item.buyerPhone}</p>
		            <p><strong>Socials:</strong> ${item.buyerSocials}</p>
		        </div>
				<div class="action-buttons" style="display: flex; justify-content: space-between; margin-top:50px;">
		           <button id="accept-btn" onclick="event.preventDefault();" style="padding: 5px 10px; width:60px; margin-right: 10px; background-color: green; color: white; border: none;">Accept</button>
		           <button id="reject-btn" onclick="event.preventDefault();" style="padding: 5px 10px; width:60px; background-color: red; color: white; border: none;">Reject</button>
		       </div>
		    `;
		}


		itemHTML += '</a>';


        itemDiv.innerHTML = itemHTML;

        // If showing My Listings and we want to edit
        if (showEditButton && type === 'tickets') {
            const editButton = document.createElement('button');
            editButton.className = 'edit-button';
            editButton.textContent = 'Edit';
            editButton.onclick = () => {
                // Redirect to edit page or open a modal
                editTicket(item.ticketID, item.eventName, item.startDate, item.endDate, item.ticketPrice, item.additionalInfo, item.negotiable, item.numTickets, item.status);
            };
            itemDiv.appendChild(editButton);
        }

        resultsContainer.appendChild(itemDiv);
		
		if (type === 'incoming') {
					document.getElementById('accept-btn').addEventListener("click", function(event) {
				        event.preventDefault();  // Prevent the anchor link's default behavior
				        event.stopPropagation(); // Prevent the event from bubbling up to the link
				        acceptPurchase(item);    // Call the accept purchase function
				    });

				    document.getElementById('reject-btn').addEventListener("click", function(event) {
				        event.preventDefault();  // Prevent the anchor link's default behavior
				        event.stopPropagation(); // Prevent the event from bubbling up to the link
				        rejectPurchase(item);    // Call the reject purchase function
				    });
				}
    });
}

// Display loading message
function displayLoadingMessage() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<p>Loading results...</p>';
}

// Display username on page load
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username') || 'Guest';
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        welcomeMessage.textContent = `${username}, welcome`;
    }
	document.getElementById('newTicket-modal').style.display = 'none';
	document.getElementById('update-ticket-modal').style.display = 'none';
});

function editTicket(ticketID, eventName, startDate, endDate, ticketPrice, additionalInfo, negotiable, numTickets, status) {
    const ticketData = {
        ticketID,
        eventName,
        startDate,
        endDate,
        ticketPrice,
        additionalInfo,
        negotiable,
        numTickets,
        status
    };

    // Store the ticket data in sessionStorage
    sessionStorage.setItem('ticketData', JSON.stringify(ticketData));
	document.getElementById('update-ticket-modal').style.display = 'block';
	
	window.location.href = 'editTicket.html';
	/*
	

	// Add delete functionality
	document.getElementById('delete-button').addEventListener('click', async function() {
		if (!confirm("Are you sure you want to delete this ticket?")) return;

		const ticketData = JSON.parse(sessionStorage.getItem('ticketData'));
		if (!ticketData || !ticketData.ticketID) {
			alert("Ticket ID not found.");
			return;
		}

		try {
			const response = await fetch(`deleteTicket?ticketID=${ticketData.ticketID}`, {
				method: "DELETE",
			});

			if (response.ok) {
				const result = await response.json();
				alert(result.message);
				document.getElementById('update-ticket-modal').style.display = 'none'; // Close modal
				location.reload(); // Refresh the page to update the UI
			} else {
				const error = await response.json();
				alert("Error: " + error.message);
			}
		} catch (error) {
			console.log("Error deleting ticket:", error);
			alert("An error occurred while deleting the ticket.");
		}
	});

	// Add submit functionality
	document.querySelector("updateTicketForm").addEventListener("submit", async function(event) {
		event.preventDefault();

		const ticketData = JSON.parse(sessionStorage.getItem('ticketData'));
		const formData = new FormData(event.target);
		const data = Object.fromEntries(formData.entries());

		data.ticketID = ticketData.ticketID;
		data.startDate = parseInt(document.getElementById('startDate').value.replace(/-/g, '')) || 0;
		data.endDate = parseInt(document.getElementById('endDate').value.replace(/-/g, '')) || Number.MAX_SAFE_INTEGER;
		data.negotiable = formData.has("negotiable");

		const params = new URLSearchParams(data);
		const url = `editTicket?${params.toString()}`;

		try {
			const response = await fetch(url, { method: "GET" });

			if (response.ok) {
				const result = await response.json();
				alert(result.message);
				document.getElementById('update-ticket-modal').style.display = 'none'; // Close modal
				location.reload(); // Refresh the page to reflect changes
			} else {
				const error = await response.json();
				alert("Error: " + error.message);
			}
		} catch (error) {
			console.log("Error submitting ticket:", error);
			alert("An error occurred while submitting the ticket.");
		}
	});
	
	// Populate the form fields and display the modal
	    populateTicketForm(); 
		
	*/
}

// Functions for approving or rejecting a buyer request 

function acceptPurchase(item) {
	console.log("accepting purchase"); 
    // Parse the item string back to an object
    // const item = JSON.parse(itemString);

    // Extract the necessary parameters
    const ticketID = item.ticketID;
    const buyerID = item.buyerID;
    const sellerID = item.sellerID;

    // Prepare the URL for the servlet
    const url = `AcceptPurchase?ticketID=${ticketID}&buyerID=${buyerID}&sellerID=${sellerID}`;

    // Make an HTTP GET request to the servlet
    fetch(url, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the servlet (optional)
        if (data.message === "Success") {
            alert('Purchase accepted successfully!');
        } else {
            alert('Failed to accept the purchase');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while processing your request.');
    });
}

function deletePurchase(item) {
	console.log("rejecting purcahse");
    // Parse the item string back to an object
    // const item = JSON.parse(itemString);

    // Extract the necessary parameters
    const ticketID = item.ticketID;
    const buyerID = item.buyerID;
    const sellerID = item.sellerID;

    // Prepare the URL for the servlet
    const url = `DeletePurchase?ticketID=${ticketID}&buyerID=${buyerID}&sellerID=${sellerID}`;

    // Make an HTTP GET request to the servlet
    fetch(url, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the servlet (optional)
        if (data.message === "Success") {
            alert('Purchase deleted successfully!');
        } else {
            alert('Failed to delete the purchase');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while processing your request.');
    });
}

function formatDate(dateStr) {
	dateStr = String(dateStr);
			
	// Ensure the dateStr is in 'YYYYMMDD' format
	if (dateStr && dateStr.length === 8) {
		// Format it to 'YYYY-MM-DD'
		return dateStr.slice(0, 4) + '-' + dateStr.slice(4, 6) + '-' + dateStr.slice(6, 8);
	}
	return ''; // Return an empty string if the date is not valid
}

function populateTicketForm() {
	// Retrieve ticketData from sessionStorage
	const ticketData = JSON.parse(sessionStorage.getItem('ticketData'));

	if (ticketData) {
		// Populate form fields with the ticketData values
		document.getElementById('eventName').value = ticketData.eventName || '';
		document.getElementById('ticketPrice').value = ticketData.ticketPrice || '';
		document.getElementById('startDate').value = formatDate(ticketData.startDate) || '';
		document.getElementById('endDate').value = formatDate(ticketData.endDate) || '';
		document.getElementById('additionalInfo').value = ticketData.additionalInfo || '';
		document.getElementById('negotiable').checked = ticketData.negotiable || false;
		document.getElementById('numTickets').value = ticketData.numTickets || '';
	} else {
		console.error("No ticket data found in sessionStorage.");
	}
}

//close update-ticket-modal
document.getElementById('close-update-modal').addEventListener("click", function() {
	document.getElementById('update-ticket-modal').style.display = "none";
})

//open new ticket submission
document.getElementById('add-ticket-button').addEventListener("click", function () {
	//document.getElementById('newTicket-modal').style.display = "block";
	window.location.href = 'newTicket.html';
});
//close new ticket submission
document.getElementById("close-modal").addEventListener("click", function () {
	document.getElementById("newTicket-modal").style.display = "none";
});
//submit new ticket
document.querySelector("newTicketForm").addEventListener("submit", async function (event) {
	event.preventDefault();
		
	const formData = new FormData(event.target);
	const data = Object.fromEntries(formData.entries());
	data.negotiable = formData.has("negotiable");
		
	try {
		const response = await fetch("/newTicket", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
		
		if (response.ok) {
			const result = await response.json();
		    alert(result.message);
		} else {
		    const error = await response.json();
		    alert("Error: " + error.message);
		}
	} catch (error) {
		console.log("Error submitting ticket:", error);
		alert("An error occurred while submitting the ticket.");
	}
});


