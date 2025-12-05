const header = document.getElementById('header');
const toggleBtn = document.getElementById('navToggle');
let headerVisible = true;

toggleBtn.addEventListener('click', () => {
  headerVisible = !headerVisible;

  header.classList.toggle('hide', !headerVisible);

  toggleBtn.innerHTML = headerVisible
    ? '<i class="fa-solid fa-chevron-up"></i>'
    : '<i class="fa-solid fa-chevron-down"></i>';
});