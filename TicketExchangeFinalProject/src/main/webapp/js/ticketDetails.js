const urlParams = new URLSearchParams(window.location.search);
const ticketID = urlParams.get('ticketID');

fetch('db/tickets.json')
    .then(response => response.json())
    .then(tickets => {
        const ticket = tickets.find(ticket => ticket.ticketID == ticketID);

        if (ticket) {
            document.getElementById('event-name').textContent = ticket.eventName;
            document.getElementById('poster').src = ticket.poster || 'images/sclogo.png';
            document.getElementById('poster').alt = ticket.eventName;
            document.getElementById('price').textContent = `$${ticket.ticketPrice}`;
            document.getElementById('date').textContent = `${String(ticket.startDate).slice(4, 6)}-${String(ticket.startDate).slice(6, 8)}-${String(ticket.startDate).slice(0, 4)}`;
            document.getElementById('details').textContent = `${ticket.additionalInfo}`;
			document.getElementById('location').textContent = `${ticket.location || 'Not specified'}`;
            const negotiateButton = document.getElementById('negotiate-button');
            if (ticket.negotiable) {
                negotiateButton.style.display = 'inline-block';
                negotiateButton.addEventListener('click', function () {
                    alert(`Starting negotiation for: ${ticket.eventName}`);
                });
            } else {
                negotiateButton.style.display = 'none';
            }

            document.getElementById('buy-button').addEventListener('click', function () {
                alert(`Redirecting to purchase page for: ${ticket.eventName}`);
            });
        } else {
            document.body.innerHTML = '<h1>Ticket not found</h1>';
        }
    })
    .catch(error => {
        console.error('Error fetching ticket details:', error);
        document.body.innerHTML = '<h1>Error loading ticket details. Please try again later.</h1>';
    });
