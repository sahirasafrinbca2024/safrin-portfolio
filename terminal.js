// Retro Developer Portfolio Terminal Logic

(function () {
    // ── CANVAS & MATRIX DIGITAL RAIN ──
    const canvas = document.getElementById("matrixCanvas");
    const ctx = canvas.getContext("2d");
    const screenContainer = document.querySelector(".monitor-screen");

    function resizeCanvas() {
        canvas.width = screenContainer.clientWidth;
        canvas.height = screenContainer.clientHeight;
        initMatrix();
    }

    // Keep the canvas fixed in viewport during scroll by translating it
    screenContainer.addEventListener("scroll", () => {
        canvas.style.transform = `translateY(${screenContainer.scrollTop}px)`;
    });

    window.addEventListener("resize", resizeCanvas);

    // Matrix drops initialization
    let columns = [];
    const fontSize = 14;

    function initMatrix() {
        const cols = Math.floor(canvas.width / fontSize);
        columns = [];
        for (let i = 0; i < cols; i++) {
            columns.push({
                x: i * fontSize,
                y: Math.random() * -canvas.height, // start distributed
                speed: 0.8 + Math.random() * 1.5,
                bold: Math.random() > 0.4,
                char: Math.floor(Math.random() * 10),
                opacity: 0.05 + Math.random() * 0.15 // subtle opacity to keep portfolio readable
            });
        }
    }

    // ── EXPLOSION PARTICLE SYSTEM ──
    const particles = [];

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 4.5;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - 1.0; // slight upward float
            this.char = Math.floor(Math.random() * 10);
            this.fontSize = 11 + Math.floor(Math.random() * 12);
            this.bold = Math.random() > 0.4;
            // Matrix shades: neon green, cyan, light green/white
            const colors = ['#39ff8a', '#00e5ff', '#a9ffd1', '#ff6ec7'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = 1.0;
            this.decay = 0.012 + Math.random() * 0.018;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }

        draw(cContext) {
            cContext.save();
            cContext.fillStyle = this.color;
            cContext.globalAlpha = Math.max(0, this.alpha);
            cContext.font = `${this.bold ? 'bold' : 'normal'} ${this.fontSize}px monospace`;
            cContext.fillText(this.char, this.x, this.y);
            cContext.restore();
        }
    }

    function spawnExplosion(x, y, count = 25) {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y));
        }
    }

    function drawParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            if (p.alpha <= 0) {
                particles.splice(i, 1);
            } else {
                p.draw(ctx);
            }
        }
    }

    function triggerExplosionFromEvent(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        spawnExplosion(x, y, 30);
    }

    // Animation Loop
    function animate() {
        // Overlay screen background color with low opacity to clear canvas and create fade trail
        ctx.fillStyle = "rgba(8, 8, 16, 0.12)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Render Matrix Rain
        for (let i = 0; i < columns.length; i++) {
            const c = columns[i];
            ctx.fillStyle = `rgba(57, 255, 138, ${c.opacity})`;
            ctx.font = c.bold ? "bold 14px monospace" : "100 14px monospace";
            ctx.fillText(c.char, c.x, c.y);

            c.y += c.speed;
            c.char = Math.floor(Math.random() * 10);

            if (c.y > canvas.height) {
                c.y = Math.random() * -30;
                c.speed = 0.8 + Math.random() * 1.5;
                c.bold = Math.random() > 0.4;
                c.opacity = 0.05 + Math.random() * 0.15;
            }
        }

        // Render Explosion Particles
        drawParticles();

        requestAnimationFrame(animate);
    }

    // Initialize Canvas
    resizeCanvas();
    animate();

    // ── CLI TYPING TERMINAL ──
    const terminalInput = document.getElementById("terminalInput");
    let commandHistory = [];
    let historyIdx = -1;

    if (terminalInput) {
        terminalInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                const val = terminalInput.value.trim();
                if (val === "") return;

                commandHistory.push(val);
                historyIdx = commandHistory.length;

                const cmd = val.toLowerCase();
                const validCommands = [
                    "help", "about", "skills", "education",
                    "experience", "projects", "certifications",
                    "contact", "fun", "hire"
                ];

                if (validCommands.includes(cmd)) {
                    window.location.hash = '#' + cmd;
                } else if (cmd === 'clear' || cmd === 'cls') {
                    window.location.hash = '';
                } else {
                    const errName = document.getElementById('errorCommandName');
                    const errVal = document.getElementById('errorCommandVal');
                    if (errName && errVal) {
                        errName.innerText = val;
                        errVal.innerText = val;
                    }
                    window.location.hash = '#error-section';
                }

                terminalInput.value = "";

                // Auto scroll screen to show prompt at bottom
                setTimeout(() => {
                    screenContainer.scrollTop = screenContainer.scrollHeight;
                }, 50);

            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (historyIdx > 0) {
                    historyIdx--;
                    terminalInput.value = commandHistory[historyIdx];
                }
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (historyIdx < commandHistory.length - 1) {
                    historyIdx++;
                    terminalInput.value = commandHistory[historyIdx];
                } else {
                    historyIdx = commandHistory.length;
                    terminalInput.value = "";
                }
            }
        });

        // Focus CLI input on page click (avoiding inputs/buttons)
        screenContainer.addEventListener("click", (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
                terminalInput.focus();
            }
        });

        // Sync CLI input clean up when hashes change via hints
        window.addEventListener("hashchange", () => {
            terminalInput.value = "";
            terminalInput.focus();
            setTimeout(() => {
                screenContainer.scrollTop = screenContainer.scrollHeight;
            }, 50);
        });
    }

    // ── SUBMIT HIRE PROPOSAL FORM ──
    window.submitHireForm = function () {
        const email = document.getElementById("hrEmail").value;
        const body = document.getElementById("hrBody").value;
        const status = document.getElementById("hireStatus");
        const submitBtn = document.getElementById("hireSubmitBtn");

        if (!email || !body) return;

        status.style.display = "block";
        status.style.borderColor = "var(--dim)";
        status.style.background = "rgba(58, 58, 92, 0.1)";
        status.className = "t-amber";
        status.innerText = "OPENING YOUR EMAIL CLIENT...";
        submitBtn.disabled = true;

        const recipient = "safrinmoosa17@gmail.com";
        const subject = encodeURIComponent(`Portfolio Proposal from ${email}`);
        const messageBody = encodeURIComponent(body);
        const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${messageBody}`;

        setTimeout(() => {
            window.location.href = mailtoLink;
            status.className = "t-green bold";
            status.style.borderColor = "var(--green)";
            status.style.background = "rgba(57, 255, 138, 0.05)";
            status.innerText = `SUCCESS: Your proposal has been prepared for ${recipient}.`;
            document.getElementById("hrEmail").value = "";
            document.getElementById("hrBody").value = "";
            submitBtn.disabled = false;

            // Spurt massive numbers explosion in center of screen
            const rect = canvas.getBoundingClientRect();
            spawnExplosion(rect.width / 2, rect.height / 2, 70);
        }, 800);
    };

    // ── ATTACH EXPLOSION INTERACTIONS ──
    function initInteractions() {
        // Trigger on click/hover for links targeting #hire
        document.querySelectorAll('a[href="#hire"]').forEach(el => {
            el.addEventListener('mouseenter', triggerExplosionFromEvent);
            el.addEventListener('click', triggerExplosionFromEvent);
        });

        // Trigger explosion when hovering or clicking components inside #hire
        const hireSection = document.getElementById("hire");
        if (hireSection) {
            hireSection.addEventListener('mouseenter', (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                spawnExplosion(x, y, 15);
            });
        }

        const hireSubmitBtn = document.getElementById("hireSubmitBtn");
        if (hireSubmitBtn) {
            hireSubmitBtn.addEventListener('mouseenter', triggerExplosionFromEvent);
            hireSubmitBtn.addEventListener('click', triggerExplosionFromEvent);
        }
    }

    // Delay interaction binding slightly to ensure DOM has fully parsed
    setTimeout(initInteractions, 100);
})();