const mysql = require('mysql');

const db = mysql.createPool({
    host:'43.143.181.238',
    user:'root',
    password:'root',
    database:'my_db_01'
})

module.exports = db