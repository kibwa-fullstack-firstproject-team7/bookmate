import requests, json
import numpy as np
import pandas as pd
import os.path
import matplotlib.pyplot as plt
import pymysql
from datetime import datetime, timedelta
import matplotlib.font_manager as fm
from fastapi import FastAPI, Query
from typing import Optional
import urllib
from pydantic import BaseModel
import httpx
import asyncio

GRAPHS_DIR = os.path.dirname("/work/neo/project/api/graphs/")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.relpath("./")))
secret_file = os.path.join(BASE_DIR, '../../secret.json')

app = FastAPI()

with open(secret_file) as f:
    secrets = json.loads(f.read())

def get_secret(setting, secrets=secrets):
    try:
        return secrets[setting]
    except KeyError:
        errorMsg = "Set the {} environment variable.".format(setting)
        return errorMsg

def getDbConnection():
    return pymysql.connect(
        host=get_secret("Mysql_Hostname"),
        user=get_secret("Mysql_Username"),
        password=get_secret("Mysql_Password"),
        db=get_secret("Mysql_DBname"),
        charset='utf8',
        cursorclass=pymysql.cursors.DictCursor
    )

class BookStateRequest(BaseModel):
    isbn13: str
    region: str

app = FastAPI()

@app.get('/')
async def HealthCheck():
    return {"statusCode": 200, "message": "ok"}

@app.get('/LoanRankByDate')
async def getInfo(eventDate : Optional[str] = Query(default=datetime.now().strftime("%Y-%m-%d")), barColor : Optional[str] = Query(default='blue')):
    
    # DB 연결 및 중복 데이터 확인
    dbConnection = getDbConnection()
    cursor = dbConnection.cursor()
    sql = "SELECT * FROM analysisdata WHERE EVENT_DATE=%s"
    cursor.execute(sql, (eventDate))
    existData = cursor.fetchone()
    
    if existData:
        update_sql = """
        UPDATE analysisdata
        SET VIEW_COUNT = VIEW_COUNT + 1
        WHERE EVENT_DATE = %s
    """
        cursor.execute(update_sql, (eventDate))
        dbConnection.commit()
        return {"statusCode": 200, "message": "exist data",  "docs": {"graphImageURL": existData["GRAPH_URL"], "eachBookData" : existData["EACH_BOOK_DATA"], "viewCount" : existData["VIEW_COUNT"]}}

    # 데이터 없으므로 API 호출
    API_URL = "http://data4library.kr/api/loanItemSrch?"
    API_URL += "authKey=" + get_secret("doseonaru_apiKey")
    # 날짜 값 생성
    afterEventDate = (datetime.strptime(eventDate, "%Y-%m-%d") + timedelta(days=14)).strftime("%Y-%m-%d")

    # 사건 데이터 호출 및 분석 함수화
    API_URL += "&startDt=" + eventDate
    API_URL += "&endDt=" + afterEventDate
    API_URL += "&format=json"
    API_URL += "&pageNO=1"
    API_URL += "&pageSize=5"

    response = requests.get(API_URL)
    try:
        response.status_code
    except requests.exceptions.RequestException as e:
        return {"statusCode": response.status_code, "message": str(e)}
    contents = response.text
    contentsJson = json.loads(contents)
    contentsItems = contentsJson['response']['docs']
    data = contentsItems
    
    bookNameDataForGraph = []
    loanCountDataForGraph = []
    
    # API 호출 결과 만들기
    result = {"statusCode": 200, "message": "make new data", "docs": {"graphImageURL": "", "eachBookData" : [], "viewCount" : 0} }


    for eachData in data:

        # API 호출 결과에 추가
        eachDataDict = {}
        eachDataDict['ranking'] = eachData['doc']['ranking']
    # 그래프 작성을 위한 데이터 추가
        loanCountDataForGraph.append(eachData['doc']['loan_count'])

        # '권'이 여러권인 책의 경우 제목 데이터에 '권'이 추가됨
        print('vol 값:', eachData['doc'].get('vol', None))
        if eachData['doc'].get('vol', '') != '':
            eachDataDict['bookName'] = eachData['doc']['bookname'] + " " + f'<{eachData["doc"]["vol"]}권>'
            bookNameDataForGraph.append(eachData['doc']['bookname'] + " " + f'<{eachData["doc"]["vol"]}권>')
        else:
            eachDataDict['bookName'] = eachData['doc']['bookname']
            bookNameDataForGraph.append(eachData['doc']['bookname'])
        eachDataDict['author'] = eachData['doc']['authors']
        eachDataDict['isbn13'] = eachData['doc']['isbn13']
        eachDataDict['className'] = eachData['doc']['class_nm']
        eachDataDict['bookImageURL'] = eachData['doc']['bookImageURL']
        eachDataDict['loanCount'] = eachData['doc']['loan_count']
        result["docs"]["eachBookData"].append(eachDataDict)

    

    # 그래프 생성

    graphImageURL = os.path.join("../images/graphs", f"{eventDate}.png")
    plt.figure(figsize=(12, 6))
    plt.rcParams['font.family'] = 'NanumBarunGothic'
    plt.rcParams['axes.edgecolor'] = '#f3eaff'
    plt.rcParams['axes.linewidth'] = 2

    # 컬러 및 스타일 지정
    bar_color = '#a259ff'
    bar_shadow = '#e5d8fa'
    highlight_color = '#7c3aed'

    x = np.arange(len(bookNameDataForGraph))
    y = [int(v) for v in loanCountDataForGraph]

    # 그림자 효과용
    plt.bar(x, y, width=0.62, color=bar_shadow, zorder=1)
    bars = plt.bar(x, y, width=0.5, color=bar_color, zorder=2, edgecolor='none', linewidth=0, alpha=0.95)
    
    # 각 막대 위에 대출 횟수 표시
    for idx, value in enumerate(y):
        plt.text(idx, value + max(y) * 0.03, str(value), ha='center', va='bottom', fontsize=13, fontweight='bold', color=bar_color)

    plt.xticks(x, bookNameDataForGraph, fontsize=13, rotation=13)
    plt.yticks(fontsize=12)
    plt.title(f"{eventDate} 대출 도서 TOP 5", fontsize=18, fontweight='bold', color=bar_color, pad=18)
    plt.xlabel("도서 제목", fontsize=14, labelpad=10)
    plt.ylabel("대출 횟수", fontsize=14, labelpad=10)
    plt.grid(axis='y', linestyle='--', alpha=0.18)
    plt.tight_layout()
    plt.gca().spines[['top', 'right', 'left', 'bottom']].set_visible(False)

    plt.savefig(graphImageURL, dpi=300, bbox_inches='tight', transparent=True)
    plt.close() 

    # DB에 데이터 추가
    insert_sql = """
    INSERT INTO analysisdata (EVENT_DATE, GRAPH_URL, EACH_BOOK_DATA, VIEW_COUNT)
    VALUES (%s, %s, %s, %s)
    """
    cursor.execute(insert_sql, (eventDate, graphImageURL, json.dumps(result["docs"]["eachBookData"]), 1))
    dbConnection.commit()

    result["docs"]["graphImageURL"] = graphImageURL
    print(f"그래프 생성 완료: {graphImageURL}")

    if isinstance(result["docs"]["eachBookData"], list):
        result["docs"]["eachBookData"] = json.dumps(result["docs"]["eachBookData"], ensure_ascii=False)


    return result


