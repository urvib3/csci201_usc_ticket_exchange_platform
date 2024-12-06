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

    //re-sort results based on the new sort option
    currentResults = currentResults.sort((a, b) => {
        if (sortBy === "price") return a.ticketPrice - b.ticketPrice;
        if (sortBy === "date") return a.startDate - b.startDate;
        if (sortBy === "popularity") return b.numTickets - a.numTickets;
        return 0;
    });

    displayResults(currentResults);
});

//parsing
function tokenize(str) {
    return str.toLowerCase().split(/\s+/);
}

// Filter tickets based on search criteria
function fetchTickets(keyword, priceMin, priceMax, dateStart, dateEnd, sortBy, negotiable) {
    const searchTokens = tokenize(keyword); // User input parser

    return tickets.filter(ticket => {
        // Keyword, additional info parser
        const combinedText = `${ticket.eventName} ${ticket.additionalInfo}`;
        const combinedTokens = tokenize(combinedText);

        // 1. Check if all words in the search match words in the combined text
        const matchesKeyword = searchTokens.length === 0 || searchTokens.every(token => combinedTokens.includes(token));

        // 2. Price filter
        const matchesPrice = ticket.ticketPrice >= priceMin && ticket.ticketPrice <= priceMax;

        // 3. Date filter
        const matchesDate = ticket.startDate >= dateStart && ticket.startDate <= dateEnd;

        // 4. Negotiable filter
        const matchesNegotiable = !negotiable || ticket.negotiable;

        // Check if all conditions are met
        return matchesKeyword && matchesPrice && matchesDate && matchesNegotiable;
    }).sort((a, b) => {
        // Initial sort when fetching tickets
        if (sortBy === "price") return a.ticketPrice - b.ticketPrice;
        if (sortBy === "date") return a.startDate - b.startDate;
        if (sortBy === "popularity") return b.numTickets - a.numTickets;
        return 0;
    });
}

// Display results in the UI
function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (results.length > 0) {
        results.forEach(ticket => {
            const ticketDiv = document.createElement('div');
            ticketDiv.className = 'ticket-item';

            const formattedDate = `${String(ticket.startDate).slice(4, 6)}-${String(ticket.startDate).slice(6, 8)}-${String(ticket.startDate).slice(0, 4)}`;

            //clickable div
            ticketDiv.innerHTML = `
                <a href="ticketDetails.html?ticketID=${ticket.ticketID}" class="ticket-link">
                    <img src="${ticket.poster || 'images/sclogo.png'}" alt="${ticket.eventName}" class="ticket-poster">
                    <h3>${ticket.eventName}</h3>
                    <p>Price: $${ticket.ticketPrice}</p>
                    <p>Date: ${formattedDate}</p>
                    <p>Details: ${ticket.additionalInfo}</p>
                    <p>Negotiable: ${ticket.negotiable ? "Yes" : "No"}</p>
                </a>
            `;

            resultsContainer.appendChild(ticketDiv);
        });
    } else {
        resultsContainer.innerHTML = '<p>No tickets found matching your criteria.</p>';
    }
}

// Display username
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username') || 'Guest';
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        welcomeMessage.textContent = `${username}, your next ticket awaits`;
    }
});
