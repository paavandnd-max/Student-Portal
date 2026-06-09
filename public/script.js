document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initBottomDockInteractivity();
  initCustomCursor();
  initCardSpotlight();
  initSmartNavigation();
  initParticles();
  initGoalsChecklist();
  initTutorChat();
  initSuggestionChips();
  initTopicBadges();
  initLandingPage();
  initNotepad();
});

// 1. Theme Configuration & Floating Switcher
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "abyss";
  document.body.setAttribute("data-theme", savedTheme);

  // Dynamically inject the Theme Switcher toggle and panel if they don't exist
  if (!document.querySelector(".theme-switcher-toggle")) {
    const toggle = document.createElement("button");
    toggle.className = "theme-switcher-toggle";
    toggle.title = "Switch Color Theme";
    toggle.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    `;

    const panel = document.createElement("div");
    panel.className = "theme-switcher-panel";
    panel.innerHTML = `
      <div class="theme-switcher-title">Select Theme</div>
      <button class="theme-btn" data-theme-id="abyss"><span class="theme-color-dot dot-abyss"></span>Aurum Obsidian</button>
      <button class="theme-btn" data-theme-id="cyberpunk"><span class="theme-color-dot dot-cyberpunk"></span>Rose Gold Luxe</button>
      <button class="theme-btn" data-theme-id="matrix"><span class="theme-color-dot dot-matrix"></span>Royal Platinum</button>
      <button class="theme-btn" data-theme-id="solar"><span class="theme-color-dot dot-solar"></span>Valkyrie Bronze</button>
    `;
 
    document.body.appendChild(toggle);
    document.body.appendChild(panel);
 
    // Toggle panel view
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.classList.toggle("show");
    });
 
    document.addEventListener("click", () => {
      panel.classList.remove("show");
    });
 
    panel.addEventListener("click", (e) => {
      e.stopPropagation();
    });
 
    // Theme selector listeners
    const themeButtons = panel.querySelectorAll(".theme-btn");
     
    // Set active button style helper
    const updateActiveButton = (activeTheme) => {
      themeButtons.forEach(btn => {
        if (btn.getAttribute("data-theme-id") === activeTheme) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    };
 
    updateActiveButton(savedTheme);
    setTimeout(() => {
      window.dispatchEvent(new Event('themechanged'));
    }, 100);
 
    themeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const themeId = btn.getAttribute("data-theme-id");
        document.body.setAttribute("data-theme", themeId);
        localStorage.setItem("theme", themeId);
        updateActiveButton(themeId);
        panel.classList.remove("show");
        window.dispatchEvent(new Event('themechanged'));
      });
    });
  }
}

// 2. Bottom Dock Magnification & Hover Recoil
function initBottomDockInteractivity() {
  const dock = document.getElementById("app-dock");
  if (!dock) return;

  const items = dock.querySelectorAll(".nav-item, .user-profile, .logo a");
  
  dock.addEventListener("mousemove", (e) => {
    const dockRect = dock.getBoundingClientRect();
    const mouseX = e.clientX;
    
    items.forEach(item => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX - itemCenter);
      
      const maxDistance = 120;
      let scale = 1;
      
      if (distance < maxDistance) {
        const factor = (maxDistance - distance) / maxDistance; // 0 to 1
        // Smooth step factor for organic recoil
        const smoothFactor = Math.sin(factor * Math.PI / 2);
        scale = 1 + smoothFactor * 0.22; // max 22% size increase
      }
      
      // Calculate smooth scale and transform
      const translateY = (scale - 1) * -18;
      item.style.transform = `scale(${scale}) translateY(${translateY}px)`;
    });
  });

  dock.addEventListener("mouseleave", () => {
    items.forEach(item => {
      item.style.transform = "scale(1) translateY(0px)";
      // Reset transition temporarily for snap back, then clear
      item.style.transition = "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)";
      setTimeout(() => {
        item.style.transition = "";
      }, 300);
    });
  });
}

// 3. Custom Lagging Neon Cursor & Click ripples
function initCustomCursor() {
  if (window.matchMedia("(max-width: 1024px)").matches || window.matchMedia("(pointer: coarse)").matches) {
    return;
  }
  const dot = document.createElement("div");
  const outline = document.createElement("div");
  dot.className = "custom-cursor-dot";
  outline.className = "custom-cursor-outline";
  document.body.appendChild(dot);
  document.body.appendChild(outline);

  let mouseX = -100, mouseY = -100;
  let outlineX = -100, outlineY = -100;
  let isMoving = false;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMoving = true;
    
    dot.style.left = mouseX + "px";
    dot.style.top = mouseY + "px";
    dot.style.opacity = 1;
    outline.style.opacity = 1;
  });

  // Outline lag animation
  function animateOutline() {
    const dx = mouseX - outlineX;
    const dy = mouseY - outlineY;
    outlineX += dx * 0.16;
    outlineY += dy * 0.16;
    outline.style.left = outlineX + "px";
    outline.style.top = outlineY + "px";
    requestAnimationFrame(animateOutline);
  }
  animateOutline();

  document.addEventListener("mouseleave", () => {
    dot.style.opacity = 0;
    outline.style.opacity = 0;
  });

  // Cursor click ripple effect
  window.addEventListener("click", (e) => {
    const ripple = document.createElement("div");
    ripple.className = "click-ripple";
    ripple.style.left = e.clientX + "px";
    ripple.style.top = e.clientY + "px";
    document.body.appendChild(ripple);
    
    ripple.addEventListener("animationend", () => {
      ripple.remove();
    });
  });

  function updateHoverListeners() {
    const hoverables = document.querySelectorAll(
      "a, button, .btn, .diff-btn, .option-btn, .logo, input, select, .suggestion-chip, .topic-badge, .checkbox-container, .goal-delete-btn, .chat-history-item"
    );
    hoverables.forEach(el => {
      el.removeEventListener("mouseenter", addHoverClass);
      el.removeEventListener("mouseleave", removeHoverClass);
      el.addEventListener("mouseenter", addHoverClass);
      el.addEventListener("mouseleave", removeHoverClass);
    });
  }

  function addHoverClass() {
    document.body.classList.add("cursor-hover");
  }

  function removeHoverClass() {
    document.body.classList.remove("cursor-hover");
  }

  updateHoverListeners();
  
  const observer = new MutationObserver(updateHoverListeners);
  observer.observe(document.body, { childList: true, subtree: true });
}

// 4. Vercel-style Radial Card Spotlight Effect
function initCardSpotlight() {
  function updateSpotlight(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  }

  function setupCards() {
    const cards = document.querySelectorAll(".course-card, .stat-card, .quiz-container, .chat-container, .widget-card, .flashcard-deck, .flashcard-sidebar");
    cards.forEach(card => {
      card.removeEventListener("mousemove", updateSpotlight);
      card.addEventListener("mousemove", updateSpotlight);
    });
  }

  setupCards();
  const cardObserver = new MutationObserver(setupCards);
  cardObserver.observe(document.body, { childList: true, subtree: true });
}

// 5. Smart Navigation for Offline file:// Support
function initSmartNavigation() {
  const isLocalFile = window.location.protocol === "file:";
  
  if (isLocalFile) {
    document.querySelectorAll("a").forEach(link => {
      const href = link.getAttribute("href");
      if (!href) return;
      
      if (href === "/") {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = "index.html";
        });
      } else if (href === "/dashboard") {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = "dashboard.html";
        });
      } else if (href.startsWith("/")) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = href.substring(1);
        });
      }
    });
  }
}

// 6. Interactive Connecting Particles Background
function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  let width, height;
  let particles = [];
  
  const mouse = {
    x: null,
    y: null,
    radius: 170,
    active: false
  };

  const mouseOffset = { x: 0, y: 0 };

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    
    // Calculate parallax offsets (distance from center scaled down)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    mouseOffset.x = (e.clientX - centerX) * 0.025;
    mouseOffset.y = (e.clientY - centerY) * 0.025;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
    mouse.active = false;
  });
  
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  
  window.addEventListener("resize", resize);
  resize();

  // Dynamic theme colors state
  let themeColors = {
    particleFill: "rgba(212, 175, 55, 0.35)",
    particleLine: "rgba(212, 175, 55, 0.08)",
    mouseLine: "rgba(255, 215, 0, 0.15)"
  };

  function updateParticleColors() {
    const bodyStyle = getComputedStyle(document.body);
    const primary = bodyStyle.getPropertyValue('--accent-primary').trim() || '#d4af37';
    const secondary = bodyStyle.getPropertyValue('--accent-secondary').trim() || '#f3e5ab';
    const cyan = bodyStyle.getPropertyValue('--accent-cyan').trim() || '#ffd700';

    function hexToRgba(hex, alpha) {
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
      }
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    try {
      if (primary.startsWith('#')) {
        themeColors.particleFill = hexToRgba(primary, 0.35);
      } else {
        themeColors.particleFill = primary.replace('0.18', '0.35');
      }

      if (secondary.startsWith('#')) {
        themeColors.particleLine = hexToRgba(secondary, 0.08);
      } else {
        themeColors.particleLine = secondary.replace('0.18', '0.08');
      }

      if (cyan.startsWith('#')) {
        themeColors.mouseLine = hexToRgba(cyan, 0.15);
      } else {
        themeColors.mouseLine = cyan.replace('0.18', '0.15');
      }
    } catch (e) {
      themeColors.particleFill = "rgba(212, 175, 55, 0.35)";
      themeColors.particleLine = "rgba(212, 175, 55, 0.08)";
      themeColors.mouseLine = "rgba(255, 215, 0, 0.15)";
    }
  }

  updateParticleColors();
  window.addEventListener('themechanged', updateParticleColors);
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.radius = Math.random() * 2 + 0.8;
      
      this.baseVx = this.vx;
      this.baseVy = this.vy;
    }
    
    update() {
      if (mouse.active && mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          
          this.vx += Math.cos(angle) * force * 0.04;
          this.vy += Math.sin(angle) * force * 0.04;
          
          const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          if (speed > 1.3) {
            this.vx = (this.vx / speed) * 1.3;
            this.vy = (this.vy / speed) * 1.3;
          }
        } else {
          this.vx += (this.baseVx - this.vx) * 0.02;
          this.vy += (this.baseVy - this.vy) * 0.02;
        }
      } else {
        this.vx += (this.baseVx - this.vx) * 0.02;
        this.vy += (this.baseVy - this.vy) * 0.02;
      }

      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    
    draw() {
      ctx.beginPath();
      // Add visual parallax depth mapping based on particle radius
      const drawX = this.x + mouseOffset.x * (this.radius * 0.75);
      const drawY = this.y + mouseOffset.y * (this.radius * 0.75);
      ctx.arc(drawX, drawY, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = themeColors.particleFill;
      ctx.shadowBlur = 3;
      ctx.shadowColor = themeColors.particleFill;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  
  const particleCount = Math.min(Math.floor((width * height) / 16000), 90);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Smoothly decelerate parallax offsets when mouse leaves viewport
    if (!mouse.active) {
      mouseOffset.x += (0 - mouseOffset.x) * 0.05;
      mouseOffset.y += (0 - mouseOffset.y) * 0.05;
    }
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 50) {
          ctx.beginPath();
          const p1Factor = particles[i].radius * 0.75;
          const p2Factor = particles[j].radius * 0.75;
          ctx.moveTo(particles[i].x + mouseOffset.x * p1Factor, particles[i].y + mouseOffset.y * p1Factor);
          ctx.lineTo(particles[j].x + mouseOffset.x * p2Factor, particles[j].y + mouseOffset.y * p2Factor);
          ctx.strokeStyle = themeColors.particleLine;
          ctx.lineWidth = 0.3;
          ctx.stroke();
        }
      }
      
      if (mouse.active && mouse.x !== null && mouse.y !== null) {
        let dx = particles[i].x - mouse.x;
        let dy = particles[i].y - mouse.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          ctx.beginPath();
          const p1Factor = particles[i].radius * 0.75;
          ctx.moveTo(particles[i].x + mouseOffset.x * p1Factor, particles[i].y + mouseOffset.y * p1Factor);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = themeColors.mouseLine;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(animate);
  }
  animate();
}

// 7. Interactive Study Goals Checklist Widget
function initGoalsChecklist() {
  const container = document.getElementById("goals-list-container");
  const input = document.getElementById("new-goal-input");
  const addBtn = document.getElementById("add-goal-btn");
  if (!container) return;

  let goals = JSON.parse(localStorage.getItem("study_goals")) || [
    { id: "1", text: "Read Quantum Mechanics Chapter 2", completed: false },
    { id: "2", text: "Complete Chemistry Practice Quiz", completed: true },
    { id: "3", text: "Explain mitosis to AI Tutor", completed: false }
  ];

  function saveGoals() {
    localStorage.setItem("study_goals", JSON.stringify(goals));
  }

  function renderGoals() {
    container.innerHTML = "";
    if (goals.length === 0) {
      container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:2rem 0; font-size:0.9rem;">No active goals. Add some below!</div>`;
      return;
    }

    goals.forEach(goal => {
      const item = document.createElement("div");
      item.className = `goal-item ${goal.completed ? "completed" : ""}`;
      item.innerHTML = `
        <div class="goal-left">
          <label class="checkbox-container">
            <input type="checkbox" ${goal.completed ? "checked" : ""}>
            <span class="checkmark"></span>
          </label>
          <span class="goal-text">${goal.text}</span>
        </div>
        <button class="goal-delete-btn" title="Delete Goal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      // Complete toggle listener
      const checkbox = item.querySelector("input[type='checkbox']");
      checkbox.addEventListener("change", () => {
        goal.completed = checkbox.checked;
        saveGoals();
        renderGoals();
      });

      // Delete listener
      const delBtn = item.querySelector(".goal-delete-btn");
      delBtn.addEventListener("click", () => {
        goals = goals.filter(g => g.id !== goal.id);
        saveGoals();
        renderGoals();
      });

      container.appendChild(item);
    });
  }

  // Add goal trigger
  function addGoal() {
    const text = input.value.trim();
    if (!text) return;
    
    goals.push({
      id: Date.now().toString(),
      text: text,
      completed: false
    });
    
    input.value = "";
    saveGoals();
    renderGoals();
  }

  addBtn.addEventListener("click", addGoal);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addGoal();
  });

  renderGoals();
}

// 8. Markdown formatted parser helper
function parseMarkdown(text) {
  if (!text) return "";
  let html = text;

  // Escape HTML tags to prevent XSS but keep custom formatting
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Code Blocks (```lang code ```)
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  html = html.replace(codeBlockRegex, (match, lang, code) => {
    const language = lang || "code";
    return `<div class="code-container">
      <div class="code-header">
        <span class="code-lang">${language}</span>
        <button class="code-copy-btn" onclick="copyCode(this)">Copy Code</button>
      </div>
      <pre class="code-body"><code>${code.trim()}</code></pre>
    </div>`;
  });

  // Inline Code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: var(--accent-cyan);">$1</code>');

  // Bold (**bold**)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italics (*italics*)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Split lines for tables and lists
  const lines = html.split('\n');
  let inTable = false;
  let tableRows = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Markdown table row
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      // Detect separator line |---|---|
      const isSeparator = cells.every(c => /^:-*|-+:?|:-+:?|-+$/.test(c));
      if (!isSeparator) {
        tableRows.push(cells);
      }
      lines[i] = ""; // clear original markdown line
    } else {
      if (inTable) {
        lines[i - 1] = buildHTMLTable(tableRows);
        inTable = false;
      }
      
      // Bullets (* item or - item)
      if (line.startsWith('* ') || line.startsWith('- ')) {
        lines[i] = `<li>${line.substring(2)}</li>`;
      }
    }
  }

  if (inTable) {
    lines[lines.length - 1] = buildHTMLTable(tableRows);
  }

  // Join lines back
  let output = lines.filter(l => l !== "").join('\n');

  // Wrap lists in <ul> tags
  output = output.replace(/((?:<li>.*?<\/li>\n?)+)/gs, '<ul>$1</ul>');

  // Replace remaining newlines with line breaks
  output = output.replace(/\n/g, '<br>');

  return output;
}

function buildHTMLTable(rows) {
  if (rows.length === 0) return "";
  let html = '<table><thead><tr>';
  rows[0].forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';
  for (let i = 1; i < rows.length; i++) {
    html += '<tr>';
    rows[i].forEach(c => html += `<td>${c}</td>`);
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

// Global window actions
window.copyCode = function(button) {
  const codeContainer = button.closest('.code-container');
  const codeText = codeContainer.querySelector('.code-body code').innerText;
  
  navigator.clipboard.writeText(codeText).then(() => {
    button.textContent = "Copied!";
    setTimeout(() => {
      button.textContent = "Copy Code";
    }, 2000);
  }).catch(err => {
    console.error("Failed to copy code: ", err);
  });
};

let currentUtterance = null;
let speakingButton = null;

window.speakText = function(text, button) {
  if ('speechSynthesis' in window) {
    // Stop speaking if already active
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (speakingButton) {
        speakingButton.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> Speak`;
      }
      if (speakingButton === button) {
        speakingButton = null;
        return;
      }
    }

    // Strip code blocks and tags for clean speech
    const cleanText = text.replace(/```[\s\S]*?```/g, "[Code block]")
                          .replace(/[*_`|#]/g, "")
                          .replace(/&lt;[^&]*&gt;/g, "")
                          .replace(/<[^>]*>/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance = utterance;
    speakingButton = button;

    utterance.onend = () => {
      button.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> Speak`;
      speakingButton = null;
    };

    utterance.onerror = () => {
      button.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> Speak`;
      speakingButton = null;
    };

    button.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Stop`;
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Speech synthesis is not supported on this browser.");
  }
};

