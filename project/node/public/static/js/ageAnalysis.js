document.addEventListener("DOMContentLoaded", function() {
    const ageGroupYearRanges = {
      17: {start: "2015-01-01", end: "2025-12-31"},
      22: {start: "2015-01-01", end: "2025-12-31"},
      27: {start: "2010-01-01", end: "2025-12-31"},
      32: {start: "2005-01-01", end: "2025-12-31"},
      37: {start: "2000-01-01", end: "2025-12-31"},
    };
  
    // 세대 라벨 매핑
    const ageGroupLabels = {
      17: "Z세대 후반 (17~21세)",
      22: "Z세대 중심 (22~26세)",
      27: "밀레니얼 후반 (27~31세)",
      32: "밀레니얼 중반 (32~36세)",
      37: "밀레니얼 초반 (37~41세)"
    };
  
    let genreChart = null;
    document.getElementById('searchForm').onsubmit = async function(e) {
      e.preventDefault();
      this.style.display = 'none';
      const ageGroup = this.ageGroup.value;
      const range = ageGroupYearRanges[ageGroup];
      const startDt = range.start;
      const endDt = range.end;
      // 서버 라우터로 GET 요청 (쿼리스트링)
      const params = new URLSearchParams({ ageGroup, startDt, endDt });
      const res = await fetch(`/generation-genre-change?${params.toString()}`);
      const data = await res.json();
      console.log('data:', data);
      console.log('labels:', data.labels);
      console.log('datasets:', data.datasets);
      console.log('Chart:', typeof Chart);
      console.log('ChartDataLabels:', typeof ChartDataLabels);

      // 선택한 세대 라벨 동적 생성
      const ageLabel = ageGroupLabels[ageGroup] || "";

      // Chart.js 차트 그리기 (막대 중앙정렬용 dummy dataset 적용)
      let chartDatasets = data.datasets;
      if (data.datasets.length === 1) {
        // 단일 dataset일 때만 dummy dataset 추가
        const dummyData = new Array(data.labels.length).fill(0);
        chartDatasets = [
          {
            label: 'dummy',
            data: dummyData,
            backgroundColor: 'rgba(0,0,0,0)',
            borderWidth: 0,
            hoverBackgroundColor: 'rgba(0,0,0,0)',
            hoverBorderColor: 'rgba(0,0,0,0)'
          },
          data.datasets[0]
        ];
      }

      // --- 여기서 막대그래프 색상 지정 ---
      const BAR_COLORS = ['#c00b0b', '#1f355d', '#ffbe3b'];
      chartDatasets.forEach((ds) => {
        // dummy dataset은 건너뜀
        if (ds.label !== 'dummy') {
          // 각 막대(년도)마다 색상을 다르게 지정
          ds.backgroundColor = ds.data.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]);
        }
      });

      if (data.labels && chartDatasets) {
        const ctx = document.getElementById('genreChart').getContext('2d');
        if (genreChart) genreChart.destroy();
        genreChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: chartDatasets
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                enabled: true,
                backgroundColor: '#fff',
                titleColor: '#222',
                bodyColor: '#555',
              },
              legend: {
                position: 'top',
                labels: {
                  font: { size: 14, family: 'Montserrat' },
                  color: '#333',
                  generateLabels: function(chart) {
                    const datasets = chart.data.datasets;
                    const yearLabels = chart.data.labels;
                    const legendItems = [];
                    datasets.forEach((ds, dsIdx) => {
                      if (ds.label === 'dummy') return;
                      // 장르명에서 가운데 값만 추출 (예: '문학 > 일본문학 > 소설' -> '일본문학')
                      const genreParts = ds.label.split('>');
                      let middleGenre = ds.label;
                      if (genreParts.length === 3) {
                        middleGenre = genreParts[1].trim();
                      }
                      yearLabels.forEach((year, i) => {
                        const value = (ds.data || [])[i];
                        if (value && value !== 0) {
                          legendItems.push({
                            text: `${year} - ${middleGenre}`,
                            fillStyle: Array.isArray(ds.backgroundColor) ? ds.backgroundColor[i] : ds.backgroundColor,
                            strokeStyle: Array.isArray(ds.backgroundColor) ? ds.backgroundColor[i] : ds.backgroundColor,
                            hidden: !chart.isDatasetVisible(dsIdx),
                            lineCap: 'butt',
                            lineDash: [],
                            lineDashOffset: 0,
                            lineJoin: 'miter',
                            lineWidth: 1,
                            pointStyle: 'rect',
                            datasetIndex: dsIdx,
                            year: year // 정렬용
                          });
                        }
                      });
                    });
                    // 년도 오름차순으로 정렬
                    legendItems.sort((a, b) => parseInt(a.year) - parseInt(b.year));
                    return legendItems;
                  }
                }
              },
              title: {
                display: true,
                text: `${ageLabel}의 독서 성향 분석 결과`,
                font: { size: 24, family: 'Montserrat', weight: 'bold'},
                color: '#222'
              },
              datalabels: {
                color: 'white',
                display: function(context) {
                  return context.dataset.data[context.dataIndex] > 15;
                },
                font: { weight: 'bold' },
                formatter: function(value, context) {
                  return Math.round(value) + '권';
                }
              }
            },
            elements: {
              bar: {
                borderSkipped: false
              }
            },
            animation: {
              duration: 450,
              easing: 'linear',
              delay: function(ctx) {
                if (ctx.type === 'data' && ctx.mode === 'default' && ctx.dataIndex !== undefined) {
                  return ctx.dataIndex * 150; 
                }
                return 0;
              }
            },
            layout: {
              padding: {
                top: 24,
                right: 16,
                bottom: 0,
                left: 8
              }
            },
            aspectRatio: 5 / 3,
            scales: {
              x: {
                ticks: { font: { size: 12 }, color: '#222' },
                grid: { color: '#eee' },
                categoryPercentage: 0.95,
                barPercentage: 1.0,
                stacked: true
              },
              y: {
                beginAtZero: true,
                ticks: { font: { size: 12 }, color: '#222' },
                grid: { color: '#eee' },
                stacked: true
              }
            }
          },
          plugins: [ChartDataLabels]
        });
        document.getElementById('graph-container').style.display = 'block';

        // 인기 도서 표 출력
        if (data.topBooks && data.topBooks.length > 0) {
          let html = '<table class="top-books-table"><thead><tr><th>년도</th><th>장르</th><th>인기 도서</th><th>대출수</th></tr></thead><tbody>';
          data.topBooks.forEach(book => {
            // 장르가 '문학 > 일본문학 > 소설'처럼 '>'로 구분된 경우 두번째 요소만 표시
            let genre = book.classNm;
            if (genre && genre.includes('>')) {
              const parts = genre.split('>');
              if (parts.length >= 2) {
                genre = parts[1].trim();
              }
            }
            html += `<tr>
              <td>${book.year}</td>
              <td>${genre}</td>
              <td>${book.title}</td>
              <td>${book.loanCount}</td>
            </tr>`;
          });
          html += '</tbody></table>';
          document.getElementById('top-books').innerHTML = html;
        } else {
          document.getElementById('top-books').innerHTML = '';
        }
      } else {
        document.getElementById('graph-container').style.display = 'none';
      }
    }
});
