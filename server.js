const express = require('express');
const fs = require('fs');
const sessions = require('express-session');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');

const app = express();
app.set('view engine', 'ejs');
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    resave: false
}));
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'));
app.use(cookieParser())
app.use(flash())

var session;

app.get('/', (req,res) => {
    session=req.session;
    if(session.userid){
        res.render('index.ejs')
    }else{
        res.redirect('/login')
    }
})

app.get('/login',(req,res) => {
    res.render('login.ejs')
})

app.post('/login', (req,res) => {
    if(validateUser(req.body.username, req.body.password)){
        session=req.session;
        session.userid=req.body.username;
        res.redirect('/');
    }
    else{
        req.flash('error','*incorrect username or password')
        res.render('login.ejs');
    }
})

function validateUser(user, pass) {
    const array = getData();
    if(array.find(x => x.username === user && x.password === pass)){
        return true
    } else {
        return false
    }
}

app.get('/register',(req,res) => {
    res.render('register.ejs')
})

app.post('/register', (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    const array = getData();
    if(findIfExists(username,array)){
        req.flash('error','*username already exists')
        res.render('register.ejs');
    } else{
        addUser(username,password,array);
        res.redirect('/login');
    }
})

function getData() {
    let val;
    try {
        const test = fs.readFileSync('./public/data.json');
        val = JSON.parse(test);
    } catch (err) {
        console.log(err);
    }
    return val;
}

function addUser(username, password,array) {
    array.push({username: username,password: password});
    fs.writeFile('./public/data.json', JSON.stringify(array,null,2), err => {
        if(err) {
            console.log(err);
        } else {
            console.log('Written Sucessfully');
        }
    })
}

function findIfExists(user,array) {
    return array.find(x => x.username === user)
}

app.get('/history', (req,res) => {
    res.render('history.ejs');
})

app.get('/logout', (req,res) => {
    req.session.destroy();
    res.redirect('/login');
})

app.listen(3000);