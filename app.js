const parallax_el = document.querySelectorAll(".parallax");

let xValue = 0,
    yValue = 0;

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

gsap.set(parallax_el, { clearProps: "all" });

Array.from(parallax_el)
  .filter(el => !el.classList.contains("text"))
  .forEach((el) => {
    const distance = +el.dataset.distance || 100;
    timeline.fromTo(
      el,
      {
        y: distance, 
        opacity: 0,  
      },
      {
        y: 0,        
        opacity: 1,
        duration: 2,
        ease: "power2.out",
        immediateRender: false, 
      },
    );
  });

timeline.play();


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
