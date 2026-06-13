// Code group tab switching
document.querySelectorAll('.code-group').forEach(group => {
  const inputs = group.querySelectorAll('.tabs input');
  const blocks = group.querySelectorAll('.blocks > div');
  inputs.forEach((input, idx) => {
    input.addEventListener('change', () => {
      blocks.forEach((b, i) => b.classList.toggle('active', i === idx));
    });
  });
});

// Highlight.js dark/light mode toggle
const lightCSS = document.getElementById('hljs-light');
const darkCSS = document.getElementById('hljs-dark');
if (lightCSS && darkCSS) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  function updateTheme(e) {
    if (e.matches) {
      lightCSS.setAttribute('disabled', '');
      darkCSS.removeAttribute('disabled');
    } else {
      darkCSS.setAttribute('disabled', '');
      lightCSS.removeAttribute('disabled');
    }
  }
  mq.addEventListener('change', updateTheme);
  updateTheme(mq);
}
