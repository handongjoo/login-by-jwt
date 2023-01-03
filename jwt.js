const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const jwtConfig = {
    secretKey : 'mysecretkey', //  암호화 키
    options : {
        algorithm : "HS256", // 핵심 알고리즘
        expiresIn : "10m", // 토큰 유효 기간
        issuer : "dongjoo" // 토큰 발행자
    }
};

const app = express();

// cookie-parser 미들웨어 사용
app.use(cookieParser());
// json 형식의 body 데이터 사용
app.use(express.json());


// 임의의 데이터 배열 생성
const users = [
    {id: "handongjoo"},
    {id: "hanpotato"},
    {id: "podong"}
];

// 로그인 하기
app.post('/login', (req, res) => {
    try{
        const {userId} = req.body;
    // users를 돌면서 값을 찾는다(users 안에 있는 (1)user.id 값과 (2)내가 body 데이터로 전달한 userId 값이 동일한 데이터를 찾는다.)
        const user = users.find(user => user.id === userId);
        
        const token = jwt.sign({userId : user.id},jwtConfig.secretKey, jwtConfig.options);
        res.cookie("user",token);
        res.send({token});
    } catch {
        res.send("잘못된 접근");
    }
        
});

// 유저 정보 확인
app.get('/users', (req, res) => {
    try{
        const user = req.cookies.user;
        const token = jwt.verify(user, jwtConfig.secretKey);
        if (token) {
            return res.send({user})
        }
    } catch {
        res.send("로그인 후 사용 가능합니다.")
    }
});


app.post('/logout', (req, res) => {
    res.send("logout page");
});

app.post('/register', (req, res) => {
    res.send("register page");
});

// 서버 오픈
app.listen(3000, () => {
    console.log("서버 연결")
});