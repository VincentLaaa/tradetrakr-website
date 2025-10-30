(function() {
  const doc = document.documentElement;
  const body = document.body;

  function toRGBTuple(color) {
    if (!color) return null;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = color;
    const normalized = ctx.fillStyle;
    const hexMatch = normalized.match(/^#([0-9a-f]{6})$/i);
    if (hexMatch) {
      const value = parseInt(hexMatch[1], 16);
      return [
        (value >> 16) & 255,
        (value >> 8) & 255,
        value & 255
      ];
    }
    const rgbMatch = normalized.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
      return [
        Number(rgbMatch[1]),
        Number(rgbMatch[2]),
        Number(rgbMatch[3])
      ];
    }
    return null;
  }

  function setAccent(rgbArr) {
    if (!rgbArr) return;
    const [r, g, b] = rgbArr;
    const rgbString = `${r},${g},${b}`;
    doc.style.setProperty('--accent-rgb', rgbString);
    const hex = '#' + [r, g, b]
      .map(value => value.toString(16).padStart(2, '0'))
      .join('');
    doc.style.setProperty('--accent', hex);
  }

  function pickAccent() {
    const dataAccent = body.getAttribute('data-accent');
    if (dataAccent) {
      const rgb = toRGBTuple(dataAccent);
      if (rgb) return rgb;
    }

    const styles = getComputedStyle(doc);
    const variables = [
      styles.getPropertyValue('--accent'),
      styles.getPropertyValue('--primary'),
      styles.getPropertyValue('--brand')
    ];
    for (const value of variables) {
      const trimmed = value && value.trim();
      if (!trimmed) continue;
      const rgb = toRGBTuple(trimmed);
      if (rgb) return rgb;
    }

    const candidate = document.querySelector('.btn, .cta, a[href], button');
    if (candidate) {
      const computed = getComputedStyle(candidate);
      const color = computed.getPropertyValue('color');
      const rgb = toRGBTuple(color);
      if (rgb) return rgb;
    }

    return [109, 93, 252];
  }

  setAccent(pickAccent());
})();