@app.post('/checkBookState')
async def checkBookState(request: BookStateRequest):
    isbn13 = request.isbn13
    region = urllib.parse.unquote(request.region)
    print(region)
    regionName = region.split(' ')[0]
    twoWordRegionName = regionName[:2]
    detailedRegionName = region.split(' ')[1]

    dbConnection = getDbConnection()
    # 지역 코드 조회
    cursor = dbConnection.cursor()
    sql = "SELECT * FROM regions WHERE region_name=%s"
    cursor.execute(sql, (twoWordRegionName))
    regionData = cursor.fetchone()['region_code']
    cursor.close()
    # 세부지역 코드 조회
    cursor = dbConnection.cursor()
    sql = "SELECT * FROM detailed_regions WHERE region_name=%s AND detailed_name=%s"
    cursor.execute(sql, (regionName, detailedRegionName))
    detailedRegionData = cursor.fetchone()['dtl_region_code']
    cursor.close()
    # 이하 기존 로직...

    API_URL = "http://data4library.kr/api/libSrchByBook?authKey=" \
        + get_secret("doseonaru_apiKey") \
        + "&isbn=" + isbn13 \
        + "&region=" + regionData \
        + "&dtl_region=" + detailedRegionData \
        + "&format=json" \
        + "&pageNO=1" \
        + "&pageSize=100"

    response = requests.get(API_URL)
    try:
        response.status_code
    except requests.exceptions.RequestException as e:
        return {"statusCode": response.status_code, "message": "에러 발생", "error 내용": str(e)}
    data = response.json()
    LibraryList = data['response']['libs']
    searchedLibraryData = []
    
    for library in LibraryList:
        eachLibraryDict = {}
        eachLibraryDict['libCode'] = library['lib']['libCode']
        eachLibraryDict['libName'] = library['lib']['libName']
        eachLibraryDict['address'] = library['lib']['address']
        eachLibraryDict['tel'] = library['lib']['tel']
        searchedLibraryData.append(eachLibraryDict)
    
    # 수집된 도서관 코드로 대출 가능 여부 조회 (비동기 개선)
    API_URL = "http://data4library.kr/api/bookExist"
    API_URL += "?authKey=" + get_secret("doseonaru_apiKey")
    API_URL += "&isbn13=" + isbn13
    API_URL += "&format=json"

    async def fetch_loanable(library):
        CALL_API_URL = API_URL + "&libCode=" + library['libCode']
        async with httpx.AsyncClient() as client:
            resp = await client.get(CALL_API_URL)
            data = resp.json()
            try:
                bookstate = data['response']['result']
                library['isLoanable'] = bookstate.get('loanAvailable') == "Y"
            except KeyError:
                library['isLoanable'] = "확인 불가"
        return library

    tasks = [fetch_loanable(library) for library in searchedLibraryData]
    searchedLibraryData = await asyncio.gather(*tasks)

    result = {"statusCode": 200, "message": "정상적으로 조회되었습니다.", "docs": {"searchedLibraryData": searchedLibraryData}}

    return result