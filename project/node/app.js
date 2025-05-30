const express = require('express');
const morgan = require('morgan');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.set('port', process.env.PORT || 80);
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// 썸네일 이미지를 /images/thumbnails로 서비스
app.use('/images/thumbnails', express.static(path.join(__dirname, '../images/thumbnails')));

var main = require('./routes/main');
app.use('/', main);

app.listen(app.get('port'), '0.0.0.0', () => {
    console.log("Server is started~!  Port : " + app.get('port'));
}); 
