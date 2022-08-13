

const CardContent = ' <div class="cardHeader"> \
<ion-icon class="closeBtn md hydrated" name="close-circle-outline" onclick="closeViveCard()" role="img" \
  aria-label="close circle outline"></ion-icon> \
<ion-icon class="closeBtn" onclick="viveDataRefresh()" name="refresh-circle-outline"></ion-icon> \
<input id="cardSize" type="number" class="md closeBtn" onchange="resazeCard()" style="width:70px; color:black;font-size: 14px; display:none" /> \
</div> \
<div class="CardBody"> \
<div class="tab"> \
  <button class="viveTablinks active" onclick="openTab(event, \'configs\')">configs</button> \
  <button class="viveTablinks" onclick="openTab(event, \'bashCommandTab\')">bash Command</button> \
</div> \
<!-- Tab content --> \
<div id="configs" class="viveTab" style="display: flex;">\
  <div class="row setectorArea">\
    <select name="cars" id="selectConfigFile" class="selector" onchange="updateConfigContent()">\
      <option value="ball_scanning.yaml">ball_scanning</option> \
      <option value="download_dataset_config.yaml">download_dataset_config</option>\
      <option value="follow_line.yaml">follow_line</option>\
      <option value="general.yaml">general</option>\
      <option value="robot.yaml">robot</option>\
      <option value="serial.yaml">serial</option>\
      <option value="server.yaml">server</option>\
      <option value="sim.yaml">sim</option>\
      <option value="tennis.yaml">tennis</option>\
      <option value="vision.yaml">vision</option>\
    </select>\
    <button class="viveBtn" onclick="resetFileContentChange()">Reset</button>\
  </div>\
  <textarea id="configContent" class="textContentArea"></textarea>\
  <button class="viveBtn" style="margin: 5px; width: 80%;" onclick="saveFileContentChange()">Save</button>\
</div>\
<div id="bashCommandTab" class="viveTab">\
  <textarea id="bashCommandView" class="bashView" disabled></textarea>\
  <div class="commandArea">\
    <textarea id="bashCommand" class="commandView" placeholder="write command here ..." ></textarea>\
    <button class="viveBtn" style="margin-left:5px ;" onclick="sendBashCommand()">Send</button>\
  </div>\
</div>\
</div>';


let socket = {
    isConnect: false,
    connection: null,
}

let thisState = {
    mirror:null,
}


function viveCard() {
    createSocket();
    let grid = document.getElementsByClassName('grid')[0];
    let card = document.createElement('div');
    card.classList.add("mainCard");
    card.classList.add("card");
    card.id = "ViveCard";
    card.innerHTML = CardContent;
    grid.appendChild(card);

    let sizeInput = document.getElementById('cardSize');
    sizeInput.value = card.offsetWidth;
    sizeInput.addEventListener('input', function () {
        document.getElementsByClassName('mainCard')[0].style.width = this.value + "px";
        thisState.mirror.setSize(this.value- 80, 400);
    })
}

function closeViveCard() {
    socket.connection.disconnect();
    let viveCard = document.getElementById("ViveCard");
    viveCard.remove();
}


function viveDataRefresh() {
    if (!socket.isConnect) {
        createSocket();
    }

}

function createSocket() {
    socket.connection = io("http://168.119.120.86:8980");
    socket.connection.on('message', (resp) => {
        console.log(resp);
    });
    socket.connection.on('connect', () => {
        socket.isConnect = true;
        console.log('connected to socket successfully');
        thisState.mirror = CodeMirror.fromTextArea(document.getElementById('configContent'), {
            mode: "yaml",
            lineNumbers: true,
        });
        thisState.mirror.setSize(730,400);
        thisState.mirror.save();
    });

    socket.connection.on('disconnect', () => {
        socket.isConnect = false;
    })

    socket.connection.on('fromRobot', (message) => {
        // mojtaba &#13;&#10;shojaei ###### new line
        switch (message.type) {
            case "FileContent":
                let temp = message.content.join().replace(/,/g, '');
                // let ConfigContentArea = document.getElementById('configContent');
                // ConfigContentArea.value = temp;
                // ConfigContentArea.display = "none";
                thisState.mirror.getDoc().setValue(temp);
                console.log('recaved content: ', temp);
                break;
            case "bashContent":
                let bashView = document.getElementById('bashCommandView');
                bashView.value = message.content;
                break;
            default:
                break;
        }
    });
};


