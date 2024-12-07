// Example API calls for authenticated pages
async function fetchUserPostings() {
    const response = await fetch('/api/user/postings', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });
    return response.json();
  }
  
  async function addOrEditPosting(posting) {
    const method = posting.postingId ? 'PUT' : 'POST';
    const url = posting.postingId ? `/api/user/postings/${posting.postingId}` : '/api/user/postings';
    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(posting)
    });
    return response.json();
  }
  
  async function deletePosting(postingId) {
    await fetch(`/api/user/postings/${postingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });
  }
  
  async function fetchPastTickets() {
    const response = await fetch('/api/user/past-tickets', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });
    return response.json();
  }
  
  async function fetchOffers() {
    const response = await fetch('/api/user/offers', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });
    return response.json();
  }
  
  async function acceptOffer(offerId) {
    return await fetch(`/api/user/offers/${offerId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });
  }
  
  async function rejectOffer(offerId) {
    return await fetch(`/api/user/offers/${offerId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });
  }
  
  async function fetchFavorites() {
    const response = await fetch('/api/user/favorites', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });
    return response.json();
  }
  
  async function fetchUserProfile() {
    const response = await fetch('/api/user/profile', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken')
      }
    });
    return response.json();
  }
  
  async function updateUserProfile(profile) {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profile)
    });
    return response.json();
  }
  