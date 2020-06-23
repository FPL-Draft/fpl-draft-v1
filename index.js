const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const _ = require('lodash')
const controller = require('./controllers')
const { request } = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use('/semantic', express.static('semantic'))
app.use('/public', express.static('public'))
app.use('/', controller)

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))