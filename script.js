const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let rotX = 0.73, rotY = 1.2, rotZ = 0.92;
let transX = 1.45, transY = 1.8, transZ = 1.4;
let scale = 1.6, perspective = 5;

let autoRotate = false;
let isDragging = false;
let lastMouseX = 0, lastMouseY = 0;

const s = 0.8;

// Cube vertices
const vertices = [
    [-s/2, -s/2, -s/2],
    [s/2, -s/2, -s/2],
    [s/2, s/2, -s/2],
    [-s/2, s/2, -s/2],
    [-s/2, -s/2, s/2],
    [s/2, -s/2, s/2],
    [s/2, s/2, s/2],
    [-s/2, s/2, s/2]
];

// Cube edges
const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0], // Bottom
    [4, 5], [5, 6], [6, 7], [7, 4], // Top
    [0, 4], [1, 5], [2, 6], [3, 7]  // Sides
];

// Cube faces
const faces = [
    [0, 1, 2, 3], // Bottom
    [4, 5, 6, 7], // Top
    [0, 1, 5, 4], // Front
    [2, 3, 7, 6], // Back
    [0, 3, 7, 4], // Left
    [1, 2, 6, 5]  // Right
];

function rotateX(x, y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: x,
        y: y * cos - z * sin,
        z: y * sin + z * cos
    };
}

function rotateY(x, y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: x * cos + z * sin,
        y: y,
        z: -x * sin + z * cos
    };
}

function rotateZ(x, y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: x * cos - y * sin,
        y: x * sin + y * cos,
        z: z
    };
}

function project(x, y, z) {
    const factor = perspective / (perspective + z);
    return {
        x: x * factor * scale * 100 + canvas.width / 2,
        y: -y * factor * scale * 100 + canvas.height / 2
    };
}

function transformVertex(vertex) {
    let {x, y, z} = {x: vertex[0], y: vertex[1], z: vertex[2]};
    
    // Translate
    x += transX;
    y += transY;
    z += transZ;
    
    // Rotate X
    let p = rotateX(x, y, z, rotX);
    // Rotate Y
    p = rotateY(p.x, p.y, p.z, rotY);
    // Rotate Z
    p = rotateZ(p.x, p.y, p.z, rotZ);
    
    return p;
}

function draw() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // transforming vertices
    const transformed = vertices.map(v => transformVertex(v));
    const projected = transformed.map(p => project(p.x, p.y, p.z));
    
    // render faces w depth sorting
    const facesWithDepth = faces.map((face, i) => {
        const avgZ = face.reduce((sum, vi) => sum + transformed[vi].z, 0) / face.length;
        return {face, depth: avgZ, index: i};
    });
    
    facesWithDepth.sort((a, b) => a.depth - b.depth);
    
    facesWithDepth.forEach(({face, index}) => {
        ctx.beginPath();
        ctx.moveTo(projected[face[0]].x, projected[face[0]].y);
        for (let i = 1; i < face.length; i++) {
            ctx.lineTo(projected[face[i]].x, projected[face[i]].y);
        }
        ctx.closePath();
        
        const colors = ['#1a4d6d', '#2a5d7d', '#1a5d4d', '#2a4d5d', '#3a4d5d', '#2a5d4d'];
        ctx.fillStyle = colors[index] + '99';
        ctx.fill();
        ctx.strokeStyle = '#4a9ddd';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // drawing edges
    ctx.strokeStyle = '#6ac5ff';
    ctx.lineWidth = 2;
    edges.forEach(edge => {
        const p1 = projected[edge[0]];
        const p2 = projected[edge[1]];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    });
    
    // drawing vertices
    ctx.fillStyle = '#8addff';
    projected.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateSliders() {
    document.getElementById('rotX').value = rotX;
    document.getElementById('rotY').value = rotY;
    document.getElementById('rotZ').value = rotZ;
    document.getElementById('transX').value = transX;
    document.getElementById('transY').value = transY;
    document.getElementById('transZ').value = transZ;
    document.getElementById('scale').value = scale;
    document.getElementById('persp').value = perspective;
    
    document.getElementById('rotXVal').textContent = rotX.toFixed(2);
    document.getElementById('rotYVal').textContent = rotY.toFixed(2);
    document.getElementById('rotZVal').textContent = rotZ.toFixed(2);
    document.getElementById('transXVal').textContent = transX.toFixed(2);
    document.getElementById('transYVal').textContent = transY.toFixed(2);
    document.getElementById('transZVal').textContent = transZ.toFixed(2);
    document.getElementById('scaleVal').textContent = scale.toFixed(2);
    document.getElementById('perspVal').textContent = perspective.toFixed(2);
}

// Event listeners for sliders
document.getElementById('rotX').addEventListener('input', e => { rotX = parseFloat(e.target.value); updateSliders(); draw(); });
document.getElementById('rotY').addEventListener('input', e => { rotY = parseFloat(e.target.value); updateSliders(); draw(); });
document.getElementById('rotZ').addEventListener('input', e => { rotZ = parseFloat(e.target.value); updateSliders(); draw(); });
document.getElementById('transX').addEventListener('input', e => { transX = parseFloat(e.target.value); updateSliders(); draw(); });
document.getElementById('transY').addEventListener('input', e => { transY = parseFloat(e.target.value); updateSliders(); draw(); });
document.getElementById('transZ').addEventListener('input', e => { transZ = parseFloat(e.target.value); updateSliders(); draw(); });
document.getElementById('scale').addEventListener('input', e => { scale = parseFloat(e.target.value); updateSliders(); draw(); });
document.getElementById('persp').addEventListener('input', e => { perspective = parseFloat(e.target.value); updateSliders(); draw(); });

// Mouse controls
canvas.addEventListener('mousedown', e => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener('mousemove', e => {
    if (isDragging) {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        
        rotY += deltaX * 0.01;
        rotX += deltaY * 0.01;
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        
        updateSliders();
        draw();
    }
});

canvas.addEventListener('mouseup', () => { isDragging = false; });
canvas.addEventListener('mouseleave', () => { isDragging = false; });

function resetView() {
    rotX = 0.73; rotY = 1.2; rotZ = 0.92;
    transX = 1.45; transY = 1.8; transZ = 1.4;
    scale = 1.6; perspective = 5;
    updateSliders();
    draw();
}

function toggleRotation() {
    autoRotate = !autoRotate;
}

function animate() {
    if (autoRotate) {
        rotY += 0.02;
        rotX += 0.01;
        updateSliders();
        draw();
    }
    requestAnimationFrame(animate);
}

updateSliders();
draw();
animate();