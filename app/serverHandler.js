
const spawn = require('child_process').spawn;

(function() {
    
    function CreateProcessHandler_local() 
    {
        const ph = {
            internalProcess: null,
            internal_restarting: false,
            spawnCommand: "",
            spawnArgs: [],
            SendCommand: (command) => {
                if (ph.internalProcess != null)
                {
                    ph.internalProcess.stdin.write(command + "\n");
                }
            },
            OnDataRecive: (data) => {},
            OnStop: (code) => {},
            Restart: () => {
                ph.internal_restarting = true;
                ph.Stop();
            },
            Stop: () => {
                ph.SendCommand("stop");
            },
            Start: () => {
                ph.internalProcess = spawn(ph.spawnCommand, ph.spawnArgs, {cwd: './mc/'});

                ph.internalProcess.stdout.on('data', (data) =>
                {
                    let string = new TextDecoder().decode(data);
                    ph.OnDataRecive(string);
                });

                
                ph.internalProcess.on('close', (code) =>
                {
                    if (ph.internal_restarting)
                    {
                        ph.internal_restarting = false;
                        ph.Start();
                    }
                    else
                    {
                        ph.OnStop(code);
                    }
                });
            }
        };

        return ph;
    }

    module.exports.CreateProcessHandler = function()
    {
        return CreateProcessHandler_local();
    }

}());