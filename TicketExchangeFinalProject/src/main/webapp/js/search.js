document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const keyword = document.getElementById('search-keyword').value;
    const priceMin = document.getElementById('price-min').value;
    const priceMax = document.getElementById('price-max').value;
    const dateStart = document.getElementById('date-start').value;
    const dateEnd = document.getElementById('date-end').value;
    const sortBy = document.getElementById('sort-by').value;

    fetchTickets(keyword, priceMin, priceMax, dateStart, dateEnd, sortBy);
});

function fetchTickets(keyword, priceMin, priceMax, dateStart, dateEnd, sortBy) {
    //
    const db = firebase.firestore();
    let query = db.collection("tickets");

    if (keyword) query = query.where("eventName", "==", keyword);
    if (priceMin) query = query.where("ticketPrice", ">=", parseInt(priceMin));
    if (priceMax) query = query.where("ticketPrice", "<=", parseInt(priceMax));
    if (dateStart) query = query.where("startDate", ">=", new Date(dateStart));
    if (dateEnd) query = query.where("startDate", "<=", new Date(dateEnd));
    //

    query.get()
        .then(snapshot => {
            const resultsContainer = document.getElementById('results-container');
            resultsContainer.innerHTML = '';
            snapshot.forEach(doc => {
                const ticket = doc.data();
                resultsContainer.innerHTML += `<div class="ticket-item">
                    <h3>${ticket.eventName}</h3>
                    <p>Price: $${ticket.ticketPrice}</p>
                    <p>Date: ${new Date(ticket.startDate).toLocaleDateString()}</p>
                </div>`;
            });
        })
        .catch(error => console.error("Error fetching tickets:", error));
}
