// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot, runTransaction, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";


document.addEventListener('DOMContentLoaded', async function () {
    // --- UI Initializations ---
    lucide.createIcons();
    AOS.init({
        duration: 800,
        once: true,
        anchorPlacement: 'top-bottom',
    });

    // --- Page Navigation & UI Logic ---
    setupEventListeners();
    const initialPage = window.location.hash ? window.location.hash.substring(1) : 'inicio';
    showPage(initialPage);
    
    // --- Firebase & Global Counter Initialization ---
    try {
        setLogLevel('Debug');
        const db = await initializeFirebase();
        await handleGlobalVisitorCounter(db);
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        const counterElement = document.getElementById('visitor-counter');
        if(counterElement) counterElement.textContent = 'N/A';
    }
});

/**
 * Sets up all the event listeners for the page.
 */
function setupEventListeners() {
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const filterButtons = document.querySelectorAll('.portfolio-filter-btn');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const pageId = this.getAttribute('href').substring(1);
            showPage(pageId);
            window.scrollTo(0, 0);
        });
    });

    mobileMenuButton.addEventListener('click', () => {
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenu.classList.toggle('hidden');
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'neon-green-button');
                btn.classList.add('bg-gray-800', 'hover:bg-green-900/50');
            });
            this.classList.add('active', 'neon-green-button');
            this.classList.remove('bg-gray-800', 'hover:bg-green-900/50');
            
            document.querySelectorAll('.portfolio-category').forEach(category => {
                category.classList.toggle('hidden', category.id !== filter);
                category.classList.toggle('active', category.id === filter);
            });
            AOS.refresh();
        });
    });
}

/**
 * Displays the specified page and hides others.
 * @param {string} pageId The ID of the page to show.
 */
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenu = document.getElementById('mobile-menu');

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
        link.classList.toggle('active', link.getAttribute('href') === `#${pageId}`);
    });
    
    mobileMenu.classList.add('hidden');
}

/**
 * Animates the skill bars in the "About Me" section.
 */
function animateSkillBars() {
    document.querySelectorAll('.skill-bar-inner').forEach(bar => {
        bar.style.width = bar.getAttribute('data-width');
    });
}

/**
 * Initializes Firebase app, auth, and Firestore.
 * @returns {Promise<Firestore>} A promise that resolves with the Firestore instance.
 */
async function initializeFirebase() {
    const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
    } else {
        await signInAnonymously(auth);
    }
    console.log("Firebase initialized and user signed in.");
    return db;
}

/**
 * Handles the global visitor counter using Firestore.
 * @param {Firestore} db The Firestore database instance.
 */
async function handleGlobalVisitorCounter(db) {
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const counterRef = doc(db, `artifacts/${appId}/public/data/visitorCounter`, "counter");
    const counterElement = document.getElementById('visitor-counter');

    // Listen for real-time updates to the counter
    onSnapshot(counterRef, (docSnap) => {
        if (docSnap.exists()) {
            if (counterElement) {
                counterElement.textContent = docSnap.data().count;
            }
        } else {
            // If the document doesn't exist, it will be created by the first visitor's transaction.
            if (counterElement) {
                counterElement.textContent = '1';
            }
        }
    });

    // Increment count only once per browser session
    if (!sessionStorage.getItem('sessionVisited')) {
        try {
            await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(counterRef);
                let newCount = 1;
                if (sfDoc.exists()) {
                    newCount = sfDoc.data().count + 1;
                }
                transaction.set(counterRef, { count: newCount });
            });
            console.log("Global visitor count incremented.");
            sessionStorage.setItem('sessionVisited', 'true');
        } catch (e) {
            console.error("Visitor counter transaction failed: ", e);
        }
    }
}


// --- Particle Effect Script (remains unchanged) ---
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
