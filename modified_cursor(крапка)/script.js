const elems = []; // Array to store the elements
const N = 5; // Number of elements (dragon body segments)
let frm = 0; // Frame counter
const rad = 1; // Radius or any other constant
const width = window.innerWidth; // Width of the viewport
const height = window.innerHeight; // Height of the viewport
const pointer = { x: width / 2, y: height / 2 }; // Initial pointer position

// Initialize elements
for (let i = 0; i < N; i++) {
    const elem = document.getElementById(`elem${i}`);
    elems.push({
        x: parseFloat(elem.getAttribute('cx')),
        y: parseFloat(elem.getAttribute('cy')),
        use: elem
    });
}

const run = () => {
    requestAnimationFrame(run);
    frm += 0.01; // Increment frame counter

    let e = elems[0];
    const ax = (Math.cos(3 * frm) * rad * width) / height;
    const ay = (Math.sin(4 * frm) * rad * height) / width;
    e.x += (ax + pointer.x - e.x) / 10;
    e.y += (ay + pointer.y - e.y) / 10;

    // Update the position of the first element
    e.use.setAttribute('cx', e.x);
    e.use.setAttribute('cy', e.y);

    for (let i = 1; i < N; i++) {
        let e = elems[i];
        let ep = elems[i - 1];
        const a = Math.atan2(e.y - ep.y, e.x - ep.x);
        e.x += (ep.x - e.x + (Math.cos(a) * (100 - i)) / 5) / 4;
        e.y += (ep.y - e.y + (Math.sin(a) * (100 - i)) / 5) / 4;
        const s = (162 + 4 * (1 - i)) / 50;
        e.use.setAttributeNS(
            null,
            "transform",
            `translate(${(ep.x + e.x) / 2}, ${(ep.y + e.y) / 2}) rotate(${(180 / Math.PI) * a}) translate(0,${s}) scale(${s},${s})`
        );
        e.use.setAttribute('cx', e.x);
        e.use.setAttribute('cy', e.y);
    }
};

// Start the animation loop
run();

// Update pointer position based on mouse movement
document.addEventListener('mousemove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
});
