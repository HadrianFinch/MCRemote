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

(() => {
    const allDragables = document.querySelectorAll(".dragable");
    for (let i = 0; i < allDragables.length; i++)
    {
        const element = allDragables[i];
        DragElement(element);
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
})();