const express = require('express')
const mysql = require('mysql')
const app = express()
const port = process.env.PORT || 3000;
const test = process.env.test;

let attempts = 0;
const seconds = 1000;

function connect() {
    attempts++;
  
    console.log('password', process.env.DATABASE_PASSWORD);
    console.log('host', process.env.DATABASE_HOST);
    console.log(`attempting to connect to DB time: ${attempts}`);
  
    const conn = mysql.createConnection({
        host: process.env.DATABASE_HOST,  
        user: "root",  
        password: process.env.DATABASE_PASSWORD,  
        database: 'Products'
    });
    conn.connect(function (err) {
        if (err) {  
            console.log("Error", err);  
            setTimeout(connect, 30 * seconds);  
        } else {  
            console.log('CONNECTED!');  
        }
    });
 
    conn.on('error', function(err) {  
        if(err) {  
            console.log('shit happened :)');  
            connect()  
        }   
    });
 
}
connect();

app.get('/', (req, res) => res.send('Hello product service'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))