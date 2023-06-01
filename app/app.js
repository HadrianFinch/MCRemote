const express = require('express');
const ServerHandeling = require('./serverHandler');

const socketio = require("socket.io");

const port = 12050;

const app = express();

const server = require('http').Server(app);
const io = socketio(server);

const mcInstance = ServerHandeling.CreateProcessHandler();

const ServerStates = {
    loading: 1,
    on: 2,
    shutingDown: 3,
    off: 4,
    restarting: 5
}

var currentStatus = ServerStates.off;

function UpdateServerStatus(status)
{
    currentStatus = status;
    io.emit("mc_status_chnage", status);
}

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/../public'));

mcInstance.OnDataRecive = (data) => {
    io.emit("mc_console_out", data);

    if (data.includes("[Server thread/INFO]: Done"))
    {   
        UpdateServerStatus(ServerStates.on);
    }
};

io.on("connection", (socket) =>
{
    socket.emit("mc_status_chnage", currentStatus);

    socket.on("mc_console_in", (command) => {
        io.emit("mc_console_out", ("[--:--:--] [Remote USER]: " + command + " \n"));
        mcInstance.SendCommand(command);
    });

    socket.on("mc_start", () => {

        if (currentStatus == ServerStates.off)
        {
            io.emit("mc_console_out", ("[--:--:--] [Remote USER]: Starting Server \n"));
            
            mcInstance.Start();
            UpdateServerStatus(ServerStates.loading);
        }
    });

    socket.on("mc_stop", () => {

        if (currentStatus == ServerStates.on)
        {
            io.emit("mc_console_out", ("[--:--:--] [Remote USER]: Stopping Server \n"));
            
            mcInstance.Stop();
            UpdateServerStatus(ServerStates.shutingDown);
        }
    });
    
    socket.on("mc_restart", () => {
        if (currentStatus == ServerStates.on)
        {
            io.emit("mc_console_out", ("[--:--:--] [Remote USER]: Restarting Server \n"));
            
            mcInstance.Restart();
            UpdateServerStatus(ServerStates.restarting);
        }
    });

});

// index page
app.get('/', function(req, res)
{
    res.render('pages/index');
});

server.listen(port, () => 
{
    // console.log("server is ready");

    mcInstance.OnStop = (exit) => {
        UpdateServerStatus(ServerStates.off);
        io.emit("mc_console_out", (`\n[--:--:--] [Remote INFO]: server stopped with exit code ${exit}\n`));
    };
    

    // Start the MC server
    UpdateServerStatus(ServerStates.loading);

    console.log("starting MC Instance");
    mcInstance.Start();
});
console.log('Server is listening on port ' + port);
