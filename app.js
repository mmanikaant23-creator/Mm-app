// ============================================
// 🚀 SWIGGY LOOT ARENA — Advanced App Logic
// Particle Vortex, 3D Tilt, Confetti, Haptics,
// Staggered Animations, User Greeting, Countdown
// ============================================

// Loader Trivia Tips
const LOADER_TIPS = [
    "Initializing secure match session...",
    "Connecting to Live stadium feeds...",
    "Bundling match day special offers...",
    "Setting up low-latency wrapper...",
    "Finalizing exclusive Swiggy deals...",
    "Loading premium deal algorithms...",
    "Syncing with Swiggy servers...",
    "Preparing your personalized offers..."
];

// Initialize Telegram WebApp SDK
const tg = window.Telegram ? window.Telegram.WebApp : null;

// ============================================
// 🎊 CONFETTI ENGINE
// ============================================
class ConfettiEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.running = false;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = Math.min(window.innerWidth, 480);
        this.canvas.height = window.innerHeight;
    }

    burst(count = 120) {
        if (!this.canvas) return;
        const colors = ['#fc8019', '#ff993b', '#0ef6cc', '#8a3ffc', '#ffbe1a', '#ff4b4b', '#00f064', '#fff'];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: -20 - Math.random() * 40,
                w: Math.random() * 8 + 4,
                h: Math.random() * 5 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 6,
                vy: Math.random() * 4 + 2,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 12,
                opacity: 1,
                decay: Math.random() * 0.008 + 0.003
            });
        }
        if (!this.running) {
            this.running = true;
            this.animate();
        }
    }

    animate() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08;
            p.rotation += p.rotSpeed;
            p.opacity -= p.decay;

            if (p.opacity <= 0) return false;

            this.ctx.save();
            this.ctx.globalAlpha = p.opacity;
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            this.ctx.restore();

            return true;
        });

        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.running = false;
        }
    }
}

