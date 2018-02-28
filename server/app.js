var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
const port=4100;
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const dbMongo='mongodb://localhost:27017/bdStory';
const mongoose = require('mongoose');
const Word=require('./Model/word');
var storyParts = [];


mongoose.connect(dbMongo, (err, res) => {
    if (err) {
        return console.log(`Error al conectarse a la base de datos: ${err}`);
    } else {
        console.log("conecion establecida");
    }
    app.listen(port, () => {
        console.log(`API corriendo por el puerto: ${port}`);
    })
});

// ingresar palabra a la bd
app.post('/api/word',(req,res)=>{
	let word = new Word();
	word.word=req.body.word;
	word.save((err, wordStored) => {
        if (err) {
            res.status(500) // los 500 son errores del Servidor
            res.send({ message: `Erro al salvar en la BD ${err}` });
        } else {
            res.status(200);
            res.send({ word: wordStored });
        }
    });
});

app.get('/api/words', (req, res) => {
    // con el {} trae todas las palabras
    Word.find({}, (err, words) => {
        if (err) return res.status(500).send({ message: `Error al buscar ${err}` });
        if (!words) return res.status(404).send({ message: `No hay palabras` });
        res.status(200).send({ words: words });
    });
});

io.on('connection', function(socket){
	console.log("se conecto alguien con socket");
	socket.emit('initial', storyParts);

	socket.on('new-part', function(data){
		storyParts.push(data);
		io.sockets.emit('story-new-part', data);
	})
});