// 9. AI Tutor Chat Functionality (LocalStorage sessions, Markdown, TTS)
function initTutorChat() {
  const chatSendBtn = document.getElementById("chat-send-btn");
  const chatInput = document.getElementById("chat-input");
  const chatHistory = document.getElementById("chat-history");
  const threadsContainer = document.getElementById("chat-threads-container");
  const newChatBtn = document.getElementById("new-chat-btn");

  if (!chatSendBtn || !chatInput || !chatHistory) return;

  let threads = JSON.parse(localStorage.getItem("chat_threads")) || [];
  let activeThreadId = localStorage.getItem("active_thread_id") || null;
  let selectedImageBase64 = null;

  const chatUploadBtn = document.getElementById("chat-upload-btn");
  const chatFileInput = document.getElementById("chat-file-input");
  const chatPreviewContainer = document.getElementById("chat-preview-container");
  const chatPreviewImg = document.getElementById("chat-preview-img");
  const chatPreviewRemoveBtn = document.getElementById("chat-preview-remove-btn");

  if (chatUploadBtn && chatFileInput) {
    chatUploadBtn.addEventListener("click", () => {
      chatFileInput.click();
    });

    chatFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        chatFileInput.value = "";
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        alert("File size exceeds 20MB limit.");
        chatFileInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = function(evt) {
        selectedImageBase64 = evt.target.result;
        if (chatPreviewImg) chatPreviewImg.src = selectedImageBase64;
        if (chatPreviewContainer) chatPreviewContainer.style.display = "flex";
      };
      reader.readAsDataURL(file);
    });
  }

  if (chatPreviewRemoveBtn) {
    chatPreviewRemoveBtn.addEventListener("click", () => {
      selectedImageBase64 = null;
      if (chatFileInput) chatFileInput.value = "";
      if (chatPreviewImg) chatPreviewImg.src = "";
      if (chatPreviewContainer) chatPreviewContainer.style.display = "none";
    });
  }

  function saveThreads() {
    localStorage.setItem("chat_threads", JSON.stringify(threads));
    localStorage.setItem("active_thread_id", activeThreadId);
  }

  function renderThreads() {
    if (!threadsContainer) return;
    threadsContainer.innerHTML = "";
    
    if (threads.length === 0) {
      threadsContainer.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.8rem; padding:1rem 0;">No saved sessions</div>`;
      return;
    }

    threads.forEach(thread => {
      const item = document.createElement("button");
      item.className = `chat-history-item ${thread.id === activeThreadId ? "active" : ""}`;
      item.innerHTML = `
        <span class="chat-history-text">${thread.name}</span>
        <span class="chat-history-delete" title="Delete Session">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </span>
      `;

      item.addEventListener("click", () => {
        activeThreadId = thread.id;
        saveThreads();
        renderThreads();
        loadActiveThread();
      });

      const delBtn = item.querySelector(".chat-history-delete");
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        threads = threads.filter(t => t.id !== thread.id);
        if (activeThreadId === thread.id) {
          activeThreadId = threads.length > 0 ? threads[0].id : null;
        }
        saveThreads();
        renderThreads();
        if (activeThreadId) {
          loadActiveThread();
        } else {
          clearChatWindow();
        }
      });

      threadsContainer.appendChild(item);
    });
  }

  function clearChatWindow() {
    chatHistory.innerHTML = `
      <div class="chat-message ai">
        <div class="avatar-circle">AI</div>
        <div class="message-body">
          <div class="sender-name">AI Tutor</div>
          <div class="bubble">
            Hello! I am your AcademAI personal tutor. I can summarize notes, generate quizzes, or explain complex topics. What would you like to learn today?
          </div>
        </div>
      </div>
    `;
  }

  function loadActiveThread() {
    const thread = threads.find(t => t.id === activeThreadId);
    if (!thread) {
      clearChatWindow();
      return;
    }

    chatHistory.innerHTML = "";
    thread.messages.forEach(msg => {
      appendChatMessage(msg.sender, msg.text, msg.sender === "ai", msg.image);
    });
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  function appendChatMessage(sender, text, isMarkdown = true, imageBase64 = null) {
    const msg = document.createElement("div");
    msg.className = `chat-message ${sender === "user" ? "user" : "ai"}`;
    
    let imageHtml = "";
    if (imageBase64) {
      imageHtml = `<img src="${imageBase64}" class="chat-message-image" alt="Uploaded Image / Equation">`;
    }

    const displayText = isMarkdown ? parseMarkdown(text) : text.replace(/\n/g, '<br>');
    const actionsMarkup = sender === "ai" ? `
      <div class="bubble-actions-row">
        <button class="bubble-action-btn" onclick="speakText(\`${text.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          Speak
        </button>
      </div>
    ` : '';

    msg.innerHTML = `
      <div class="avatar-circle">${sender === "user" ? "U" : "AI"}</div>
      <div class="message-body">
        <div class="sender-name">${sender === "user" ? "You" : "AI Tutor"}</div>
        <div class="bubble">${imageHtml}${displayText}</div>
        ${actionsMarkup}
      </div>
    `;

    chatHistory.appendChild(msg);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return msg;
  }

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text && !selectedImageBase64) return;

    // Create thread if none active
    if (!activeThreadId) {
      activeThreadId = Date.now().toString();
      const newThreadName = text ? (text.length > 22 ? text.substring(0, 22) + "..." : text) : "Photo Explanation";
      threads.unshift({
        id: activeThreadId,
        name: newThreadName,
        messages: []
      });
    }

    const thread = threads.find(t => t.id === activeThreadId);
    
    // Capture the current image base64, then reset state
    const imagePayload = selectedImageBase64;
    selectedImageBase64 = null;
    if (chatFileInput) chatFileInput.value = "";
    if (chatPreviewImg) chatPreviewImg.src = "";
    if (chatPreviewContainer) chatPreviewContainer.style.display = "none";

    // Add User Message
    thread.messages.push({ sender: "user", text: text, image: imagePayload });
    appendChatMessage("user", text, false, imagePayload);
    chatInput.value = "";
    saveThreads();
    renderThreads();

    // AI typing animation
    const aiMsgPlaceholder = document.createElement("div");
    aiMsgPlaceholder.className = "chat-message ai";
    aiMsgPlaceholder.innerHTML = `
      <div class="avatar-circle">AI</div>
      <div class="message-body">
        <div class="sender-name">AI Tutor</div>
        <div class="bubble typing"><span></span><span></span><span></span></div>
      </div>
    `;
    chatHistory.appendChild(aiMsgPlaceholder);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Fetch streaming output
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text || "Explain this image", image: imagePayload })
    }).then(async response => {
      if (!response.ok) throw new Error("Connection error");

      aiMsgPlaceholder.remove();
      
      const responseMsg = appendChatMessage("ai", "", true);
      const bubble = responseMsg.querySelector(".bubble");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let rawAiResponse = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          rawAiResponse += chunk;
          bubble.innerHTML = parseMarkdown(rawAiResponse);
          chatHistory.scrollTop = chatHistory.scrollHeight;
        }
      }

      // Add to local history logs
      thread.messages.push({ sender: "ai", text: rawAiResponse });
      saveThreads();

      // Hook up actions
      responseMsg.innerHTML = `
        <div class="avatar-circle">AI</div>
        <div class="message-body">
          <div class="sender-name">AI Tutor</div>
          <div class="bubble">${parseMarkdown(rawAiResponse)}</div>
          <div class="bubble-actions-row">
            <button class="bubble-action-btn" onclick="speakText(\`${rawAiResponse.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, this)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
              Speak
            </button>
          </div>
        </div>
      `;
    }).catch(err => {
      console.error(err);
      aiMsgPlaceholder.remove();
      const errMsg = appendChatMessage("ai", "Error: Failed to connect to AI server. Please try again.", false);
      const bubble = errMsg.querySelector(".bubble");
      bubble.style.borderColor = "#ef4444";
      bubble.style.background = "rgba(239, 68, 68, 0.1)";
      bubble.style.color = "#ff8b8b";
    });
  }

  // Suggestion click listener reference
  window.triggerChatChip = function(promptText) {
    chatInput.value = promptText;
    sendMessage();
  };

  // Bind Session actions
  chatSendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      activeThreadId = null;
      localStorage.removeItem("active_thread_id");
      renderThreads();
      clearChatWindow();
    });
  }

  // Load active session on load
  renderThreads();
  if (activeThreadId) {
    loadActiveThread();
  }
}

