// loanChart.js - Chart.js 대출 그래프 전용 스크립트 (줄바꿈, 가운데 정렬, 기울임 제거)
window.renderLoanChart = function(eachBookData) {
    // 제목을 12글자마다 줄바꿈
    const labels = eachBookData.map(book => book.bookName.replace(/(.{12})/g, '$1\n'));
    const data = eachBookData.map(book => Number(book.loanCount));
    const ctx = document.getElementById('loanChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '대출 횟수',
                data: data,
                backgroundColor: [
                    'rgba(162, 89, 255, 0.65)',
                    'rgba(255, 99, 132, 0.55)',
                    'rgba(54, 162, 235, 0.55)',
                    'rgba(255, 206, 86, 0.55)',
                    'rgba(75, 192, 192, 0.55)'
                ],
                borderRadius: 18,
                borderSkipped: false,
                barThickness: 70,
                maxBarThickness: 90,
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#fff',
                    titleColor: '#a259ff',
                    bodyColor: '#333',
                    borderColor: '#a259ff',
                    borderWidth: 1,
                }
            },
            layout: { padding: 18 },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#000',
                        font: { weight: 'bold', size: 15 },
                        maxRotation: 0,
                        minRotation: 0,
                        align: 'center',
                        textAlign: 'center',
                        callback: function(value, index, ticks) {
                            // Chart.js v3 이상에서 줄바꿈 지원
                            return this.getLabelForValue(value).split('\n');
                        }
                    }
                },
                y: {
                    grid: { color: '#eee' },
                    ticks: { color: '#888', font: { size: 15 } }
                }
            }
        }
    });
}
