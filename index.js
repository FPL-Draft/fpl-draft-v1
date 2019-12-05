const express = require('express')
const _ = require('lodash')
const controller = require('./controllers')
const app = express()
const PORT = process.env.PORT || 3000

app.use('/semantic', express.static('semantic'))
app.use('/', controller)

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))