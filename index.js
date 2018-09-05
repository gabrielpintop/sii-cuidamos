// Archivo que permite configurar ciertos elementos a partir del ambiente en el que se corre el proyecto
const env = require('./env');

// Se usa Express, una infraestructura web rápida, minimalista y flexible para Node.js
const express = require("express");

// Objeto para las rutas - API
const router = express.Router();

// Se usa Mongoose, una herramienta de modelado de objetos de MongoDB diseñada para trabajar en un ambiente asíncrono
const mongoose = require("mongoose");

// Se usa Body-Parser, se encarga de analizar los cuerpos (body) de las solicitudes en el middleware antes que nuestros manejadores lo hagan
const bodyParser = require("body-parser");

// Se usa CORS, que permite proveer un middleware Connect/Express que puede ser usado para habilitar CORS con varias opciones
const cors = require("cors");

// Se usa para poder implementar paths
const path = require('path');

// Puerto a usar. Se tiene en cuenta el caso de Heroku
const port = process.env.PORT || 8080;

// Se obtiene la configuración de la base de datos
const config = require("./configurations/database");

// Inicializacion de Express
const app = express();

// Ruta api
const rutaApi = '/vpp/api/';

// Se define la promesa global de Moongose
mongoose.Promise = global.Promise;

// Ruta de API de autenticacion 
const autenticacion = require('./routes/autenticacion')(router);

// Ruta de API de proyectos
const proyectos = require('./routes/proyectos')(router);

//Conexión a base de datos
mongoose.connect(
    config.uri, {
        useNewUrlParser: true
    },
    err => {
        // Verifica que haya sido posible conectarse a la base de datos. Lanza el mensaje correspondiente
        if (err) {
            console.log("Hubo un error al conectarse a la base de datos " + err);
        } else {
            console.log(
                'La conexión con la base de datos "' +
                config.db +
                '" se realizó satisfactoriamente'
            );
        }
    }
);

// Se habilita CORS en el puerto 4200. Donde corre el cliente.
app.use(
    cors({
        origin: "http://localhost:4200"
    })
);

// Configura las peticiones con cuerpo de tipo JSON
app.use(
    bodyParser.json({
        limit: "1mb"
    })
);

// Configura las peticiones con cuerpo de tipo url encoded
app.use(
    bodyParser.urlencoded({
        limit: "1mb",
        extended: true
    })
);

// Se define la ruta de archivos estáticos para el front
app.use(express.static(__dirname + "/public"));

// Mensaje para probar el servidor por ahora
app.get('/', (req, res) => {
    return res.send("¡Hola Nata!");
});

app.use(rutaApi, autenticacion); // Ruta de autenticacion de usuarios
app.use(rutaApi, proyectos); // Ruta de proyectos


//Se conecta al front
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/public/index.html"));
});

//Se define el puerto en el que trabaja el servidor
app.listen(port, () => {
    console.log(
        "El servidor de la aplicación está corriendo en el puerto " +
        port +
        " en modo " +
        process.env.NODE_ENV
    );
});