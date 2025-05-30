fetch('http://192.168.1.28:5000/posters')
  .then(res => res.json())
  .then(posters => {
    // 중복 url 방지: posters 배열에서 중복 url 제거
    const uniquePosters = posters.filter(
      (poster, idx, self) =>
        idx === self.findIndex(p => p.url === poster.url)
    );

    // 3가지 컬러 반복 적용
    const colors = ['#c00b0b', '#1f355d', '#ffbe3b'];

    function setBanner(selector, poster, colorIdx) {
      const banner = document.querySelector(selector);
      const imgBox = banner.querySelector('.poster-img-box');
      const caption = banner.querySelector('.banner-caption');
      imgBox.innerHTML = `<img src="${poster.url}" alt="포스터">`;
      imgBox.style.setProperty('--poster-bg', colors[colorIdx % 3]);
      caption.textContent = poster.title || '';
      caption.style.color = "#222"
    }
    if (uniquePosters.length > 1) {
        let leftIdx = Math.floor(Math.random() * uniquePosters.length);
        let rightIdx;
        do {
          rightIdx = Math.floor(Math.random() * uniquePosters.length);
        } while (rightIdx === leftIdx);
      
        setBanner('.ad-left', uniquePosters[leftIdx], 0);
        setBanner('.ad-right', uniquePosters[rightIdx], 1);
      }
    function updateBannerPosition() {
      const scrollY = window.scrollY || window.pageYOffset;
      document.querySelectorAll('.ad-banner').forEach(banner => {
        banner.style.top = (300 + scrollY) + 'px';
      });
    }
    window.addEventListener('scroll', updateBannerPosition);
    window.addEventListener('resize', updateBannerPosition);
    document.addEventListener('DOMContentLoaded', updateBannerPosition);
  });