const crypto = require('crypto')
const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

// cookie-parser 미들웨어 사용
app.use(cookieParser());
// json 형식의 body 데이터 사용
app.use(express.json());

// 암호화에 사용할 키
const ENCRYPTION_KEY = 'abcdefghijklmnop'.repeat(2) // Must be 256 bits (32 characters)
const IV_LENGTH = 16 // For AES, this is always 16


// 암호화 해주는 함수.
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(ENCRYPTION_KEY),
        iv,
    )
    const encrypted = cipher.update(text)

    return (
        iv.toString('hex') +
        ':' +
        Buffer.concat([encrypted, cipher.final()]).toString('hex')
    )
}


// 복호화 해주는 함수
function decrypt(text) {
    const textParts = text.split(':')
    const iv = Buffer.from(textParts.shift(), 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(ENCRYPTION_KEY),
        iv,
    )
    const decrypted = decipher.update(encryptedText)

    return Buffer.concat([decrypted, decipher.final()]).toString()
}

console.log(encrypt("dongjoo"));
console.log(decrypt('29f9c6a5f1583d5efce3996e0a53bf5d:c0ce241553e1a70165fdc4e41b6d94a1'))



// 임의의 데이터 배열 생성
const users = [
    {id: "handongjoo"},
    {id: "hanpotato"},
    {id: "podong"}
];


// 유저 정보 확인
app.get('/users', (req, res) => {
    const token = req.cookies.userToken;
    let userId;
    try{
        userId = decrypt(token)
    } catch {
        res.send("잘못 된 사용자")
    };
    const user = users.find(user => user.id === userId);
    console.log(user);
    // 위에서 찾은 user의 데이터 중 id의 값을 id라는 새로운 key의 value 값으로 전달한다.
    res.send({id: user.id});
});

// 로그인 하기
app.post('/login', (req, res) => {
    // body에 userId 값을 넣어 보내주겠다.
    const {userId} = req.body;
    // users를 돌면서 값을 찾는다(users 안에 있는 (1)user.id 값과 (2)내가 body 데이터로 전달한 userId 값이 동일한 데이터를 찾는다.)
    const user = users.find(user => user.id === userId);

    res.cookie("userToken", encrypt(user.id));
    // 쿠키 값을 key("ssid"):value(ssid)로 보내준다.  
    res.send(user);
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