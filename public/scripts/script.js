/* map each university to its course list */
const courseMap = {
  "FS Tetouan": [
    "SLII",
    "SMA",
    "SMPC"
  ],
  "Faculté Économie": [
    "gestion",
    "economy",
    "blah blah"
  ],
  "Faculté LH": [
    "english Literature",
    "french Literature",
    "arabic Literature"
  ]
};

/* DOM refs */
const uniSelect    = document.getElementById('university');
const courseWrap   = document.getElementById('course-wrapper');
const courseSelect = document.getElementById('course');

/* when university changes */
uniSelect.addEventListener('change', () => {
  const uni = uniSelect.value;
  const courses = courseMap[uni] || [];

  /* build <option> list */
  courseSelect.innerHTML =
    '<option value="" selected disabled>Select a course</option>' +
    courses.map(c => `<option value="${c}">${c}</option>`).join('');

  /* reveal course dropdown */
  courseWrap.classList.remove('d-none');
});
