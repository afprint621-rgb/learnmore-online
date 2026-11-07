const grades = ['ECD', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];
const gradeList = document.querySelector('#grade-list');
const gradeColors = ['#e9f4d8', '#e4efff', '#fff0d6', '#f4e8ff', '#e3f7f3', '#ffe8e5', '#edf0ff', '#fdf0dc'];

grades.forEach((grade, index) => {
  const button = document.createElement('button');
  button.className = 'grade-chip';
  button.type = 'button';
  button.style.setProperty('--chip-color', gradeColors[index]);
  button.textContent = grade;
  button.setAttribute('aria-label', `Explore ${grade}`);
  button.addEventListener('click', () => {
    document.querySelectorAll('.grade-chip').forEach((chip) => chip.classList.remove('selected'));
    button.classList.add('selected');
    const title = document.querySelector('#learn h2');
    title.textContent = `${grade}: learning can be an adventure`;
  });
  gradeList.append(button);
});

document.querySelector('#year').textContent = new Date().getFullYear();
const languagePicker = document.querySelector('#language');
languagePicker.addEventListener('change', (event) => {
  const language = event.target.value;
  document.documentElement.lang = language;
  document.querySelectorAll('[data-en][data-sn]').forEach((element) => {
    element.textContent = element.dataset[language];
  });
});
