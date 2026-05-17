const canvas = document.getElementById('burbujasCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = 500; // coincide con la altura definida en CSS
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


const numBurbujas = 15;
const burbujas = [];

for (let i = 0; i < numBurbujas; i++) {
    burbujas.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 200,
        radius: 2 + Math.random() * 3,
        speed: 0.5 + Math.random() * 1,
        alpha: 0.3 + Math.random() * 0.5
    });
}


function drawBurbujas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    burbujas.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(33,107,69,${b.alpha})`; // color verde elegante
        ctx.fill();

        b.y -= b.speed;

        // Reiniciar burbuja al salir de la parte superior
        if (b.y < -10) {
            b.y = canvas.height + 10;
            b.x = Math.random() * canvas.width;
            b.radius = 2 + Math.random() * 3;
            b.speed = 0.5 + Math.random();
            b.alpha = 0.3 + Math.random() * 0.5;
        }
    });

    requestAnimationFrame(drawBurbujas);
}

drawBurbujas();