// ============================================
// 🌌 PARTICLE VORTEX ENGINE (Splash Screen)
// ============================================
class ParticleVortex {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.centerX = 0;
        this.centerY = 0;
        this.running = true;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.init();
        this.animate();
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    init() {
        const colors = ['rgba(252, 128, 25, 0.6)', 'rgba(14, 246, 204, 0.5)', 'rgba(138, 63, 252, 0.4)', 'rgba(255, 190, 26, 0.5)', 'rgba(255, 255, 255, 0.3)'];
        for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * Math.max(this.canvas.width, this.canvas.height) * 0.5;
            this.particles.push({
                x: this.centerX + Math.cos(angle) * radius,
                y: this.centerY + Math.sin(angle) * radius,
                size: Math.random() * 2.5 + 0.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                angle: angle,
                radius: radius,
                speed: Math.random() * 0.008 + 0.003,
                drift: Math.random() * 0.3 + 0.1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    animate() {
        if (!this.running || !this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.angle += p.speed;
            p.radius -= p.drift;
            if (p.radius < 5) {
                p.radius = Math.max(this.canvas.width, this.canvas.height) * 0.4;
                p.opacity = 0;
            }
            p.opacity = Math.min(p.opacity + 0.005, 0.7);

            p.x = this.centerX + Math.cos(p.angle) * p.radius;
            p.y = this.centerY + Math.sin(p.angle) * p.radius;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.opacity;
            this.ctx.fill();
        });

        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this.animate());
    }

    stop() {
        this.running = false;
    }
}

// ============================================
// 🃏 3D TILT CARD ENGINE
// ============================================
class TiltEngine {
    constructor() {
        this.cards = document.querySelectorAll('.tilt-card');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            // Only use tilt on mouse events (desktop) to prevent mobile lag
            card.addEventListener('mousemove', (e) => this.handleMouse(e, card));
            card.addEventListener('mouseleave', () => this.resetTilt(card));

            // Ripple effect (lightweight)
            card.addEventListener('touchstart', (e) => this.createRipple(e, card), { passive: true });
            card.addEventListener('mousedown', (e) => this.createRipple(e, card));
        });
    }
    handleMouse(e, card) {
        const rect = card.getBoundingClientRect();
        this.applyTilt(card, e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
    }

    applyTilt(card, x, y, w, h) {
        const tiltX = ((y / h) - 0.5) * -8;
        const tiltY = ((x / w) - 0.5) * 8;
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.01)`;

        // Move shine overlay
        const shine = card.querySelector('.tilt-shine');
        if (shine) {
            shine.style.opacity = '1';
            shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.1), transparent 60%)`;
        }
    }

    resetTilt(card) {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        const shine = card.querySelector('.tilt-shine');
        if (shine) {
            shine.style.opacity = '0';
        }
    }

    createRipple(e, card) {
        const container = card.querySelector('.ripple-container');
        if (!container) return;

        const rect = card.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        const size = Math.max(rect.width, rect.height);

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x - size / 2}px`;
        ripple.style.top = `${y - size / 2}px`;

        container.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
}

// ============================================
// ⏱️ COUNTDOWN TIMER
// ============================================
class CountdownTimer {
    constructor(elementId) {
        this.el = document.getElementById(elementId);
        if (!this.el) return;

        // Set countdown to 2 hours 34 minutes 12 seconds from now
        this.endTime = Date.now() + (2 * 60 * 60 + 34 * 60 + 12) * 1000;
        this.update();
        this.interval = setInterval(() => this.update(), 1000);
    }

    update() {
        const remaining = Math.max(0, this.endTime - Date.now());
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        if (this.el) {
            this.el.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
    }
}

// ============================================
// 🎭 STAGGERED ENTRY ANIMATION
// ============================================
class StaggeredEntry {
    constructor(selector = '.stagger-item', baseDelay = 100) {
        this.items = document.querySelectorAll(selector);
        this.baseDelay = baseDelay;
    }

    trigger() {
        this.items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * this.baseDelay);
        });
    }
}

// ============================================
// 🔊 HAPTIC FEEDBACK HELPER
// ============================================
const haptic = {
    light: () => { if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light'); },
    medium: () => { if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium'); },
    heavy: () => { if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('heavy'); },
    success: () => { if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success'); },
    warning: () => { if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('warning'); },
    error: () => { if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error'); }
};

// ============================================
// 🚀 MAIN APP INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    // Retrieve active Telegram User ID
    const userId = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) ? tg.initDataUnsafe.user.id : null;
    const userFirstName = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) ? tg.initDataUnsafe.user.first_name : null;
    const userPhoto = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) ? tg.initDataUnsafe.user.photo_url : null;

    // Initialize Engines
    const confetti = new ConfettiEngine('confetti-canvas');
    const particleVortex = new ParticleVortex('particle-canvas');
    const staggeredEntry = new StaggeredEntry('.stagger-item', 120);

    // 1. Enforce Telegram App Only (on production live domains)
    const initData = tg ? tg.initData : "";
    const isLocalhost = window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".internal");

    if (!initData && !isLocalhost) {
        const tgOnlyScreen = document.getElementById("telegram-only-screen");
        if (tgOnlyScreen) {
            tgOnlyScreen.classList.remove("hidden");
        }
        const splash = document.getElementById("splash-screen");
        if (splash) splash.classList.add("hidden");
        const dashboard = document.getElementById("main-dashboard");
        if (dashboard) dashboard.classList.add("hidden");
        return;
    }

    // 2. Configure Telegram Environment
    if (tg) {
        tg.ready();
        tg.expand();
        if (typeof tg.setHeaderColor === 'function') {
            tg.setHeaderColor('#06050c');
        }
        if (typeof tg.setBackgroundColor === 'function') {
            tg.setBackgroundColor('#06050c');
        }
    }

    // ==========================================
    // 🔗 SMART EXTERNAL LINK OPENER
    // Opens in Telegram in-app browser (keeps mini app alive)
    // Falls back to window.open on regular browser
    // ==========================================
    const openExternalUrl = (url) => {
        const redirectScreen = document.getElementById("redirect-screen");
        if (redirectScreen) redirectScreen.classList.add("hidden");

        // Force navigation inside the same Telegram WebApp frame
        // This prevents the URL from being exposed in Chrome or the Telegram In-App Browser URL bar
        window.location.href = url;
    };

    // ==========================================
    // 👋 USER AVATAR GREETING
    // ==========================================
    const setupGreeting = () => {
        const greetingEl = document.getElementById('greeting-hello');
        const avatarEl = document.getElementById('user-avatar');

        if (userFirstName && greetingEl) {
            // Time-based greeting
            const hour = new Date().getHours();
            let greeting = 'Hey';
            if (hour < 12) greeting = 'Good morning';
            else if (hour < 17) greeting = 'Good afternoon';
            else greeting = 'Good evening';

            greetingEl.textContent = `${greeting}, ${userFirstName}! 👋`;
        }

        // Set user photo if available
        if (userPhoto && avatarEl) {
            avatarEl.innerHTML = `<img src="${userPhoto}" alt="Profile" onerror="this.parentElement.innerHTML='<ion-icon name=\\'person\\' class=\\'avatar-fallback\\'></ion-icon>'">`;
        }
    };

    // ==========================================
    // 🔧 ELEMENTS
    // ==========================================
    const splashScreen = document.getElementById("splash-screen");
    const mainDashboard = document.getElementById("main-dashboard");
    const progressBar = document.getElementById("progress-bar");
    const loaderTip = document.getElementById("loader-tip");

    // Join Gate Elements
    const joinModal = document.getElementById("join-modal");
    const joinModalContent = document.getElementById("join-modal-content");
    const btnVerifyJoin = document.getElementById("btn-verify-join");
    const verifyLoader = document.getElementById("verify-loader");
    const verifyError = document.getElementById("verify-error");
    const verifySuccess = document.getElementById("verify-success");
    const verifyScreen = document.getElementById("verify-screen");
    const verifyStatusText = document.getElementById("verify-status-text");

    // Track forceJoin setting
    let forceJoinEnabled = true;

    // Fetch settings from the server
    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            forceJoinEnabled = data.forceJoin;
        } catch (e) {
            console.error("Failed to fetch settings:", e);
            forceJoinEnabled = true;
        }
    };

    fetchSettings();

    // ==========================================
    // 🎬 SPLASH LOADER SEQUENCE
    // ==========================================
    let progress = 0;
    let tipIndex = 0;

    const tipInterval = setInterval(() => {
        if (progress < 95) {
            tipIndex = (tipIndex + 1) % LOADER_TIPS.length;
            if (loaderTip) {
                loaderTip.style.opacity = '0';
                setTimeout(() => {
                    loaderTip.textContent = LOADER_TIPS[tipIndex];
                    loaderTip.style.opacity = '1';
                }, 200);
            }
        }
    }, 800);

    // Function to show the main dashboard (after gate passes)
    const showDashboard = () => {
        mainDashboard.classList.remove("hidden");
        haptic.medium();

        // Show FAB menu & sticky credits
        const fabEl = document.getElementById('fab-menu');
        if (fabEl) fabEl.classList.remove('hidden');
        const creditsEl = document.getElementById('sticky-credits');
        if (creditsEl) creditsEl.style.display = '';

        // Setup user greeting
        setupGreeting();

        // Initialize engines that depend on dashboard being visible
        setTimeout(() => {
            // Trigger staggered entry animations
            staggeredEntry.trigger();

            // Initialize 3D tilt cards
            new TiltEngine();

            // Initialize countdown timer
            new CountdownTimer('countdown-timer');

            // Fire confetti celebration!
            confetti.burst(100);
            setTimeout(() => confetti.burst(60), 400);

            // Initialize FAQ accordion
            document.querySelectorAll('.faq-question').forEach(btn => {
                btn.addEventListener('click', () => {
                    const item = btn.closest('.faq-item');
                    const isOpen = item.classList.contains('open');

                    // Close all other items
                    document.querySelectorAll('.faq-item.open').forEach(openItem => {
                        openItem.classList.remove('open');
                    });

                    // Toggle clicked item
                    if (!isOpen) {
                        item.classList.add('open');
                    }

                    haptic.light();
                });
            });
        }, 100);
    };

    // Function to show the join gate modal
    const showJoinGate = () => {
        joinModal.classList.remove("hidden");
        haptic.warning();
    };

    // Auto-verify membership
    const silentVerifyMembership = async () => {
        try {
            const res = await fetch(`/api/verify-membership?userId=${userId || ''}`);
            const data = await res.json();
            return !!data.joined;
        } catch (e) {
            console.error("Silent membership check failed:", e);
            return false;
        }
    };

    // Progress bar loader simulation
    const progressInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 6) + 3;

        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            clearInterval(tipInterval);

            setTimeout(async () => {
                // Stop particle vortex
                particleVortex.stop();

                // Fade out splash
                splashScreen.style.transition = 'opacity 0.4s ease';
                splashScreen.style.opacity = '0';

                setTimeout(() => {
                    splashScreen.classList.add("hidden");
                    splashScreen.style.opacity = '1';
                }, 400);

                if (forceJoinEnabled) {
                    verifyScreen.classList.remove("hidden");

                    setTimeout(() => {
                        if (verifyStatusText) verifyStatusText.textContent = "Scanning your Telegram profile...";
                    }, 600);
                    setTimeout(() => {
                        if (verifyStatusText) verifyStatusText.textContent = "Validating channel membership...";
                    }, 1200);

                    const alreadyMember = await silentVerifyMembership();

                    if (alreadyMember) {
                        if (verifyStatusText) verifyStatusText.textContent = "✓ Access Verified — Welcome back!";
                        haptic.success();

                        setTimeout(() => {
                            verifyScreen.classList.add("hidden");
                            showDashboard();
                        }, 800);
                    } else {
                        if (verifyStatusText) verifyStatusText.textContent = "Membership not found...";

                        setTimeout(() => {
                            verifyScreen.classList.add("hidden");
                            showJoinGate();
                        }, 600);
                    }
                } else {
                    showDashboard();
                }
            }, 300);
        }
        if (progressBar) progressBar.style.width = `${progress}%`;
    }, 120);

    // ==========================================
    // 🔓 DIRECT UNLOCK HANDLER
    // ==========================================
        if (btnVerifyJoin) {
            btnVerifyJoin.addEventListener("click", () => {
        // Haptic feedback
        if (typeof haptic !== "undefined" && haptic.success) {
            haptic.success();
        }

        // Hide Join Modal and Verification Screen
        if (typeof joinModal !== "undefined" && joinModal) {
            joinModal.classList.add("hidden");
        }
        if (typeof verifyScreen !== "undefined" && verifyScreen) {
            verifyScreen.classList.add("hidden");
        }

        // Open Dashboard
        if (typeof showDashboard === "function") {
            showDashboard();
        }

        // Celebration Confetti
        if (typeof confetti !== "undefined" && confetti.burst) {
            confetti.burst(150);
        }

        // Save join status locally so modal doesn't pop up again
        localStorage.setItem("hasJoinedChannels", "true");
    });
}

    // ==========================================
    // 🚀 FOOD REDIRECT HANDLER
    // ==========================================
    const handleFoodRedirect = async () => {
        const redirectScreen = document.getElementById("redirect-screen");
        if (redirectScreen) {
            redirectScreen.classList.remove("hidden");
        }

        haptic.light();

        try {
            const res = await fetch(`/api/redirect-link?userId=${userId || ''}`);

            if (res.status === 403) {
                if (redirectScreen) redirectScreen.classList.add("hidden");
                if (joinModal) joinModal.classList.remove("hidden");
                if (verifyError) verifyError.classList.remove("hidden");
                if (joinModalContent) {
                    joinModalContent.classList.add("shake-anim");
                    setTimeout(() => {
                        joinModalContent.classList.remove("shake-anim");
                    }, 400);
                }
                return;
            }

            const data = await res.json();
            if (data.error) {
                throw new Error(data.error);
            }

            const destinationUrl = data.redirectUrl;
            setTimeout(() => {
                openExternalUrl(destinationUrl);
            }, 800);
        } catch (e) {
            console.error("Food redirection failed, using default:", e);
            const DEFAULT_FOOD_FALLBACK = "https://www.swiggy.com/ipl-landing?x-channel=jiohotstar&hsClkId=f69664a025104e65b977cff483867cdf.f69664a025104e65b977cff483867cdf.SwiggyLimited_Swiggy_IPL26_BrandTab_campaignName_BrandTab.1775568784797";
            setTimeout(() => {
                openExternalUrl(DEFAULT_FOOD_FALLBACK);
            }, 800);
        }
    };

    // ==========================================
    // 🛒 INSTAMART REDIRECT HANDLER
    // ==========================================
    const handleInstamartRedirect = async () => {
        const redirectScreen = document.getElementById("redirect-screen");
        if (redirectScreen) {
            redirectScreen.classList.remove("hidden");
        }

        haptic.light();

        try {
            const res = await fetch(`/api/instamart-redirect-link?userId=${userId || ''}`);

            if (res.status === 403) {
                if (redirectScreen) redirectScreen.classList.add("hidden");
                if (joinModal) joinModal.classList.remove("hidden");
                if (verifyError) verifyError.classList.remove("hidden");
                if (joinModalContent) {
                    joinModalContent.classList.add("shake-anim");
                    setTimeout(() => {
                        joinModalContent.classList.remove("shake-anim");
                    }, 400);
                }
                return;
            }

            const data = await res.json();
            if (data.error) {
                throw new Error(data.error);
            }

            const destinationUrl = data.redirectUrl;
            setTimeout(() => {
                openExternalUrl(destinationUrl);
            }, 800);
        } catch (e) {
            console.error("Instamart redirection failed, using default:", e);
            const DEFAULT_INSTAMART_FALLBACK = "https://www.swiggy.com/instamart/jhs-landing?custom_back=true&layoutId=33909&customerPage=STORES_MxN_95&x-channel=jiohotstar&hsClkId=28cada62132d497bb9d4ff879117c8a4.28cada62132d497bb9d4ff879117c8a4.SwiggyLimited_SwiggyInstamart_IndEng2026_BrandTab_campaignName_BrandTab.1784210965576";
            setTimeout(() => {
                openExternalUrl(DEFAULT_INSTAMART_FALLBACK);
            }, 800);
        }
    };

    // ==========================================
    // 🎯 ATTACH EVENT LISTENERS TO CARDS
    // ==========================================
    const foodCard = document.getElementById("food-card");
    const instamartCard = document.getElementById("instamart-card");

    if (foodCard) {
        foodCard.addEventListener("click", handleFoodRedirect);
    }
    if (instamartCard) {
        instamartCard.addEventListener("click", handleInstamartRedirect);
    }

    // ==========================================
    // 🔊 HAPTIC ON ALL BUTTONS
    // ==========================================
    document.querySelectorAll('button, .btn-join-channel, .btn-primary, .landing-card').forEach(el => {
        el.addEventListener('touchstart', () => haptic.light(), { passive: true });
    });

    // ==========================================
    // 🔘 FLOATING ACTION BUTTON (FAB) MENU
    // ==========================================
    const fabMenu = document.getElementById('fab-menu');
    const fabToggle = document.getElementById('fab-toggle');
    const fabShare = document.getElementById('fab-share');
    const fabSupport = document.getElementById('fab-support');
    const fabSwitch = document.getElementById('fab-switch');

    // Create backdrop element
    const fabBackdrop = document.createElement('div');
    fabBackdrop.className = 'fab-backdrop';
    document.body.appendChild(fabBackdrop);

    // Toggle FAB open/close
    const toggleFab = () => {
        if (!fabMenu) return;
        const isOpen = fabMenu.classList.contains('open');
        if (isOpen) {
            fabMenu.classList.remove('open');
            fabBackdrop.classList.remove('active');
        } else {
            fabMenu.classList.add('open');
            fabBackdrop.classList.add('active');
            haptic.light();
        }
    };

    const closeFab = () => {
        if (fabMenu) fabMenu.classList.remove('open');
        fabBackdrop.classList.remove('active');
    };

    if (fabToggle) {
        fabToggle.addEventListener('click', toggleFab);
    }

    // Close FAB when backdrop is tapped
    fabBackdrop.addEventListener('click', closeFab);

    // 📤 SHARE — Share bot link with friends via Telegram
    if (fabShare) {
        fabShare.addEventListener('click', () => {
            haptic.medium();
            closeFab();

            const shareText = '🍔 *Swiggy Loot Arena* 🍔\n\n🔥 Get up to 60% OFF on your favorite food & grab ₹1 Instamart deals right now!\n\n👉 Start looting here: @Swiggybuzz_ibot';

            if (tg && typeof tg.openTelegramLink === 'function') {
                // Reliable Telegram native share (text only, bot tag inside)
                tg.openTelegramLink(`https://t.me/share/url?text=${encodeURIComponent(shareText)}`);
            } else {
                // Browser fallback: copy link
                const botLink = 'https://t.me/Swiggybuzz_ibot';
                navigator.clipboard.writeText(shareText).then(() => {
                    alert('Message copied to clipboard! Share it with your friends.');
                }).catch(() => {
                    window.open(`https://t.me/share/url?text=${encodeURIComponent(shareText)}`, '_blank');
                });
            }
        });
    }

    // 💬 SUPPORT — Open official Telegram channel
    if (fabSupport) {
        fabSupport.addEventListener('click', () => {
            haptic.light();
            closeFab();

            const channelUrl = 'https://t.me/swiggylooters06';
            if (tg && typeof tg.openTelegramLink === 'function') {
                tg.openTelegramLink(channelUrl);
            } else {
                window.open(channelUrl, '_blank');
            }
        });
    }

    // 🔄 SWITCH ACCOUNT — Clear all data and start fresh
    if (fabSwitch) {
        fabSwitch.addEventListener('click', () => {
            haptic.heavy();
            closeFab();

            // Inform the user that they must log out on Swiggy's website
            alert("To switch your Swiggy account, we will redirect you to Swiggy's account page. Please log out from there, then return to this bot to continue with a new account.");
            
            // Redirect to Swiggy's account page where they can log out
            setTimeout(() => {
                window.location.href = 'https://www.swiggy.com/my-account';
            }, 500);
        });
    }
});
