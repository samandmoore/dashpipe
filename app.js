var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    exphbs  = require('express3-handlebars')
;

server.listen(1337);

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/client.html');
});

app.get('/client', function (req, res) {
    res.sendfile(__dirname + '/client.html');
});

app.get('/admin', function (req, res) {
    res.sendfile(__dirname + '/admin.html');
});

app.get('/dash/:id', function (req, res) {
    var dashId = req.params.id;

    res.render('dash', { dashId: dashId });
});

var dashClientRefs = {};

var dashClients = io
    .of('/clientz')
    .on('connection', function (socket) {
        dashClientRefs[socket.id] = socket;

        socket.emit('changePage', { url: '/dash/232' });

        io.of('/adminz').emit('clientConnected', socket.id);

        socket.on('disconnect', function () {
            delete dashClientRefs[socket.id];
            io.of('/adminz').emit('clientDisconnected', socket.id);
        })
    });

var dashAdmins = io
    .of('/adminz')
    .on('connection', function (socket) {
        socket.on('admin:changePage', function (data) {
            var dest = null;

            if (data.targetDash) {
                dest = dashClientRefs[data.targetDash];
            } else {
                dest = io.of('/clientz');
            }

            dest.emit('changePage', data);
        });
    });
