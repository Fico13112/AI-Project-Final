/* Variable */
const parallax_el = document.querySelectorAll(".parallax");

let xValue = 0,
    yValue = 0;

/* The Parralax Effect Script */
window.addEventListener("mousemove", (e) => {
  if (timeline.isActive()) return;

  xValue = e.clientX - window.innerWidth / 2;
  yValue = e.clientY - window.innerHeight / 2;

  parallax_el.forEach(el => {
    let speedx = el.dataset.speedx;
    let speedy = el.dataset.speedy;
    el.style.transform = `translateX(calc(-50% + ${-xValue * speedx}px)) translateY(calc(-50% + ${yValue * speedy}px))`;
  });
});


let timeline = gsap.timeline();

// Make sure previous transforms are cleared (important if you reload)
gsap.set(parallax_el, { clearProps: "all" });

// Animate each parallax layer except text
Array.from(parallax_el)
  .filter(el => !el.classList.contains("text"))
  .forEach((el) => {
    const distance = +el.dataset.distance || 100;

    // Animate upward from a lower starting point
    timeline.fromTo(
      el,
      {
        y: distance, // start lower
        opacity: 0,  // fade in
      },
      {
        y: 0,        // end at normal position
        opacity: 1,
        duration: 2,
        ease: "power2.out",
        immediateRender: false, // 🧠 prevents flicker/jump on reload
      },
      0 // start all together
    );
  });

// Optional: play timeline immediately
timeline.play();

// Navbar
const header = document.getElementById('header');
const toggleBtn = document.getElementById('navToggle');
let headerVisible = true;

toggleBtn.addEventListener('click', () => {
  headerVisible = !headerVisible;

  header.classList.toggle('hide', !headerVisible);

  // Change toggle icon to indicate action
  toggleBtn.innerHTML = headerVisible
    ? '<i class="fa-solid fa-chevron-up"></i>'
    : '<i class="fa-solid fa-chevron-down"></i>';
});

