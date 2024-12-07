function showSection(sectionId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
  }
  
  function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
  }
  
  function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
  }
  