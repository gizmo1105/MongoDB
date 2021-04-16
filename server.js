
// innleiða viðbæturnar 
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
// hef ekki hugmynd um hvað þetta er... 
const bodyParser = require('body-parser');
// ekki þetta heldur... 
app.use(bodyParser.urlencoded({extended:false}));

//app.use(express.static('./shittid'))
// rúturnar 
// login síðan þar sem boðslykill er innsleginn. 
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/login.html');
});
// ef rétt lykilorð er valið 
app.post('/', (req, res) => {
	var password = req.body.password;
	console.log('innslegið lykilorð var: '+password);
	res.redirect('/'+password);
});

// Ef rétt lykilorð er valið færist notanndi hingað og fær þar með aðgang að spjallsvæðinu. 
app.get('/1234', (req, res) => {
	res.sendFile(__dirname + '/server.html');
});
// ef viðkomandi slær inn rangt lykilorð er hann færður hingað.
// einhverra hluta vegna fæ ég ekki css til að virka eins og skyldi. fyrir boo.html. 
app.get('/*', (req, res) => {
	res.sendFile(__dirname + '/denied.html');
});

// variables/breytur. og listar til að geyma notendur. 
var hours = 60;
var minutes = 60;
var total = 0;
var teljari = 0;
var users = [];
var innskr_not = [];

// function til að sækja tíma. gerði þetta með hjálp frá Patrek. ákvað að halda mig bara við þetta. 
var requestTime = (req, res, next) => {
	req.requestTime = new Date();
	// köllum á næsta milliforriti í röðinni 	
	next();
};
//	tímastillingin. 
function stillaTima() {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
   

    if (minutes < 10) {
        minutes.toString();
        minutes = '0' + minutes;
    }
    let seconds = date.getSeconds();
    if (seconds < 10) {
        seconds.toString();
        seconds = '0' + seconds;
    }
    return '(' + hours + ':' + minutes + ':' + seconds + ')';
}
app.use(requestTime);


var requestTimeSocket = (socket, next) => {
	socket.request.requestTime = new Date();
	// köllum á næsta milliforriti í röðinni 
	next();
};
io.use(requestTimeSocket);

// þetta heldur utan um notenndurna 
io.on('connection', (socket) => {
	socket.on("nyr_notandi", (nickName) => {
		users[socket.id] = nickName;
		// ákvað að hafa þetta tiltölulega einfalt og hafa það ekki að ef notendanafn væri skráð þá mætti samt velja
		// Ég var alveg viss um að það væri hægt að láta generate-a notendanöfn með for lykkju en ég treysti mér ekki í það.  
		given_id = ['Stormtrooper#1','Stormtrooper#2','Stormtrooper#3','Stormtrooper#4',]
		if (!nickName) {
			users[socket.id] = given_id[Math.floor(Math.random()*4)];
			// bætum notanda í array. og látum vita í chat message að nýr notandi haf bæst í spjallið
				innskr_not.push(users[socket.id]);
					io.emit('chat message', time + ' ' + users[socket.id] + ' bættist í spjallið');
		} else {
			socket.users = nickName
			// ef notendanafn er valið bætum við því inn í array og látum aðra notendur vita
				io.emit('chat message', time + ' ' + users[socket.id] + ' bættist í spjallið');
					innskr_not.push(socket.users);
		}
	// loggum þetta bara upp á flippið. 
		console.log(users[socket.id]+ 'is logged in');

		
	// emittum lista yfir innskráða notendur yfir á client site. 
io.emit('uppf_not',' | '+ innskr_not +' | ');


	});

	console.log('a user connected');
	teljari++;
		let time = stillaTima();
		// bara til gamans höldum við tölu yfir innskráða notendur. 
		io.emit('chat message', time + ' ' + 'Það eru '+  teljari + ' notendur innskráðir.');
	
// þegar notandi yfirgefur spjallið loggum við talninguna og spliceum notandanum úr array
//til að halda yfirliti yfir innskráða notendur réttu. 
// látum síðan vita í chat message að viðkomandi notandi hafi yfirgefið spjallið. 
	socket.on('disconnect', () => {
		console.log('user disconnected'+ teljari);
		var notnr = innskr_not.indexOf(socket.users);
		innskr_not.splice(notnr, 1);
			io.emit('uppf_not',' / '+ innskr_not +' / ');
			teljari--;
				io.emit('chat message', time + ' ' + users[socket.id] +' yfirgaf spjallið');
		
	});

// þessi hluti sér um chat messages frá input reitnum á client site. 
	socket.on('chat message', (msg) => {
		console.log('Message arrived at: ' +socket.request.requestTime);
		let time = stillaTima();
		io.emit('chat message', time + ' ' + users[socket.id] +': ' + msg);
	});
});

http.listen(3000, () => {
	console.log('listening on *:3000');
});
//