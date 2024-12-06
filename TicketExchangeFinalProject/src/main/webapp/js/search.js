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

//filter tickets based on search criteria
function fetchTickets(keyword, priceMin, priceMax, dateStart, dateEnd, sortBy) {
    return tickets
        .filter(ticket => {
            const matchesKeyword = ticket.eventName.toLowerCase().includes(keyword);
            const matchesPrice = ticket.ticketPrice >= priceMin && ticket.ticketPrice <= priceMax;
            const matchesDate = ticket.startDate >= dateStart && ticket.startDate <= dateEnd;
            return matchesKeyword && matchesPrice && matchesDate;
        })
        .sort((a, b) => {
            if (sortBy === "price") return a.ticketPrice - b.ticketPrice;
            if (sortBy === "date") return a.startDate - b.startDate;
            if (sortBy === "popularity") return b.numTickets - a.numTickets; // Assuming popularity is number of tickets
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
