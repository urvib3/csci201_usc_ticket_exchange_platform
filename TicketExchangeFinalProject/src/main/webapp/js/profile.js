// Global variables
let tickets = [];
let currentResults = []; // Current search results for dynamic sorting
let isMyListingsActive = false; // Track if "My Listings" is active
let isMyInfoActive = false; // Track if "My Info" is active
const TEST_MODE = false; // Set to true for testing with local JSON

// Fetch tickets for "My Listings" and toggle the "Sort By" dropdown
document.getElementById('mylistings-button').addEventListener('click', async () => {
    const myListingsButton = document.getElementById('mylistings-button');
    const sortByContainer = document.getElementById('sort-by-container');
    const resultsContainer = document.getElementById('results');

    // Deactivate "My Info" if active
    if (isMyInfoActive) {
        deactivateMyInfo();
    }

    // Toggle state
    isMyListingsActive = !isMyListingsActive;

    if (isMyListingsActive) {
        // Activate "My Listings"
        myListingsButton.style.backgroundColor = '#007bff'; // Active color
        myListingsButton.style.color = '#fff';

        try {
            displayLoadingMessage();

            if (TEST_MODE) {
                // Fetch from mytickets.json for testing
                const response = await fetch('db/mytickets.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                tickets = await response.json();
            } else {
                // Fetch from the servlet in production
				const userId = localStorage.getItem('user_id');
								if(!userId) {
									document.getElementById('welcome-message').value = 'Error Authenticating'; 
									return;
								}
                const response = await fetch('UserTicketListings?user_id=' + encodeURIComponent(userId));
                if (!response.ok) {
					const errorResponse = await response.json();  // Parse the response as JSON
					throw new Error(errorResponse.message || `HTTP error! Status: ${response.status}`);
                }
                tickets = await response.json();
            }

            currentResults = [...tickets]; // Initialize current results

            if (currentResults.length > 0) {
                displayResults(currentResults); // Render tickets
                sortByContainer.style.display = 'block'; // Show "Sort By"
            } else {
                resultsContainer.innerHTML = '<p>No tickets found.</p>';
                sortByContainer.style.display = 'none'; // Hide "Sort By"
            }
			
        } catch (error) {
            console.error('Error fetching tickets:', error);
            resultsContainer.innerHTML = `<p>${error.message}</p>`; // Display the specific error message
            sortByContainer.style.display = 'none'; // Hide "Sort By"
        }
    } else {
        // Deactivate "My Listings"
        deactivateMyListings(myListingsButton, sortByContainer, resultsContainer);
    }
});

// Handle "My Info" button
document.getElementById('myinfo-button').addEventListener('click', async () => {
    const myInfoButton = document.getElementById('myinfo-button');
    const sortByContainer = document.getElementById('sort-by-container');
    const resultsContainer = document.getElementById('results');
    const myInfoContainer = document.getElementById('my-info-container');

    // Deactivate "My Listings" if active
    if (isMyListingsActive) {
        deactivateMyListings(
            document.getElementById('mylistings-button'),
            sortByContainer,
            resultsContainer
        );
    }

    // Toggle state
    isMyInfoActive = !isMyInfoActive;

    if (isMyInfoActive) {
        // Activate "My Info"
        myInfoButton.style.backgroundColor = '#007bff'; // Active color
        myInfoButton.style.color = '#fff';

        try {
            let userInfo;

            if (TEST_MODE) {
                // Fetch from myinfo.json for testing
                const response = await fetch('db/myinfo.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                userInfo = await response.json();
            } else {
				const userId = localStorage.getItem('user_id');
				if(!userId) {
					document.getElementById('welcome-message').value = 'Error Authenticating'; 
					return;
				}
                const response = await fetch('UserInfo?user_id=' + encodeURIComponent(userId));
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                userInfo = await response.json();
            }

            // Render user info
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
            myInfoContainer.innerHTML = '<p>Error fetching your information. Please try again later.</p>';
        }
    } else {
        // Deactivate "My Info"
        deactivateMyInfo();
    }
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

// Helper function to deactivate "My Listings"
function deactivateMyListings(myListingsButton, sortByContainer, resultsContainer) {
    isMyListingsActive = false;
    myListingsButton.style.backgroundColor = ''; // Reset button color
    myListingsButton.style.color = ''; // Reset text color
    resultsContainer.innerHTML = ''; // Clear results
    sortByContainer.style.display = 'none'; // Hide "Sort By"
	document.querySelector('.add-button-container').style.display = 'none';
}

// Helper function to deactivate "My Info"
function deactivateMyInfo() {
    const myInfoButton = document.getElementById('myinfo-button');
    const myInfoContainer = document.getElementById('my-info-container');

    isMyInfoActive = false;
    myInfoButton.style.backgroundColor = ''; // Reset button color
    myInfoButton.style.color = ''; // Reset text color
    myInfoContainer.innerHTML = ''; // Clear "My Info"
    myInfoContainer.style.display = 'none'; // Hide "My Info"
}

// Display results in the UI
function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results

    results.forEach(ticket => {
        const ticketDiv = document.createElement('div');
        ticketDiv.className = 'ticket-item';

        // Render ticket
        ticketDiv.innerHTML = `
		<a href="javascript:void(0);" class="ticket-link" onclick="editTicket(
		        ${ticket.ticketID},
		        '${ticket.eventName}',
		        '${ticket.startDate}', 
		        '${ticket.endDate}',
		        ${ticket.ticketPrice},
		        '${ticket.additionalInfo}',
		        ${ticket.negotiable},
		        ${ticket.numTickets},
		        ${ticket.status}
		    )">
                <img src="${ticket.poster || 'images/sclogo.png'}" alt="${ticket.eventName}" class="ticket-poster">
                <h3>${ticket.eventName}</h3>
                <p>Price: $${ticket.ticketPrice}</p>
                <p>Date: ${ticket.startDate}</p>
                <p>Details: ${ticket.additionalInfo}</p>
                <p>Negotiable: ${ticket.negotiable ? "Yes" : "No"}</p>
            </a>
        `;
        resultsContainer.appendChild(ticketDiv);
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

    // Redirect to the edit page
    window.location.href = 'editTicket.html';
}
