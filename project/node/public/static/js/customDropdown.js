// 커스텀 드롭다운 동작 구현
window.addEventListener('DOMContentLoaded', function() {
  const dropdown = document.getElementById('customDropdown');
  const selected = document.getElementById('dropdownSelected');
  const options = document.getElementById('dropdownOptions');
  const input = document.getElementById('ageGroupInput');

  // 드롭다운 열기/닫기
  selected.addEventListener('click', function(e) {
    options.style.display = options.style.display === 'none' ? 'block' : 'none';
    selected.classList.toggle('open');
  });

  // 옵션 선택
  options.querySelectorAll('li').forEach(function(li) {
    li.addEventListener('click', function(e) {
      selected.textContent = li.textContent;
      input.value = li.getAttribute('data-value');
      options.style.display = 'none';
      selected.classList.remove('open');
    });
  });

  // 바깥 클릭 시 닫기
  document.addEventListener('click', function(e) {
    if (!dropdown.contains(e.target)) {
      options.style.display = 'none';
      selected.classList.remove('open');
    }
  });
});
