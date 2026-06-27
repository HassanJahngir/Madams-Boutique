document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.querySelector('.preloader');
  const scrollTopBtn = document.querySelector('.scroll-top');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryImage = document.getElementById('galleryImage');
  const reveals = document.querySelectorAll('.reveal');

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader?.classList.add('hidden');
    }, 600);
  });

  window.addEventListener('scroll', () => {
    scrollTopBtn?.classList.toggle('show', window.scrollY > 700);
  });

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    reveals.forEach((item) => observer.observe(item));
  } else {
    reveals.forEach((item) => item.classList.add('is-visible'));
  }

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const imageUrl = item.getAttribute('data-image');
      if (galleryImage && imageUrl) {
        galleryImage.src = imageUrl;
      }
    });
  });
});
document.addEventListener("DOMContentLoaded",()=>{

const preloader=document.querySelector(".preloader");
const scrollTop=document.querySelector(".scroll-top");
const reveals=document.querySelectorAll(".reveal");
const counters=document.querySelectorAll("[data-count]");

window.addEventListener("load",()=>{

setTimeout(()=>{
preloader.classList.add("hidden");
},700);

});

window.addEventListener("scroll",()=>{

if(scrollTop){

scrollTop.classList.toggle("show",window.scrollY>500);

}

const progress=document.querySelector(".progress-bar-top");

if(progress){

const total=document.documentElement.scrollHeight-window.innerHeight;

const percent=(window.scrollY/total)*100;

progress.style.width=percent+"%";

}

});

if(scrollTop){

scrollTop.onclick=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

};

}

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("is-visible");

observer.unobserve(entry.target);

}

});

},{threshold:.15});

reveals.forEach(el=>observer.observe(el));

const counterObserver=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(!entry.isIntersecting) return;

const el=entry.target;

const target=+el.dataset.count;

let count=0;

const speed=Math.max(10,target/120);

const update=()=>{

count+=speed;

if(count<target){

el.innerText=Math.floor(count);

requestAnimationFrame(update);

}else{

el.innerText=target;

}

};

update();

counterObserver.unobserve(el);

});

},{threshold:.5});

counters.forEach(c=>counterObserver.observe(c));

const parallax=document.querySelectorAll(".parallax");

document.addEventListener("mousemove",e=>{

const x=(e.clientX/window.innerWidth-.5)*20;

const y=(e.clientY/window.innerHeight-.5)*20;

parallax.forEach(item=>{

item.style.transform=`translate(${x}px,${y}px)`;

});

});

});
const sections=document.querySelectorAll("section");
const navLinks=document.querySelectorAll(".nav-link");

window.addEventListener("scroll",()=>{

let current="";

sections.forEach(section=>{

const top=section.offsetTop-150;

if(pageYOffset>=top){

current=section.getAttribute("id");

}

});

navLinks.forEach(link=>{

link.classList.remove("active");

const href=link.getAttribute("href");

if(href&&href.includes(current)){

link.classList.add("active");

}

});

});

document.querySelectorAll(".gallery-item img").forEach(img=>{

img.addEventListener("mouseenter",()=>{

img.style.transform="scale(1.1)";

});

img.addEventListener("mouseleave",()=>{

img.style.transform="scale(1)";

});

});

document.querySelectorAll(".btn").forEach(button=>{

button.addEventListener("click",function(e){

const ripple=document.createElement("span");

const rect=this.getBoundingClientRect();

const size=Math.max(rect.width,rect.height);

ripple.style.cssText=`
width:${size}px;
height:${size}px;
left:${e.clientX-rect.left-size/2}px;
top:${e.clientY-rect.top-size/2}px;
position:absolute;
border-radius:50%;
background:rgba(255,255,255,.5);
transform:scale(0);
animation:ripple .6s linear;
pointer-events:none;
`;

this.appendChild(ripple);

setTimeout(()=>ripple.remove(),600);

});

});



document.querySelectorAll(".collection-card,.designer-card").forEach(card=>{

card.addEventListener("mousemove",e=>{

const rect=card.getBoundingClientRect();

const x=e.clientX-rect.left;

const y=e.clientY-rect.top;

const rx=-(y-rect.height/2)/20;

const ry=(x-rect.width/2)/20;

card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;

});

card.addEventListener("mouseleave",()=>{

card.style.transform="perspective(900px) rotateX(0) rotateY(0)";

});

});

const images=document.querySelectorAll("img");

const imageObserver=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.style.opacity="1";

entry.target.style.transform="translateY(0)";

}

});

});

images.forEach(img=>{

img.style.opacity="0";

img.style.transform="translateY(30px)";

img.style.transition=".8s";

imageObserver.observe(img);

});
