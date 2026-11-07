document.addEventListener('DOMContentLoaded', () => {
  const sectionLinks = document.querySelectorAll('.sidebar-nav a');

  sectionLinks.forEach((link) => {
    link.addEventListener('click', () => {
      sectionLinks.forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
    });
  });
});
