document.addEventListener('DOMContentLoaded', function () {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Initialize AOS (Animate on Scroll)
    AOS.init({
        duration: 800,
        once: true,
        anchorPlacement: 'top-bottom',
    });

    // --- Page Navigation Logic ---
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    function showPage(pageId) {
        pages.forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            AOS.refresh();
            if (pageId === 'sobre-mi') {
                animateSkillBars();
            }
        }
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${pageId}`) {
                link.classList.add('active');
            }
        });
        
        mobileMenu.classList.add('hidden');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const pageId = this.getAttribute('href').substring(1);
            showPage(pageId);
            window.scrollTo(0, 0);
        });
    });

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // --- Portfolio Filter Logic ---
    const filterButtons = document.querySelectorAll('.portfolio-filter-btn');
    const portfolioCategories = document.querySelectorAll('.portfolio-category');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'neon-green-button');
                btn.classList.add('bg-gray-800', 'hover:bg-green-900/50');
            });
            this.classList.add('active', 'neon-green-button');
            this.classList.remove('bg-gray-800', 'hover:bg-green-900/50');
            
            portfolioCategories.forEach(category => {
                if (category.id === filter) {
                    category.classList.remove('hidden');
                    category.classList.add('active');
                } else {
                    category.classList.remove('active');
                    category.classList.add('hidden');
                }
            });
            AOS.refresh();
        });
    });

    function animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-bar-inner');
        skillBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width;
        });
    }

    // --- Particle Effect Script ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let particlesArray;

        class Particle {
            constructor(x, y, dX, dY, size, color) {
                this.x = x; this.y = y; this.directionX = dX; this.directionY = dY; this.size = size; this.color = color;
            }
            draw() {
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); ctx.fillStyle = this.color; ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0) { this.directionX = -this.directionX; }
                if (this.y > canvas.height || this.y < 0) { this.directionY = -this.directionY; }
                this.x += this.directionX; this.y += this.directionY; this.draw();
            }
        }

        function initParticles() {
            particlesArray = [];
            let numParticles = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < numParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let dX = (Math.random() * 0.4) - 0.2;
                let dY = (Math.random() * 0.4) - 0.2;
                particlesArray.push(new Particle(x, y, dX, dY, 'rgba(0, 179, 0, 0.5)'));
            }
        }

        function animateParticles() {
            requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            for (let i = 0; i < particlesArray.length; i++) { particlesArray[i].update(); }
        }
        
        initParticles();
        animateParticles();

        window.addEventListener('resize', () => {
            canvas.width = innerWidth;
            canvas.height = innerHeight;
            initParticles();
        });
    }

    // --- Visitor Counter Logic ---
    function handleVisitorCounter() {
        // Use sessionStorage to only increment once per session
        if (!sessionStorage.getItem('sessionVisited')) {
            let count = localStorage.getItem('portfolioVisitorCount');
            
            if (count === null) {
                count = 1;
            } else {
                count = parseInt(count) + 1;
            }
            
            localStorage.setItem('portfolioVisitorCount', count);
            sessionStorage.setItem('sessionVisited', 'true');
        }
        
        // Always display the count from localStorage
        const count = localStorage.getItem('portfolioVisitorCount') || 1;
        const counterElement = document.getElementById('visitor-counter');
        if (counterElement) {
            counterElement.textContent = count;
        }
    }

    // --- Initial Setup ---
    const initialPage = window.location.hash ? window.location.hash.substring(1) : 'inicio';
    showPage(initialPage);
    handleVisitorCounter(); // Call the visitor counter on page load
});
