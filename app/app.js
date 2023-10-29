const express = require('express');
const ServerHandeling = require('./serverHandler');
const ConfigLoader = require('./configLoader');
const fs = require("fs");

const child_process = require("child_process");

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

const launcherConfig = ConfigLoader.LoadConfigFromFile("launcher.config");

var currentStatus = ServerStates.off;
var serverProperties = null;

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
    console.log(data);

    if (data.includes("[Server thread/INFO]: Done"))
    {   
        UpdateServerStatus(ServerStates.on);
    }
};

io.on("connection", (socket) =>
{
    socket.emit("mc_status_chnage", currentStatus);

    socket.on("mc_console_in", (command) => {
        if (currentStatus == ServerStates.on)
        {
            io.emit("mc_console_out", ("[--:--:--] [Remote USER]: " + command + " \n"));
            mcInstance.SendCommand(command);
        }
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
    
    socket.on("mc_restart", () => {
        if (currentStatus == ServerStates.on)
        {
            io.emit("mc_console_out", ("[--:--:--] [Remote USER]: Restarting Server \n"));
            
            mcInstance.Restart();
            UpdateServerStatus(ServerStates.restarting);
        }
    });
    
    socket.on("mc_prop_set", (index, newValue) => {
        serverProperties[index] = {name: serverProperties[index].name, value: newValue};
    });
    
    socket.on("mc_prop_save", () => {
        SaveServerProperties();
    });
    
    socket.on("datapack_git_pull", () => {
        const command = 'git pull';
        const output = child_process.execSync(command, {cwd: "./mc/world/datapacks"});

        io.emit("mc_console_out", ("[--:--:--] [Git Helper]: " + output));
    });

});

// index page
app.get('/', function(req, res)
{
    res.render('pages/index');
});
app.post('/internalapi/get/mc_properties', function(req, res)
{
    res.json(serverProperties);
});

function LoadServerProperties()
{
    const file = fs.readFileSync("./mc/server.properties", "UTF-8");
    const lines = file.split('\n');
    
    serverProperties = new Array();
    for (let i = 0; i < lines.length; i++)
    {
        const line = lines[i];
        if ((line.charAt(0) == '#') || (line == ""))
        {
            continue;
        }
        const components = line.split('=', 2);
        const value = {name: components[0], value: components[1]};
        
        serverProperties.push(value);
    }
}
function SaveServerProperties()
{
    var str = "#Minecraft server properties\n";
    for (let i = 0; i < serverProperties.length; i++)
    {
        const prop = serverProperties[i];
        str += `${prop.name}=${prop.value}\n`;
    }

    fs.writeFileSync("./mc/server.properties", str);
}

server.listen(port, () => 
{
    LoadServerProperties();

    const commands = launcherConfig.command.split(' ');
    mcInstance.spawnCommand = commands[0];

    commands.shift();
    mcInstance.spawnArgs = commands;

    mcInstance.OnStop = (exit) => {
        UpdateServerStatus(ServerStates.off);
        io.emit("mc_console_out", (`\n[--:--:--] [Remote INFO]: server stopped with exit code ${exit}\n`));
    };
    
    // Start the MC server
    // UpdateServerStatus(ServerStates.loading);

    // console.log("starting MC Instance");
    // mcInstance.Start();

    console.log('Server is listening on port ' + port);
});
