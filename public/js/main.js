const socket = io();

const ServerStates = {
    loading: 1,
    on: 2,
    shutingDown: 3,
    off: 4,
    restarting: 5
}

function DragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (elmnt.querySelector("div.dragHeadder")) {
        // if present, the header is where you move the DIV from:
        elmnt.querySelector("div.dragHeadder").addEventListener("mousedown", dragMouseDown);
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.f.on("mousedown", dragMouseDown);
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.addEventListener("mouseup", closeDragElement);
        // call a function whenever the cursor moves:
        document.addEventListener("mousemove", elementDrag);
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.removeEventListener("mouseup", closeDragElement);
        document.removeEventListener("mousemove", elementDrag);
    }
}

(async () => {
    const allDragables = document.querySelectorAll(".dragable");
    for (let i = 0; i < allDragables.length; i++)
    {
        const element = allDragables[i];
        DragElement(element);
    }
    const commandButtons = f.FindAll(".commandButton");
    for (let i = 0; i < commandButtons.length; i++)
    {
        const button = commandButtons[i];
        const command = button.getAttribute("data-commandText");
        
        button.f.on("click", () => {
            socket.emit("mc_console_in", command);
        });
    }

    const statusDiv = f("#statusbox")
    socket.on("mc_status_chnage", (state) => {
        statusDiv.classList.remove(...statusDiv.classList);
        statusDiv.classList.add("s" + state);
    });


    f("#server_turnOn").f.on("click", () => {
        socket.emit("mc_start");
    });
    f("#server_turnOff").f.on("click", () => {
        socket.emit("mc_stop");
    });

    f("#server_restart").f.on("click", () => {
        socket.emit("mc_restart");
    });


    var response = await fetch("/internalapi/get/mc_properties", 
    {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: "",
    });
    const properties = await response.json();
    // const properties = JSON.parse(propertiesStr);


    const propertiesContainer = f("#serverPropertiesContainer");
    for (let i = 0; i < properties.length; i++)
    {
        const prop = properties[i];
        const row = propertiesContainer.f.NewChild("div");

        if ((i % 2) == 1)
        {
            row.classList.add("odd");
        }

        const name = row.f.NewChild("span");
        name.innerHTML = prop.name;

        const value = row.f.NewChild("input");
        value.type = "text";
        value.value = prop.value;

        value.f.on("input", () => {
            socket.emit("mc_prop_set", i, value.value);
        });
    }

    f("#saveprops").f.on("click", () => {
        socket.emit("mc_prop_save");
    });

    f("#datapacks_upgrade").f.on("click", () => {
        socket.emit("datapack_git_pull");
    });


})();