// Set the current year in the footer
window.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = String(new Date().getFullYear());
});