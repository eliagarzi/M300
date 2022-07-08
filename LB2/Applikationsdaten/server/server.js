const express = require("express");
//Express APP wird an HTTP Server übergeben
const server = new express();
require('dotenv').config();
const port = process.env.port || process.env.API_PORT

const http = require("http").Server(server);

const redis = require("redis");
const crypto = require("crypto");

server.set("view engine", "ejs")

let messageValidationFailed = "Validation failed";
let messageRedisServerFailed = "Redis Server failed";

const io = require("socket.io")(process.env.SOCKETIO_SERVER_PORT, {
    cors: {
        origin: [process.env.CORS_SOURCE_PROTOCOL+"://"+process.env.CORS_SOURCE_DOMAIN+":"+process.env.CORS_SOURCE_PORT], //Darf nur von FQDN:Port möglich sein
    } 
})

//############################
//Authentifizierung fehlt
//############################
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_IP}:${process.env.REDIS_PORT}`
})

redisClient.connect();

redisClient.on("error", (error) => {
    console.log(error)
})

async function getArduinoData() {
    try {
        if(await redisClient.exists("uuid-store") === 1) {
                let bodyToSend = {}
                let allUUIDs = await redisClient.lRange("uuid-store", 0, -1)

                for(let elementIndex in allUUIDs) {
                    let currentUUID = allUUIDs[elementIndex];
                    let currentArduinoInfo = JSON.parse(await redisClient.get(`${currentUUID}-info`));
                    let currentArduinoData = JSON.parse(await redisClient.get(`${currentUUID}-data`));
    
                    let currentObj = {
                        uuid: currentUUID,
                        info: currentArduinoInfo,
                        data: currentArduinoData
                    }
    
                    bodyToSend[elementIndex] = currentObj;
                }
                
                return bodyToSend;
        } else {
            return null;
        }
    } catch (error) {
        return error;
    }
}

io.on("connection", socket => {
    //##authentication

    //Push Arduino data
    getArduinoData()
    .then((data) => {
        socket.emit("arduino-init-data", data)
    })
    .catch((error) => {
        socket.emit("arduino-init-data", {error: error})
    })
})

//Body-Parser, damit der Inhalt vom Body als JSON lesbar wird
server.use(express.json());

//Middlewarefunktion zum überprüfen, ob der Client authentifiziert ist
function checkAuth(req, res, next) {
    if (true) {
        //Überprüfen des JWT Token
        next()
    } else {
        res.sendStatus(403)
    }
}

//Middlewarefunktion zum überprüfen, ob der Body nicht leer ist
function checkBody(req, res, next) {
    if (req.body != undefined) {
        next()
    } else {
        res.sendStatus(404)
    }
}

//Überprüft, ob die benötigten Angaben im Querystring mitgegeben werden, die für die weiteren Middlewarefunktionen benötigt werden
function checkQuery(req, res, next) {
    if (req.query != undefined) {
        next()
    } else {
        res.sendStatus(404)
    }
}

//##############################
//Routes für arduino
//##############################

//Route um einen Arduino per HTTP zu löschen
//Format: "http://fqdn/api/arduino/delete/?id=uuid"
server.post("/api/arduino/delete", checkQuery, async (req, res) => {
    const currentUUID = req.query.uuid;
    if(currentUUID != undefined) {
        if(await redisClient.exists(`${currentUUID}-info`)) {
            try {
                await redisClient.lRem("uuid-store", 1, currentUUID)

                //Löschen der Arduino Infos und Daten UUID 
                await redisClient.del(`${currentUUID}-info`)
                await redisClient.del(`${currentUUID}-data`)
                
                //###############################
                //Delete JWT Token
                //###############################


                io.sockets.emit("arduino-delete-event", {uuid: currentUUID});

                res.sendStatus(200)
            } catch (error) {
                //Log
                console.log(error)
                res.json({message: "Redis Server failed"})
            }       
        } else {
            res.sendStatus(404)
        }
    } else {
        res.sendStatus(404);
    }
});

//Route um einen neuen arduino zu erfassen
//Format: "http://fqdn/api/arduino/create"
/*
{
    name: "arduino123",
    location: "Zürich",
    lastseen: "00:00" //Eventuell als Time Objekt speichern
}
*/

server.post("/api/arduino/create/", async (req, res) => {

    //Überprüfe, ob die benötigten Body Elemente vorhanden sind 
    if (req.body.name != undefined && req.body.location != undefined && req.body.lastseen != undefined) {
        const newUUID = crypto.randomUUID();
        try {

            //In Redis speichern

            await redisClient.set(`${newUUID}-info`, JSON.stringify(req.body));

            await redisClient.set(`${newUUID}-data`, JSON.stringify({
                "temperature":"-",
                "humidty":"-",
                "pressure":"-",
                "hue":"-"
            }));

            await redisClient.lPush("uuid-store", newUUID)

            let newBody =  {
                uuid: newUUID,
                info: {
                    "name": req.body.name,
                    "location": req.body.location,
                    "lastseen": req.body.lastseen,  
                },
                data: {
                    "temperature":"-",
                    "humidty":"-",
                    "pressure":"-",
                    "hue":"-"
                }
            }

            //Löst einen Push Event aus, damit die Daten im Frontend geupdatet werden
            //Sendet die Daten mit UUID und neuen Daten an das Frontend
            io.sockets.emit("arduino-create-event", newBody);

            res.json({uuid: newUUID, apikey: "key"})
        } catch (error) {
            //Login Menu
            console.log(error)
            res.json({error: messageRedisServerFailed})
        }
    } else {
        //Nachricht soll im Frontend dargestellt werden
        res.json({error: messageValidationFailed});
    }

});

server.post("/api/arduino/change/", checkQuery, checkBody, async (req, res) => {

    if(req.query.uuid != undefined) {
        const currentUUID = req.query.uuid;
        if(req.body.name != undefined && req.body.location != undefined) {
            try {
               
                if(await redisClient.exists(`${currentUUID}-info`)) {
                    
                    let arduinoToChange = JSON.parse(await redisClient.get(`${currentUUID}-info`));
    
                    arduinoToChange.location = req.body.location;
                    arduinoToChange.name = req.body.name;
    
                    //In Redis speichern
                    await redisClient.set(`${currentUUID}-info`, JSON.stringify(arduinoToChange))
    
                    //Neuer Body, damit durch die UUID das Arduino bestimmt werden kann, welches neue Daten hat
                    let newBody =  {
                        uuid: req.query.uuid,
                        data: req.body
                    }
                    
                    //Löst einen Push Event aus, damit die Daten im Frontend geupdatet werden
                    //Sendet die Daten mit UUID und neuen Daten an das Frontend
                    io.sockets.emit("arduino-update-event", newBody);
                    res.json({message: "Arduino Properties Changed"})
                } else {
                    res.sendStatus(404)
                }
            } catch (error) {
                console.log(error)
                res.json({error: messageRedisServerFailed})
            }
        } else {
            res.json({error: messageValidationFailed})
        }
    } else {
        res.json({error: messageValidationFailed})
    }
});

//Route um die Daten zu bestimmten Arduino abzurufen 
//Format: "http://fqdn/api/arduino/?id=uuid"
server.get("/api/arduino/", async (req, res) => {
    const currentUUID = req.query.uuid;
    if(currentUUID!= undefined) {  
        //aus Redis abrufen
        try {
            //Überorüfen, ob die UUID in Redis gespeichert ist
            if(await redisClient.exists(currentUUID)) {
                const arduinoToGet = JSON.parse(await redisClient.get(`${currentUUID}-info`))
                res.json(arduinoToGet)
            } else {
                res.sendStatus(404)
            }
        } catch (error) {
            console.log(error)
            res.sendStatus(504)
        }
    } else {
        res.sendStatus(404)
    }    
})

//Format "http://fqdn/api/data/uuid?=uuid"
server.post("/api/data/", checkQuery, async (req, res) => {
    //checkAuth
    console.log(req.body)
    const currentUUID = req.query.uuid;
    const arduinoData = req.body;
    if(currentUUID != undefined) {
        try {
            //console.log(await redisClient.lRange("uuid-store", 0, -1))
            if (await redisClient.exists(`${currentUUID}-info`)) {
                //Speichert Daten mit dem Key Current UUID in einer Liste

                let date = new Date();
                let currentTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${date.getUTCDate()}.${date.getMonth()+1}.${date.getFullYear()}`
                
                let arduinoInfo = JSON.parse(await redisClient.get(`${currentUUID}-info`))
                arduinoInfo.lastseen = currentTime;
                await redisClient.set(`${currentUUID}-info`, JSON.stringify(arduinoInfo))
                /*
                let newBodyForRedis = {
                    time: "18:00",
                    data: req.body
                }
                */
                await redisClient.del(`${currentUUID}-data`)
                await redisClient.set(`${currentUUID}-data`, JSON.stringify(req.body))

                //Neuer Body, damit durch die UUID das Arduino bestimmt werden kann, welches neue Daten hat
                let newBody =  {
                    uuid: req.query.uuid,
                    lastseen: currentTime,
                    data: {
                        "temperature": req.body.temperature,
                        "humidty": req.body.humidty,
                        "pressure": req.body.pressure,
                        "hue": req.body.hue
                    }
                }
                
                //Löst einen Push Event aus, damit die Daten im Frontend geupdatet werden
                //Sendet die Daten mit UUID und neuen Daten an das Frontend
                io.sockets.emit("data-update-event", newBody);
                
                res.sendStatus(201)
            } else {
                res.sendStatus(404)
            }
        } catch (error) {
            console.log(error)
            res.sendStatus(504)
        }
    } else {
        res.sendStatus(404)
    }
})

