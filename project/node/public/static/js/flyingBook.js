// flyingBook.js
// 화면에 책 아이콘이 여유롭게 날아다니는 애니메이션

window.addEventListener('DOMContentLoaded', function() {
    // 책 아이콘 요소 생성
    const book = document.createElement('div');
    book.id = 'flying-book';
    book.innerHTML = '<i class="fas fa-book"></i>';
    document.body.appendChild(book);

    // 스타일 적용
    Object.assign(book.style, {
        position: 'fixed',
        top: '50%',
        left: '0%',
        fontSize: '2.8rem',
        color: '#a259ff',
        zIndex: 9999,
        pointerEvents: 'none',
        transition: 'filter 0.2s',
        filter: 'drop-shadow(0 2px 8px rgba(162,89,255,0.3))',
        animation: 'flyBook 12s linear infinite',
    });

    // keyframes 동적 생성
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
    @keyframes flyBook {
        0% {
            top: 60%; left: -60px; transform: rotate(-15deg) scale(1);
        }
        20% {
            top: 30%; left: 30vw; transform: rotate(10deg) scale(1.15);
        }
        40% {
            top: 10%; left: 60vw; transform: rotate(-10deg) scale(1.1);
        }
        60% {
            top: 60%; left: 90vw; transform: rotate(12deg) scale(1.2);
        }
        80% {
            top: 80%; left: 50vw; transform: rotate(-8deg) scale(1.05);
        }
        100% {
            top: 60%; left: -60px; transform: rotate(-15deg) scale(1);
        }
    }
    `;
    document.head.appendChild(styleSheet);
});
