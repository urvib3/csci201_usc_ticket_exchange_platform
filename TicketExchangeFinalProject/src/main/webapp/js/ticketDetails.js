//get url
const urlParams = new URLSearchParams(window.location.search);
const ticketID = urlParams.get('ticketID');

//get data
fetch('db/tickets.json')
    .then(response => response.json())
    .then(tickets => {
        const ticket = tickets.find(ticket => ticket.ticketID == ticketID);

        if (ticket) {
			//ticket details
            document.getElementById('event-name').textContent = ticket.eventName;
            document.getElementById('poster').src = ticket.poster || 'images/sclogo.png';
            document.getElementById('poster').alt = ticket.eventName;
            document.getElementById('price').textContent = `Price: $${ticket.ticketPrice}`;
            document.getElementById('date').textContent = `Date: ${String(ticket.startDate).slice(4, 6)}-${String(ticket.startDate).slice(6, 8)}-${String(ticket.startDate).slice(0, 4)}`;
            document.getElementById('details').textContent = `Details: ${ticket.additionalInfo}`;
        } else {
            //not found
            document.body.innerHTML = '<h1>Ticket not found</h1>';
        }
    })
    .catch(error => {
        console.error('Error fetching ticket details:', error);
        document.body.innerHTML = '<h1>Error loading ticket details. Please try again later.</h1>';
    });

document.getElementById('buy-button').addEventListener('click', function () {
    alert('Redirecting to purchase page...');
});
