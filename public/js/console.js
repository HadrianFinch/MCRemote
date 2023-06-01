
socket.on("mc_console_out", (data) => {

    const container = f("#consoleContainer > div.textContainer");

    const lines = data.split("\n");

    for (let i = 0; i < lines.length; i+=2)
    {
        const line = lines[i];
        
        const timestamp =(line.substr(0, "[00:00:00]".length));
        const sender = line.substr("[00:00:00]".length + 1, line.substr("[00:00:00]".length + 1, line.length).indexOf(']') + 1);
        const remainder = line.substr(timestamp.length + sender.length + 2);
        
        const final = "<span class=\"timestamp\">" + timestamp + "</span><span class=\"sender\">" + sender + "</span>: " + remainder + "<br>";
        
        if (line != "")
        {
            container.innerHTML += final;    
        }
    }

    container.scrollTop = container.scrollHeight;
});

f("#consoleContainer > form").f.on("submit", (e) => {
    e.preventDefault();

    const input = f("#consoleContainer > form > input");

    socket.emit("mc_console_in", input.value);

    input.value = null;
});