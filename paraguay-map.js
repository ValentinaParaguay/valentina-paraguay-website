(function() {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const W = canvas.parentElement.offsetWidth || 400;
  const H = canvas.parentElement.offsetHeight || 400;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // Paraguay border coordinates (simplified, normalized 0-1)
  const paraguayCoords = [
    [0.82,0.02],[0.88,0.05],[0.92,0.10],[0.95,0.18],[0.98,0.28],
    [1.00,0.38],[0.98,0.45],[0.95,0.50],[0.90,0.54],[0.85,0.56],
    [0.80,0.60],[0.78,0.65],[0.75,0.72],[0.72,0.80],[0.68,0.88],
    [0.62,0.95],[0.55,1.00],[0.48,0.98],[0.40,0.95],[0.32,0.90],
    [0.25,0.85],[0.18,0.78],[0.12,0.70],[0.08,0.62],[0.05,0.52],
    [0.02,0.42],[0.00,0.32],[0.02,0.22],[0.05,0.14],[0.10,0.08],
    [0.16,0.04],[0.22,0.01],[0.30,0.00],[0.40,0.01],[0.50,0.00],
    [0.60,0.01],[0.70,0.01],[0.78,0.01],[0.82,0.02]
  ];

  // Rio Paraguay - divides East and West
  const rioParaguay = [
    [0.42,0.02],[0.44,0.10],[0.45,0.20],[0.44,0.30],
    [0.42,0.40],[0.40,0.50],[0.38,0.60],[0.36,0.70],[0.34,0.82]
  ];

  const padding = 40;
  const mapW = W - padding * 2;
  const mapH = H - padding * 2;

  function toCanvas(nx, ny) {
    return [padding + nx * mapW, padding + ny * mapH];
  }

  let time = 0;
  let dots = [];

  // Generate dot grid inside Paraguay
  function pointInParaguay(nx, ny) {
    let inside = false;
    const coords = paraguayCoords;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      const xi = coords[i][0], yi = coords[i][1];
      const xj = coords[j][0], yj = coords[j][1];
      if (((yi > ny) !== (yj > ny)) && (nx < (xj - xi) * (ny - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  for (let x = 0; x <= 1; x += 0.035) {
    for (let y = 0; y <= 1; y += 0.035) {
      if (pointInParaguay(x, y)) {
        dots.push({
          nx: x, ny: y,
          offset: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.6
        });
      }
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    time += 0.012;

    // Draw Paraguay outline with glow
    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.4)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    paraguayCoords.forEach(([nx, ny], i) => {
      const [x, y] = toCanvas(nx, ny);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Fill subtle
    ctx.beginPath();
    paraguayCoords.forEach(([nx, ny], i) => {
      const [x, y] = toCanvas(nx, ny);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fill();

    // Rio Paraguay
    ctx.beginPath();
    rioParaguay.forEach(([nx, ny], i) => {
      const [x, y] = toCanvas(nx, ny);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Animated dots
    dots.forEach(dot => {
      const pulse = Math.sin(time * dot.speed + dot.offset);
      const alpha = 0.15 + 0.5 * ((pulse + 1) / 2);
      const size = 1 + 0.8 * ((pulse + 1) / 2);
      const [x, y] = toCanvas(dot.nx, dot.ny);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });

    // Asunción marker (capital)
    const [ax, ay] = toCanvas(0.30, 0.52);
    const pulseSize = 3 + 2 * Math.sin(time * 1.5);
    ctx.beginPath();
    ctx.arc(ax, ay, pulseSize, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ax, ay, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // Asunción label
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Asunción', ax + 8, ay + 4);

    requestAnimationFrame(drawFrame);
  }

  drawFrame();
})();
