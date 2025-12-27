const c = document.getElementById('fireworks');
const ctx = c.getContext('2d');
let w = c.width = window.innerWidth;
let h = c.height = window.innerHeight;
const hw = w / 2;
const hh = h / 2;
const opts = {
    strings: ['HAPPY', 'BIRTHDAY!', 'DEVELOPERS'],
    charSize: 30,
    charSpacing: 35,
    lineHeight: 40,
    cx: w / 2,
    cy: h / 2
};

const particles = [];
const fireworks = [];
const letters = [];
let currentPhase = 0;

function Particle(x, y, hue) {
    this.x = x;
    this.y = y;
    this.hue = hue;
    this.color = `hsl(${hue}, 100%, 50%)`;
    this.alpha = 1;
    this.size = Math.random() * 2 + 1;
    this.speed = Math.random() * 2 + 1;
    this.angle = Math.random() * Math.PI * 2;
    this.gravity = 0.05;
    this.friction = 0.95;
    this.decay = Math.random() * 0.05 + 0.01;
}

Particle.prototype.update = function() {
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha -= this.decay;
    if (this.alpha <= 0) {
        this.alpha = 0;
    }
};

Particle.prototype.draw = function() {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
};

function Firework(x, y, targetX, targetY, hue) {
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.hue = hue;
    this.color = `hsl(${hue}, 100%, 50%)`;
    this.speed = 2;
    this.angle = Math.atan2(targetY - y, targetX - x);
    this.distanceToTarget = Math.hypot(targetX - x, targetY - y);
    this.distanceTraveled = 0;
    this.exploded = false;
}

Firework.prototype.update = function() {
    if (this.exploded) {
        return;
    }
    this.distanceTraveled += this.speed;
    if (this.distanceTraveled >= this.distanceToTarget) {
        this.exploded = true;
        createParticles(this.targetX, this.targetY, this.hue);
    } else {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }
};

Firework.prototype.draw = function() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
};

function createParticles(x, y, hue) {
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y, hue));
    }
}

function createFireworks() {
    const fireworkCount = 3;
    for (let i = 0; i < fireworkCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const targetX = hw;
        const targetY = hh;
        const hue = Math.random() * 360;
        fireworks.push(new Firework(x, y, targetX, targetY, hue));
    }
}

function Letter(char, x, y, color) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = Math.random() * 2 + 1;
    this.alpha = 1;
    this.decay = 0.01;
}

Letter.prototype.update = function() {
    this.y -= this.speed;
    this.alpha -= this.decay;
    if (this.alpha <= 0) {
        this.alpha = 0;
    }
};

Letter.prototype.draw = function() {
    ctx.font = `${opts.charSize}px Arial`;
    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.char, this.x, this.y);
};

function drawText() {
    ctx.font = `${opts.charSize}px Arial`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    opts.strings.forEach((str, index) => {
        const textWidth = ctx.measureText(str).width;
        const x = opts.cx - textWidth / 2;
        const y = opts.cy + index * opts.lineHeight;
        for (let i = 0; i < str.length; i++) {
            const color = { r: 255, g: 255, b: 255 }; // Default color
            if (currentPhase === 0 && i === 0) {
                color.r = 255; color.g = 255; color.b = 0; // Yellow
            } else if (currentPhase === 1 && i === Math.floor(str.length / 2)) {
                color.r = 255; color.g = 0; color.b = 0; // Red
            } else if (currentPhase === 2 && i === str.length - 1) {
                color.r = 0; color.g = 0; color.b = 255; // Blue
            }
            letters.push(new Letter(str[i], x + i * opts.charSpacing, y, color));
        }
    });
    currentPhase++;
}

function update() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
    });
    fireworks.forEach((firework, index) => {
        firework.update();
        firework.draw();
        if (firework.exploded && particles.length === 0) {
            fireworks.splice(index, 1);
        }
    });
    letters.forEach((letter, index) => {
        letter.update();
        letter.draw();
        if (letter.alpha <= 0) {
            letters.splice(index, 1);
        }
    });
    if (fireworks.length === 0 && particles.length === 0 && letters.length === 0 && currentPhase < 3) {
        drawText();
    }
    requestAnimationFrame(update);
}

createFireworks();
update();

window.addEventListener('resize', () => {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    hw = w / 2;
    hh = h / 2;
    opts.cx = w / 2;
    opts.cy = h / 2;
});
