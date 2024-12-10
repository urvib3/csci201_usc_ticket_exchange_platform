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
    if(!userId) {
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
    if(!userId) {
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
    if (!userId) {
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
            throw new Error(`HTTP error! Status: ${response.status}`);
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
    if (!userId) {
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
            throw new Error(`HTTP error! Status: ${response.status}`);
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
    if (!userId) {
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
            throw new Error(`HTTP error! Status: ${response.status}`);
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
    if (!userId) {
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
            throw new Error(`HTTP error! Status: ${response.status}`);
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
            case 'outgoing':
                itemDiv.className = 'offer-item';
                linkClass = 'offer-link';
                posterClass = 'offer-poster';
                // For offers, you might link to a details page or a user profile
                linkHref = `offerDetails.html?offerID=${item.offerID}`;
                break;
            case 'favorites':
                itemDiv.className = 'favorite-item';
                linkClass = 'favorite-link';
                posterClass = 'favorite-poster';
                linkHref = `ticketDetails.html?ticketID=${item.ticketID}`;
                break;
            case 'past':
                itemDiv.className = 'offer-item'; // reuse offer styling
                linkClass = 'offer-link';
                posterClass = 'offer-poster';
                linkHref = `offerDetails.html?offerID=${item.offerID}`;
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
        let date = item.startDate || item.date || '';
        let details = item.additionalInfo || item.details || '';

        // Render ticket
        // Create inner HTML
        const itemHTML = `
            <a href="${linkHref}" class="${linkClass}">
                <img src="${imageUrl}" alt="${title}" class="${posterClass}">
                <div>
                    <h3>${title}</h3>
                    ${price ? `<p>Price: ${price}</p>` : ''}
                    ${date ? `<p>Date: ${date}</p>` : ''}
                    ${details ? `<p>Details: ${details}</p>` : ''}
                </div>
            </a>
        `;

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
