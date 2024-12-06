//Load tickets from JSON
let tickets = [];
let currentResults = []; //current search results for dynamic sorting

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

    //fetch and store the results in the global variable
    currentResults = fetchTickets(keyword, priceMin, priceMax, dateStart, dateEnd, sortBy, negotiable);

    //display the results
    displayResults(currentResults);
});

//listen for changes in the "sort by" dropdown
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
//listen for negoatiable tick
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
//lsiten for reset button click 
document.getElementById('reset-button').addEventListener('click', function () {
    document.getElementById('search-keyword').value = '';
    document.getElementById('price-min').value = '';
    document.getElementById('price-max').value = '';
    document.getElementById('date-start').value = '';
    document.getElementById('date-end').value = '';
    document.getElementById('sort-by').value = 'date-asc';
    document.getElementById('negotiable').checked = false;
	const resultsContainer = document.getElementById('results');
	    resultsContainer.innerHTML = '<p></p>';
	    
	currentResults = [];
});

//parsing
function tokenize(str) {
    return str.toLowerCase().split(/\s+/);
}

// filter tickets based on search criteria
function fetchTickets(keyword, priceMin, priceMax, dateStart, dateEnd, sortBy, negotiable) {
    const searchTokens = tokenize(keyword).map(normalizeDate).filter(token => token.trim() !== "");
    console.log("Search Tokens:", searchTokens);

    return tickets.filter(ticket => {
        const eventDate = formatDateToTokens(ticket.startDate); // Normalize ticket date
        const combinedText = `${ticket.eventName} ${ticket.additionalInfo} ${eventDate}`;
        const combinedTokens = tokenize(combinedText).map(normalizeDate);
        console.log("Combined Tokens:", combinedTokens);

        // 1. Keyword filter: Allow all tickets if keyword is blank
        const matchesKeyword = searchTokens.length === 0 || searchTokens.every(token => combinedTokens.includes(token));
        console.log(`Keyword Match (${ticket.eventName}):`, matchesKeyword);

        // Other filters
        const matchesPrice = ticket.ticketPrice >= priceMin && ticket.ticketPrice <= priceMax;
        const matchesDate = (!dateStart || ticket.startDate >= dateStart) && (!dateEnd || ticket.startDate <= dateEnd);
        const matchesNegotiable = !negotiable || ticket.negotiable;

		return matchesKeyword && matchesPrice && matchesDate && matchesNegotiable;
		    }).sort((a, b) => {
		        switch (sortBy) {
		            case "date-asc":
		                return a.startDate - b.startDate;
		            case "date-desc":
		                return b.startDate - a.startDate;
		            case "price-asc":
		                return a.ticketPrice - b.ticketPrice;
		            case "price-desc":
		                return b.ticketPrice - a.ticketPrice;
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
    resultsContainer.innerHTML = '';

    if (results.length > 0) {
        results.forEach(ticket => {
            const ticketDiv = document.createElement('div');
            ticketDiv.className = 'ticket-item';

            const formattedDate = `${String(ticket.startDate).slice(4, 6)}-${String(ticket.startDate).slice(6, 8)}-${String(ticket.startDate).slice(0, 4)}`;

            //build the ticket HTML
            ticketDiv.innerHTML = `
                <a href="ticketDetails.html?ticketID=${ticket.ticketID}" class="ticket-link">
                    <img src="${ticket.poster || 'images/sclogo.png'}" alt="${ticket.eventName}" class="ticket-poster">
                    <div>
                        <h3>${ticket.eventName}</h3>
                        <h2>$${ticket.ticketPrice}</h2>
                        <p>Date: ${formattedDate}</p>
                        <p>Details: ${ticket.additionalInfo}</p>
                    </div>
                </a>
            `;

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';

            if (ticket.negotiable) {//if negotiable display the negotiate/buy button
                const negotiateButton = document.createElement('button');
                negotiateButton.textContent = 'Negotiate/Buy';
                negotiateButton.className = 'negotiate-button';
                negotiateButton.addEventListener('click', () => {
                    alert(`Negotiating ticket: ${ticket.eventName}`);
                });
                buttonContainer.appendChild(negotiateButton);
            } else {
                const buyButton = document.createElement('button');
                buyButton.textContent = 'Buy';
                buyButton.className = 'buy-button';
                buyButton.addEventListener('click', () => {
                    alert(`Buying ticket: ${ticket.eventName}`);
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
