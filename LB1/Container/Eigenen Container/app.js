const express = require('express');
let app = new express();
let port = 8080

app.get('/', function(req, res) {
    res.send("<h1>Mein Container</h1>");
});

app.listen(port, (err) => {
    if(err) {
        console.log(err)
    } else {
        console.log(`Server auf Port ${port} gestartet`)
    }
});