// 10. Interactive Suggestion Chips
function initSuggestionChips() {
  const chips = document.querySelectorAll(".suggestion-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const prompt = chip.getAttribute("data-prompt");
      if (prompt && window.triggerChatChip) {
        window.triggerChatChip(prompt);
      }
    });
  });
}

// 11. Interactive Topic Badges on Quiz Screen
function initTopicBadges() {
  const badges = document.querySelectorAll(".topic-badge");
  const topicInput = document.getElementById("topic-input");
  
  badges.forEach(badge => {
    badge.addEventListener("click", () => {
      const topic = badge.getAttribute("data-topic");
      if (topic && topicInput) {
        topicInput.value = topic;
      }
    });
  });
}

// 12. Landing Page Start Button Routing, Tab Switching & 3D WebGL Helix
function initLandingPage() {
  const startBtn = document.getElementById("start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.location.protocol === "file:") {
        window.location.href = "dashboard.html";
      } else {
        window.location.href = "/login";
      }
    });
  }

  // Active state trackers
  let currentTab = "chat";
  let demoChatActive = true;
  let activeInterval = null;
  let activeTimeout = null;

  // 1. Tab Switching Handler
  window.switchDemoTab = function(tabName) {
    if (currentTab === tabName) return;
    currentTab = tabName;

    // Toggle active tab buttons
    document.querySelectorAll(".console-tab-btn").forEach(btn => {
      btn.classList.remove("active");
    });
    const targetBtn = document.getElementById(`btn-tab-${tabName}`);
    if (targetBtn) targetBtn.classList.add("active");

    // Toggle active content divisions
    document.querySelectorAll(".demo-tab-content").forEach(content => {
      content.classList.remove("active");
      content.style.display = "none";
    });
    const targetContent = document.getElementById(`demo-content-${tabName}`);
    if (targetContent) {
      targetContent.classList.add("active");
      targetContent.style.display = tabName === "chat" ? "flex" : (tabName === "card" ? "flex" : "block");
    }

    // Tab-specific lifecycle activations
    if (tabName === "chat") {
      demoChatActive = true;
      runNextDemoStep();
    } else {
      // Pause typewriter loop
      demoChatActive = false;
      if (activeInterval) clearInterval(activeInterval);
      if (activeTimeout) clearTimeout(activeTimeout);
    }

    if (tabName === "model") {
      isDnaLoopActive = true;
      if (!isThreeInitialized) {
        initDemo3DModel();
      } else {
        // Resume DNA Helix spin loop
        resumeDnaHelixLoop();
      }
    } else {
      // Pause WebGL rendering loop to conserve battery/CPU
      isDnaLoopActive = false;
    }
  };

  // 2. 3D Glass card flipper handler
  window.flipDemoCard = function() {
    const cardInner = document.getElementById("demo-card-inner");
    if (cardInner) {
      cardInner.classList.toggle("flipped");
    }
  };

  // 3. Hologram Chat Typewriter Simulation
  const demoFeed = document.getElementById("demo-chat-feed");
  const demoInput = document.getElementById("demo-mock-input");
  if (!demoFeed || !demoInput) return;

  const script = [
    { type: "input", text: "Explain quantum entanglement..." },
    { type: "user", text: "Explain quantum entanglement..." },
    { type: "ai", text: "Imagine two magic dice. Roll one in New York (getting a 6), and the other in Paris immediately rolls a 6 too, instantly linked across space! 🎲✨" },
    { type: "input", text: "Is it faster than light?" },
    { type: "user", text: "Is it faster than light?" },
    { type: "ai", text: "It seems to be! But you can't use it to send actual messages faster than light, because the results are random until checked. Einstein called it 'spooky action at a distance'! 🌌" }
  ];

  let stepIndex = 0;

  function runNextDemoStep() {
    if (!demoChatActive) return;
    
    if (stepIndex >= script.length) {
      // Loop the demo after a delay
      activeTimeout = setTimeout(() => {
        if (!demoChatActive) return;
        demoFeed.innerHTML = "";
        demoInput.textContent = "Query AI Tutor...";
        stepIndex = 0;
        runNextDemoStep();
      }, 5000);
      return;
    }

    const current = script[stepIndex];

    if (current.type === "input") {
      let charIndex = 0;
      demoInput.textContent = "";
      activeInterval = setInterval(() => {
        if (!demoChatActive) {
          clearInterval(activeInterval);
          return;
        }
        if (charIndex < current.text.length) {
          demoInput.textContent += current.text[charIndex];
          charIndex++;
        } else {
          clearInterval(activeInterval);
          activeTimeout = setTimeout(() => {
            if (!demoChatActive) return;
            stepIndex++;
            runNextDemoStep();
          }, 600);
        }
      }, 70);
    } else if (current.type === "user") {
      // Append user bubble
      const msg = document.createElement("div");
      msg.className = "hologram-msg user";
      msg.textContent = current.text;
      demoFeed.appendChild(msg);
      demoFeed.scrollTop = demoFeed.scrollHeight;
      demoInput.textContent = "Query AI Tutor...";
      
      activeTimeout = setTimeout(() => {
        if (!demoChatActive) return;
        stepIndex++;
        runNextDemoStep();
      }, 800);
    } else if (current.type === "ai") {
      // Append AI bubble with typing effect
      const msg = document.createElement("div");
      msg.className = "hologram-msg ai";
      msg.innerHTML = `<span class="typing-cursor"></span>`;
      demoFeed.appendChild(msg);
      demoFeed.scrollTop = demoFeed.scrollHeight;

      let charIndex = 0;
      activeInterval = setInterval(() => {
        if (!demoChatActive) {
          clearInterval(activeInterval);
          return;
        }
        if (charIndex < current.text.length) {
          // Type character
          msg.innerHTML = current.text.substring(0, charIndex + 1) + `<span class="typing-cursor">|</span>`;
          demoFeed.scrollTop = demoFeed.scrollHeight;
          charIndex++;
        } else {
          clearInterval(activeInterval);
          msg.innerHTML = current.text; // Remove cursor
          activeTimeout = setTimeout(() => {
            if (!demoChatActive) return;
            stepIndex++;
            runNextDemoStep();
          }, 2500);
        }
      }, 30);
    }
  }

  // 4. Lightweight Three.js DNA Helix Engine
  let threeRenderer, threeScene, threeCamera, dnaGroup;
  let isThreeInitialized = false;
  let isDnaLoopActive = false;

  function initDemo3DModel() {
    const canvas = document.getElementById("demo-three-canvas");
    if (!canvas) return;
    
    // Fallback if Three.js is not loaded on the page
    if (typeof THREE === "undefined") {
      console.warn("Three.js not loaded. Skipping 3D Twin render.");
      return;
    }

    const width = canvas.clientWidth || 300;
    const height = canvas.clientHeight || 200;
    
    // Create Scene & Transparent Renderer
    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    threeCamera.position.z = 10;
    
    threeRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    threeRenderer.setSize(width, height, false);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    threeScene.add(ambientLight);
    
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(5, 5, 5);
    threeScene.add(dirLight1);
    
    const dirLight2 = new THREE.DirectionalLight(0xd4af37, 1.25);
    dirLight2.position.set(-5, -5, 5);
    threeScene.add(dirLight2);
    
    // Procedural double helix representation
    dnaGroup = new THREE.Group();
    threeScene.add(dnaGroup);
    
    const sphereGeo = new THREE.SphereGeometry(0.16, 16, 16);
    const cylinderGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 8);
    
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.15
    });
    
    const cyanMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const rungsCount = 20;
    const helixRadius = 1.8;
    const helixHeight = 6.0;
    const turns = 2.0;
    
    for (let i = 0; i < rungsCount; i++) {
      const t = i / (rungsCount - 1);
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * helixHeight;
      
      const x1 = Math.sin(angle) * helixRadius;
      const z1 = Math.cos(angle) * helixRadius;
      
      const x2 = -x1;
      const z2 = -z1;
      
      // Strand 1 Sphere
      const s1 = new THREE.Mesh(sphereGeo, goldMat);
      s1.position.set(x1, y, z1);
      dnaGroup.add(s1);
      
      // Strand 2 Sphere
      const s2 = new THREE.Mesh(sphereGeo, goldMat);
      s2.position.set(x2, y, z2);
      dnaGroup.add(s2);
      
      // Connecting Rung Cylinder
      const rung = new THREE.Mesh(cylinderGeo, i % 2 === 0 ? goldMat : cyanMat);
      rung.scale.set(1, helixRadius * 2, 1);
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = -angle;
      rung.position.set(0, y, 0);
      dnaGroup.add(rung);
    }
    
    // Drag Rotations
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    
    const onStart = (clientX, clientY) => {
      isDragging = true;
      prevX = clientX;
      prevY = clientY;
    };
    
    const onMove = (clientX, clientY) => {
      if (!isDragging) return;
      const dx = clientX - prevX;
      const dy = clientY - prevY;
      
      dnaGroup.rotation.y += dx * 0.01;
      dnaGroup.rotation.x += dy * 0.01;
      
      prevX = clientX;
      prevY = clientY;
    };
    
    const onEnd = () => {
      isDragging = false;
    };
    
    canvas.addEventListener("mousedown", (e) => onStart(e.clientX, e.clientY));
    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", onEnd);
    
    canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) onStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener("touchend", onEnd);
    
    // Animation Render Loop
    function tick() {
      if (!isDnaLoopActive) return;
      requestAnimationFrame(tick);
      
      if (!isDragging) {
        dnaGroup.rotation.y += 0.005;
      }
      
      const currentWidth = canvas.clientWidth;
      const currentHeight = canvas.clientHeight;
      if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
        threeCamera.aspect = currentWidth / currentHeight;
        threeCamera.updateProjectionMatrix();
        threeRenderer.setSize(currentWidth, currentHeight, false);
      }
      
      threeRenderer.render(threeScene, threeCamera);
    }
    
    isThreeInitialized = true;
    isDnaLoopActive = true;
    tick();
  }

  function resumeDnaHelixLoop() {
    isDnaLoopActive = true;
    // We need a tick trigger to start the render loop again
    const canvas = document.getElementById("demo-three-canvas");
    if (!canvas) return;
    
    function tick() {
      if (!isDnaLoopActive) return;
      requestAnimationFrame(tick);
      
      dnaGroup.rotation.y += 0.005;
      
      const currentWidth = canvas.clientWidth;
      const currentHeight = canvas.clientHeight;
      if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
        threeCamera.aspect = currentWidth / currentHeight;
        threeCamera.updateProjectionMatrix();
        threeRenderer.setSize(currentWidth, currentHeight, false);
      }
      
      threeRenderer.render(threeScene, threeCamera);
    }
    tick();
  }

  // Start typewriter simulation by default
  setTimeout(runNextDemoStep, 1500);
}

// 13. Study Notepad Interactivity
function initNotepad() {
  const textarea = document.getElementById("study-notes-textarea");
  if (!textarea) return;

  // Load saved notes
  const savedNotes = localStorage.getItem("study_notes") || "";
  textarea.value = savedNotes;

  // Save notes on input
  textarea.addEventListener("input", () => {
    localStorage.setItem("study_notes", textarea.value);
  });

  window.clearNotepad = function() {
    if (confirm("Are you sure you want to clear your notes?")) {
      textarea.value = "";
      localStorage.removeItem("study_notes");
    }
  };

  window.copyNotepad = function() {
    textarea.select();
    document.execCommand("copy");
    
    // Quick notification on the button
    const copyBtn = document.querySelector(".chat-notepad .notepad-btn:nth-child(2)");
    if (copyBtn) {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "Copied! ✓";
      copyBtn.style.color = "var(--accent-primary)";
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.color = "";
      }, 1500);
    }
  };
}
