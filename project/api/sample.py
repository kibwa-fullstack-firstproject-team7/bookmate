import requests
import pandas as pd
import matplotlib.pyplot as plt
import json
from datetime import datetime, timedelta
import matplotlib.font_manager as fm
# API_KEY = 'c9eb283fb128e02210af9731fb75d7771b7399f8560cecad0d924fb29470bd7a'
# url = f'http://data4library.kr/api/loanItemSrch?authKey=c9eb283fb128e02210af9731fb75d7771b7399f8560cecad0d924fb29470bd7a&startDt=2024-10-10&endDt=2024-10-24&format=json'

event_date_str = input("특정 사건이 발생한 날짜를 입력하세요 (YYYY-MM-DD): ")
event_date = datetime.strptime(event_date_str, "%Y-%m-%d").date()
before_start_date = event_date - timedelta(weeks=2)
before_end_date = event_date - timedelta(days=1)
after_start_date = event_date
after_end_date = event_date + timedelta(days=7)

before_start_str = before_start_date.strftime("%Y-%m-%d")
before_end_str = before_end_date.strftime("%Y-%m-%d")
after_start_str = after_start_date.strftime("%Y-%m-%d")
after_end_str = after_end_date.strftime("%Y-%m-%d")

auth_key = "x"  # 여기에 발급받은 인증키를 넣어주세요.

before_url = f"http://data4library.kr/api/loanItemSrch?authKey={auth_key}&startDt=  Dt={before_end_str}&format=json&pageSize=200"
before_response = requests.get(before_url)
before_data = json.loads(before_response.text)

before_books = []
before_counts = []
if 'response' in before_data and 'docs' in before_data['response']:
    for doc in before_data['response']['docs']:
        before_books.append(doc['doc']['bookname'])
        before_counts.append(doc['doc']['loan_count'])

before_df = pd.DataFrame({'도서 제목': before_books, '대출 횟수': before_counts})
before_df_sorted = before_df.sort_values(by='대출 횟수', ascending=False).head(5)

# 2주전 

before_url = f"http://data4library.kr/api/loanItemSrch?authKey={auth_key}&startDt={before_start_str}&endDt={before_end_str}&format=json&pageSize=200"
before_response = requests.get(before_url)
before_data = json.loads(before_response.text)

before_books = []
before_counts = []
if 'response' in before_data and 'docs' in before_data['response']:
    for doc in before_data['response']['docs']:
        before_books.append(doc['doc']['bookname'])
        before_counts.append(doc['doc']['loan_count'])

before_df = pd.DataFrame({'도서 제목': before_books, '대출 횟수': before_counts})
before_df_sorted = before_df.sort_values(by='대출 횟수', ascending=False).head(5)


# 2주후 데이터

after_url = f"http://data4library.kr/api/loanItemSrch?authKey={auth_key}&startDt={after_start_str}&endDt={after_end_str}&format=json&pageSize=200"
after_response = requests.get(after_url)
after_data = json.loads(after_response.text)

after_books = []
after_counts = []
if 'response' in after_data and 'docs' in after_data['response']:
    for doc in after_data['response']['docs']:
        after_books.append(doc['doc']['bookname'])
        after_counts.append(doc['doc']['loan_count'])

after_df = pd.DataFrame({'도서 제목': after_books, '대출 횟수': after_counts})
after_df_sorted = after_df.sort_values(by='대출 횟수', ascending=False).head(5)


print(f"\n{event_date_str} 사건 발생 1주 전 인기 도서 순위 (1~5위):")
print(before_df_sorted)

print(f"\n{event_date_str} 사건 발생 1주 후 인기 도서 순위 (1~5위):")
print(after_df_sorted)

# 시각화 (선 그래프로 순위 변화 비교)
plt.figure(figsize=(12, 6))
plt.rcParams['font.family'] = 'NanumBarunGothic'
plt.plot(range(1, 6), before_df_sorted['대출 횟수'].values, marker='o', label='이벤트 2주 전')
plt.plot(range(1, 6), after_df_sorted['대출 횟수'].values, marker='o', label='이벤트 2주 후')

plt.title(f"{event_date_str} 사건 전후 2주간 인기 도서 대출 횟수 비교 (상위 5위)")
plt.xlabel("순위")
plt.ylabel("대출 횟수")
plt.xticks(range(1, 6))
plt.legend()
plt.grid(True)
plt.show()

# 막대 그래프로 각 기간별 상위 5개 도서 시각화
fig, axes = plt.subplots(1, 2, figsize=(15, 6))

axes[0].bar(before_df_sorted['도서 제목'], before_df_sorted['대출 횟수'], color='skyblue')
axes[0].set_title(f"{event_date_str} 사건 2주 전 인기 도서 (상위 5위)")
axes[0].set_xlabel("도서 제목")
axes[0].set_ylabel("대출 횟수")
axes[0].tick_params(axis='x', rotation=90)

axes[1].bar(after_df_sorted['도서 제목'], after_df_sorted['대출 횟수'], color='lightcoral')
axes[1].set_title(f"{event_date_str} 사건 2주 후 인기 도서 (상위 5위)")
axes[1].set_xlabel("도서 제목")
axes[1].set_ylabel("대출 횟수")
axes[1].tick_params(axis='x', rotation=90)

plt.tight_layout()
plt.show()