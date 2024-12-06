//load tickets from JSON
let tickets = [];

fetch('db/tickets.json')
    .then(response => response.json())
    .then(data => {
        tickets = data;
        console.log("Tickets loaded:", tickets);
    })
    .catch(error => console.error('Error loading tickets:', error));

document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const keyword = document.getElementById('search-keyword').value.toLowerCase();
    const priceMin = parseInt(document.getElementById('price-min').value) || 0;
    const priceMax = parseInt(document.getElementById('price-max').value) || Number.MAX_SAFE_INTEGER;
    const dateStart = parseInt(document.getElementById('date-start').value.replace(/-/g, '')) || 0;
    const dateEnd = parseInt(document.getElementById('date-end').value.replace(/-/g, '')) || Number.MAX_SAFE_INTEGER;
    const sortBy = document.getElementById('sort-by').value;

    const results = fetchTickets(keyword, priceMin, priceMax, dateStart, dateEnd, sortBy);
    displayResults(results);
});

function tokenize(str) {//parser
    return str.toLowerCase().split(/\s+/);
}

function fetchTickets(keyword, priceMin, priceMax, dateStart, dateEnd, sortBy) {
    const searchTokens = tokenize(keyword);//user input parser

    return tickets.filter(ticket => {
        //keyword, additional info parser
        const combinedText = `${ticket.eventName} ${ticket.additionalInfo}`;
        const combinedTokens = tokenize(combinedText);

        //check if at least one word in the search matches any word in the combined text
        const matchesKeyword = searchTokens.some(token => combinedTokens.includes(token));

        //other filters
        const matchesPrice = ticket.ticketPrice >= priceMin && ticket.ticketPrice <= priceMax;
        const matchesDate = ticket.startDate >= dateStart && ticket.startDate <= dateEnd;

        //return true if all conditions are met
        return matchesKeyword && matchesPrice && matchesDate;
    }).sort((a, b) => {
        //sort by
        if (sortBy === "price") return a.ticketPrice - b.ticketPrice;
        if (sortBy === "date") return a.startDate - b.startDate;
        if (sortBy === "popularity") return b.numTickets - a.numTickets;
        return 0;
    });
}

//display results in the UI
function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = ''; //clear previous results

    if (results.length > 0) {
        results.forEach(ticket => {
            const ticketDiv = document.createElement('div');
            ticketDiv.className = 'ticket-item';
            ticketDiv.innerHTML = `
                <h3>${ticket.eventName}</h3>
                <p>Price: $${ticket.ticketPrice}</p>
                <p>Date: ${String(ticket.startDate).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}</p>
                <p>Details: ${ticket.additionalInfo}</p>
                <p>Negotiable: ${ticket.negotiable ? "Yes" : "No"}</p>
            `;
            resultsContainer.appendChild(ticketDiv);
        });
    } else {
        resultsContainer.innerHTML = '<p>No tickets found matching your criteria.</p>';
    }
}

//display username
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username') || 'Guest';
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        welcomeMessage.textContent = `${username}, find your tickets`;
    }
});