server.get("/api/data/", async(req, res) => {
    const currentUUID = req.query.uuid;
    if(currentUUID != undefined) {
        try {
            if (await redisClient.exists(`${currentUUID}-data`)) {

                const arduinoDataToGet = JSON.parse(await redisClient.get(`${currentUUID}-data`));

                res.json(arduinoDataToGet);
            } else {
                res.sendStatus(404);
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(504);
        }
    } else {
        res.sendStatus(404)
    }
})

server.post("/login/", async (req, res) => {
    if(req.body != undefined) {
        const email = req.body.email;
        const password = req.body.password;

        try {
            if(await redisClient.exists(email) == 1) {
                const currentUser = JSON.stringify(await redisClient.get(email));

                if(currentUser.password === hash) {

                    //Authentisiert -> Authentifizierung

                    //JWT Token

                } else {
                    res.json({message: "E-Mail oder Passwort falsch"})
                }
            } else {
                res.json({message: "E-Mail oder Passwort falsch"})
            }
        } catch {
            res.send(503)
        }
    } else {
            res.sendStatus(404);
    }
})

server.post("/login/reset", async (req, res) => {
    let currentEmail = req.body.email;
    if(currentEmail != undefined) {
        let token = crypto.randomBytes(35).toString('hex')
        try {
            await redisClient.set(token, req.query.email)
            console.log(`http://127.0.0.1:3300/login/reset?token=${token}`)
            //Send Mail
            res.sendStatus(202)
        } catch {
            res.sendStatus(504)
        }
    } else {
        res.sendStatus(404)
    }
})


//Überprüft, ob der Link aus der E-Mail noch gültig ist
server.get("/login/reset", async (req, res) => {
    if(req.query.token != undefined) {
        const token = req.query.token;
        try {
            console.log(await redisClient.get(token))
            if(redisClient.exists(token) == 1) {
                res.set("<h1>Reset</h1>")
            } else {
                res.send("<h1>Link Expired</h1> <p>Request a new one</p>")
            }
        } catch {
            res.sendStatus(503)
        }
    } else {
        res.sendStatus(404)
    }
});

http.listen(process.env.API_PORT, (error) => {
    if(error) {
        console.error(`Fehler beim Starten des Servers ------ ${error}`)
    } else {
        console.log(`Server auf Port ${process.env.API_PORT} gestartet`)
    }
})