function sendTestMessage() {
    socket.connection.emit('toRobot', 'this is test message sent form Browser');
}

function resetFileContentChange() {
    let selector = document.getElementById('selectConfigFile');
    let file = selector.value;
    socket.connection.emit('toRobot', { type: "resetConfig", to: "", content: file });
}


function updateConfigContent() {
    let selector = document.getElementById('selectConfigFile')
    let file = selector.value;
    socket.connection.emit('toRobot', { type: "getFileContent", to: "", content: file })
}

function saveFileContentChange() {
    let fileContent = thisState.mirror.getValue();  //document.getElementById('configContent').value;
    let fileName = document.getElementById('selectConfigFile').value;
    console.log('save content: ', fileContent);
    socket.connection.emit('toRobot', { type: "saveFileContent", to: "", fileName: fileName, content: fileContent });

}



function openTab(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("viveTab");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("viveTablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "flex";
    evt.currentTarget.className += " active";
}


function sendBashCommand() {
    let command = document.getElementById("bashCommand").value;
    socket.connection.emit('toRobot', { type: 'bashCommand', to: '', content: command });
}

function resizeCard() {
    document.getElementsByClassName('mainCard')[0].style.width = document.getElementById('cardSize').value + "px";
    thisState.mirror.setSize(document.getElementById('cardSize').value - 80 , 400);
}


function loadAtComplate() {
    document.getElementById('timeSelect').addEventListener('click', function (e) {
        var x = e.pageX - this.offsetLeft;
        var width = document.getElementById('timeSelect').offsetWidth;
        var xconvert = x / width;
        var finalx = (xconvert).toFixed(2);
        document.getElementById('timeSelect').value = finalx * 100;
        timeChanged();
    });
};


function goNextTimeStep() {
    let t = document.getElementById('timeSelect');
    var newVal = t.value + 5;
    if (newVal < 100) {
        t.value = newVal;
        timeChanged();
    }
}

function goPerTimeStep() {
    let t = document.getElementById('timeSelect');
    var newVal = t.value - 5;
    if (newVal > 0) {
        t.value = newVal;
        timeChanged();
    }
}

function footerController() {
    let liveModeSwitch = document.getElementById("isRunLive");
    let footer = document.getElementsByClassName("footerStyle")[0];
    let hostSelect = document.getElementById('hostSelect');
    if (liveModeSwitch.checked) {
        footer.setAttribute('hidden', 'true');
        hostSelect.removeAttribute('hidden');
    }
    else {
        footer.removeAttribute('hidden');
        hostSelect.setAttribute('hidden', 'true');
    }
}

function pausePlay() {
    let playBtn = document.getElementById("pausePlay");
    if (playBtn.name == "play") {
        playBtn.setAttribute("name", "pause");
        timeRun();
    }
    else {
        playBtn.setAttribute("name", "play");
    }
}

function timeChanged() {
    let t = document.getElementById('timeSelect');
    document.getElementById('timeValue').value = t.value;
}

function timeRun() {
    let t = document.getElementById('timeSelect');
    let playBtn = document.getElementById("pausePlay");
    if (t.value > 0 && playBtn.name != "play") {
        t.value = t.value - 1;
        timeChanged();
        setTimeout(timeRun,500);
        socket.connection.emit('getPreviousData',{ type: "readDb", to: "", content:"" });
    }
}

