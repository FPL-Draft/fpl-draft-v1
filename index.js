const express = require('express')
const exphbs = require('express-handlebars')
const _ = require('lodash')
const controller = require('./controllers')
const app = express()
const PORT = process.env.PORT || 3000

// Register Handlebars view engine
app.engine('.hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }));
// Use Handlebars view engine
app.set('view engine', '.hbs');

app.use('/semantic', express.static('semantic'))
app.use('/', controller)

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))