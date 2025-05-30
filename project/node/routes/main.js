const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('sync-mysql');
const env = require('dotenv').config({ path: "../../.env" });
const axios = require('axios'); 
const FastAPI = "http://192.168.1.28:3000"

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public')); 
app.use('/graphs', express.static(path.join(__dirname, '../../api/graphs')));

var connection = new mysql({
    host: process.env.host,
    user: process.env.user,
    port: process.env.port,
    password: process.env.password,
    database: process.env.database
});

app.get('/Hello', (req, res) => {
    res.send('Hello World!!')
    
})

app.get('/loanRankByDate', async (req, res) => {
    
    const top6Dates= connection.query("SELECT EVENT_DATE, VIEW_COUNT, EVENT_NAME, EVENT_THUMBNAIL_URL FROM analysisdata ORDER BY VIEW_COUNT DESC LIMIT 6;");
    res.render('pages/date/eventAnalysis', { top6Dates });
})

app.get('/viewAnalysis', async (req, res) => {
    const { eventDate } = req.query;
    try {
        const response = await axios(`${FastAPI}/LoanRankByDate?eventDate=${eventDate}`);
        const data = response.data;
        console.log(data);
        let graphImageURL = data.docs.graphImageURL;
        let eachBookData = JSON.parse(data.docs.eachBookData);
        let viewCount = data.docs.viewCount;
        let kakao_apiKey = process.env.kakao_apiKey;
        res.render('pages/date/analysisResult', { graphImageURL, eachBookData, viewCount, eventDate, kakao_apiKey });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    }   
    
})

app.post('/checkBookState', async (req, res) => {
    const { isbn13, region } = req.body;
    try {
        const response = await axios.post(`${FastAPI}/checkBookState`, { isbn13, region });
        const data = response.data;
        console.log(data);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    }
})  

app.get('/generation-genre-change', async (req, res) => {
    const { ageGroup, startDt, endDt } = req.query;
    console.log(ageGroup, startDt, endDt)
    try {
        const FASTAPI_URL = process.env.FASTAPI_URL || 'http://192.168.1.21:3000/generation-genre-change';
        const response = await axios.get(FASTAPI_URL, {
            params: { ageGroup, startDt, endDt }
        });
        res.json(response.data);
        console.log(response.data)
    } catch (err) {
        console.error('FastAPI 연동 오류:', err.message);
        res.status(500).json({ error: 'FastAPI 연동 실패', detail: err.message });
    }
});





module.exports = app;