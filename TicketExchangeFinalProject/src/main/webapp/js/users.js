document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('user_id');
    if(!token) {
      // User not logged in
      window.location.href = "login.html";
      return;
    }
    document.addEventListener('DOMContentLoaded', function () {
        const sections = document.querySelectorAll('.page-section');
        const navLinks = document.querySelectorAll('nav a[data-section]');
      
        function showSection(sectionId) {
          sections.forEach(section => {
            section.style.display = section.id === sectionId ? 'block' : 'none';
          });
        }
      
        navLinks.forEach(link => {
          link.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
          });
        });
      
        // Initially show the first section or a specific one
        showSection('section-postings'); // Show 'My Postings' by default or use sessionStorage to remember last opened tab
      });
      
      // Logout functionality remains the same
      document.getElementById('logoutBtn').addEventListener('click', function () {
        // Clear session storage or any auth tokens
        sessionStorage.clear();
        window.location.href = 'login.html'; // Redirect to login page after logout
      });
      
    // Navigation handling
    document.querySelectorAll('nav a[data-section]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        showSection(sectionId);
  
        // Load data depending on the section
        switch(sectionId) {
          case 'section-postings':
            loadUserPostings();
            break;
          case 'section-past-tickets':
            loadPastTickets();
            break;
          case 'section-offers':
            loadOffers();
            break;
          case 'section-favorites':
            loadFavorites();
            break;
          case 'section-profile':
            loadUserProfile();
            break;
        }
      });
    });
  
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.href = "login.html";
    });
  
    // Postings
    document.getElementById('add-posting-btn')?.addEventListener('click', () => {
      document.getElementById('posting-modal-title').textContent = "Add New Posting";
      document.getElementById('posting-form').reset();
      document.getElementById('posting-id').value = "";
      openModal('posting-modal');
    });
  
    // Close modal
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        closeModal('posting-modal');
      });
    });
  
    // Save posting form
    document.getElementById('posting-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const posting = {
        postingId: document.getElementById('posting-id').value || null,
        eventName: document.getElementById('eventName').value,
        ticketPrice: parseFloat(document.getElementById('ticketPrice').value),
        eventSlot: document.getElementById('eventSlot').value,
        ticketCount: parseInt(document.getElementById('ticketCount').value, 10)
      };
      await addOrEditPosting(posting);
      closeModal('posting-modal');
      loadUserPostings();
    });
  
    // Profile form
    document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const profile = {
        name: document.getElementById('profileName').value,
        phoneNumber: document.getElementById('profilePhone').value,
        email: document.getElementById('profileEmail').value,
        otherContact: JSON.parse(document.getElementById('profileContact').value || "{}")
      };
      await updateUserProfile(profile);
      alert('Profile updated!');
    });
  });
  
  async function loadUserPostings() {
    const postings = await fetchUserPostings();
    const tbody = document.querySelector('#postings-table tbody');
    tbody.innerHTML = '';
    postings.forEach(posting => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${posting.eventName}</td>
        <td>${posting.ticketPrice}</td>
        <td>${posting.eventSlot}</td>
        <td>${posting.ticketCount}</td>
        <td>
          <button class="edit-posting-btn" data-id="${posting.ticketId}">Edit</button>
          <button class="delete-posting-btn" data-id="${posting.ticketId}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  
    // Edit / Delete Handlers
    document.querySelectorAll('.edit-posting-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const posting = postings.find(p => p.ticketId === id);
        if (posting) {
          document.getElementById('posting-modal-title').textContent = "Edit Posting";
          document.getElementById('posting-id').value = posting.ticketId;
          document.getElementById('eventName').value = posting.eventName;
          document.getElementById('ticketPrice').value = posting.ticketPrice;
          document.getElementById('eventSlot').value = posting.eventSlot;
          document.getElementById('ticketCount').value = posting.ticketCount;
          openModal('posting-modal');
        }
      });
    });
  
    document.querySelectorAll('.delete-posting-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm("Are you sure you want to delete this posting?")) {
          await deletePosting(id);
          loadUserPostings();
        }
      });
    });
  }
  
  async function loadPastTickets() {
    const tickets = await fetchPastTickets();
    const tbody = document.querySelector('#past-tickets-table tbody');
    tbody.innerHTML = '';
    tickets.forEach(ticket => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${ticket.eventName}</td>
        <td>${ticket.soldPrice}</td>
        <td>${ticket.eventSlot}</td>
        <td>${ticket.quantity}</td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  async function loadOffers() {
    const offers = await fetchOffers();
    const tbody = document.querySelector('#offers-table tbody');
    tbody.innerHTML = '';
    offers.forEach(offer => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${offer.eventName}</td>
        <td>${offer.offerPrice}</td>
        <td>${offer.status}</td>
        <td>
          ${offer.status === 'pending' ? `
            <button class="accept-offer-btn" data-id="${offer.offerId}">Accept</button>
            <button class="reject-offer-btn" data-id="${offer.offerId}">Reject</button>
          ` : ''}
        </td>
      `;
      tbody.appendChild(tr);
    });
  
    document.querySelectorAll('.accept-offer-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await acceptOffer(id);
        loadOffers();
      });
    });
  
    document.querySelectorAll('.reject-offer-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        await rejectOffer(id);
        loadOffers();
      });
    });
  }
  
  async function loadFavorites() {
    const favorites = await fetchFavorites();
    const list = document.getElementById('favorites-list');
    list.innerHTML = '';
    favorites.forEach(fav => {
      const li = document.createElement('li');
      li.textContent = fav.eventName + " - $" + fav.ticketPrice;
      list.appendChild(li);
    });
  }
  
  async function loadUserProfile() {
    const profile = await fetchUserProfile();
    document.getElementById('profileName').value = profile.name || '';
    document.getElementById('profilePhone').value = profile.phoneNumber || '';
    document.getElementById('profileEmail').value = profile.email || '';
    document.getElementById('profileContact').value = JSON.stringify(profile.otherContact || {});
  }
  