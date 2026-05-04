// Globe D3 - Vanilla JS
(function() {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const container = canvas.parentElement;
  const W = container.offsetWidth || 600;
  const H = container.offsetHeight || 600;
  const radius = Math.min(W, H) / 2.2;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const projection = d3.geoOrthographic()
    .scale(radius)
    .translate([W / 2, H / 2])
    .clipAngle(90);

  const path = d3.geoPath().projection(projection).context(ctx);
  const graticule = d3.geoGraticule();
  let landData = null;
  let rotation = [0, -20];
  let isDragging = false;
  let startPos = null;
  let startRotation = null;

  function render() {
    ctx.clearRect(0, 0, W, H);

    // Ocean
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, projection.scale(), 0, 2 * Math.PI);
    ctx.fillStyle = '#0A0A0A';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (!landData) return;

    // Graticule
    ctx.beginPath();
    path(graticule());
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Land fill
    ctx.beginPath();
    landData.features.forEach(f => path(f));
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  // Auto rotation
  const timer = d3.timer(function() {
    if (!isDragging) {
      rotation[0] += 0.3;
      projection.rotate(rotation);
      render();
    }
  });

  // Drag to rotate
  canvas.addEventListener('mousedown', function(e) {
    isDragging = true;
    startPos = [e.clientX, e.clientY];
    startRotation = [...rotation];
  });

  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    const dx = e.clientX - startPos[0];
    const dy = e.clientY - startPos[1];
    rotation[0] = startRotation[0] + dx * 0.4;
    rotation[1] = Math.max(-90, Math.min(90, startRotation[1] - dy * 0.4));
    projection.rotate(rotation);
    render();
  });

  document.addEventListener('mouseup', function() {
    isDragging = false;
  });

  // Touch support
  canvas.addEventListener('touchstart', function(e) {
    isDragging = true;
    startPos = [e.touches[0].clientX, e.touches[0].clientY];
    startRotation = [...rotation];
  });

  document.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startPos[0];
    const dy = e.touches[0].clientY - startPos[1];
    rotation[0] = startRotation[0] + dx * 0.4;
    rotation[1] = Math.max(-90, Math.min(90, startRotation[1] - dy * 0.4));
    projection.rotate(rotation);
    render();
  });

  document.addEventListener('touchend', function() {
    isDragging = false;
  });

  // Load land data
  fetch('https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json')
    .then(r => r.json())
    .then(data => {
      landData = data;
      render();
    })
    .catch(() => render());
})();
