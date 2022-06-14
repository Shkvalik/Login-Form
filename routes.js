const express = require("express");
const bcrypt = require("bcryptjs")
const db = require("./db")
require("dotenv").config(); // Give us the access to add new variable in env system

const app = express();


// Set for rendering ejs templates
app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(express.static(__dirname + '/static'));

app.get('/', (req, res) => {
    res.redirect('/login')
})

// Register Get Form
app.get('/register', async (req, res) => {
    let dictCountries = await db.getCountries()
    res.render('register.ejs', {country: dictCountries})
})

// Login Get Form
app.get('/login', (req, res) => {
    res.render('login.ejs')
})

app.get('/login/:login', async (req, res) => {
    const login = req.params.login
    const userData = await db.getUserData(login.split('$')[0])
    res.status(202).render('user.ejs', {user: userData})
})

// Register Post Form
app.post('/register', async (req, res) => {
    try {
        //checkData(what, where)
        if (await db.checkUniqueData(req.body.email, 'email') && await db.checkUniqueData(req.body.login, 'login')) {
            const hashPassword = await bcrypt.hash(req.body.password, 10)
            await db.createUser(
                req.body.email,
                req.body.login,
                req.body.real_name,
                hashPassword,
                req.body.birth_date.toString(),
                parseInt(req.body.country),
                Math.floor(Date.now() / 1000)
            )
            res.redirect(`login/${req.body.login + '$' + req.body.password}`)
        } else {
            res.status(406).send('User is already use')
        }

    } catch {
        res.status(400).send('Error')
    }
})

// Login Post Form
app.post('/login', async (req, res) => {
    const result = await db.checkPutData(req.body.login, req.body.password)
    if (result === 'uncorrected password') {
        res.status(401).send('Invalid password')
    } else if (result === 'uncorrected Login or Email') {
        res.status(401).send('Invalid Login or Email')
    } else {
        res.redirect(`login/${req.body.login + '$' + req.body.password}`)
    }
})

app.listen(process.env.HTTPPORT || '8000')
console.log(`Link ---> http://localhost:${process.env.HTTPPORT}`) // for dev