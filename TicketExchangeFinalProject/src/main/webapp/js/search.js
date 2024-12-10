let tickets = [];
let currentResults = [];

fetch('Search')  // Assuming 'Search' is the URL for the servlet
    .then(response => response.json())
    .then(data => {
        tickets = data;
        console.log("Tickets loaded:", tickets);
    })
    .catch(error => {
        console.error('Error loading tickets:', error);
        document.getElementById('results').innerHTML = '<p>Unable to load tickets. Please try again later.</p>';
    });


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

            if (ticket.negotiable) {
                const buyButton = document.createElement('button');
                buyButton.textContent = 'Buy';
                buyButton.className = 'buy-button';
                buyButton.addEventListener('click', () => {
					const ticketID = ticket.ticketID; // Assuming ticket object has ticketID
					const userID = ticket.user_id;   // Assuming ticket object has user_id

					const url = `BuyTicket?ticket_id=${ticketID}&user_id=${userID}`;

					// Make the request (no need to handle the response)
					fetch(url, {
					    method: 'GET'  // Use GET or POST depending on your backend setup
					})
					.then(() => {
					    // Handle the UI update or show a success message after the request
					    alert(`Successfully purchased ticket: ${ticket.eventName}`);
					})
					.catch(error => {
					    // Handle any errors (e.g., network issue)
					    console.error('Error:', error);
					    alert('There was an error processing your purchase. Please try again later.');
					});
                });

                const negotiateButton = document.createElement('button');
                negotiateButton.textContent = 'Negotiate (Chat)';
                negotiateButton.className = 'negotiate-button';
                negotiateButton.addEventListener('click', () => {
                    alert(`Starting negotiation for: ${ticket.eventName}`);
                });

                buttonContainer.appendChild(buyButton);
                buttonContainer.appendChild(negotiateButton);
            } else {
                const buyButton = document.createElement('button');
                buyButton.textContent = 'Buy';
                buyButton.className = 'buy-button';
                buyButton.addEventListener('click', () => {
					const ticketID = ticket.ticketID; // Assuming ticket object has ticketID
					const userID = ticket.user_id;   // Assuming ticket object has user_id

					const url = `BuyTicket?ticket_id=${ticketID}&user_id=${userID}`;

					// Make the request (no need to handle the response)
					fetch(url, {
					    method: 'GET'  // Use GET or POST depending on your backend setup
					})
					.then(() => {
					    // Handle the UI update or show a success message after the request
					    alert(`Successfully purchased ticket: ${ticket.eventName}`);
					})
					.catch(error => {
					    // Handle any errors (e.g., network issue)
					    console.error('Error:', error);
					    alert('There was an error processing your purchase. Please try again later.');
					});
                });

                buttonContainer.appendChild(buyButton);
            }

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
