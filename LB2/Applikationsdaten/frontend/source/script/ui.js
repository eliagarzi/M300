const API_URL = "http://127.0.0.1:3001"
let currentArduinoUUID;

const widgetInfoValueTemperature = document.querySelector(".widget-info__value--temperature");
const widgetInfoValueTemperatureTrend = document.querySelector(".widget-info__value--temperature--trend");

const widgetInfoValueHumidty = document.querySelector(".widget-info__value--humidity");
const widgetInfoValueHumidtyTrend = document.querySelector(".widget-info__value--humidity--trend");

const widgetInfoValueActive = document.querySelector(".widget-info__value--active");
const widgetInfoValueNotActive = document.querySelector(".widget-info__value--not-active");

const widgetInfoValuePressure = document.querySelector(".widget-info__value--pressure");
const widgetInfoValueHue = document.querySelector(".widget-info__value--hue");

const widgetValueElements = [widgetInfoValueTemperature, widgetInfoValueTemperatureTrend, widgetInfoValueHumidty, widgetInfoValueHumidtyTrend, widgetInfoValueActive, widgetInfoValueNotActive, widgetInfoValuePressure, widgetInfoValueHue]

const gaugeTemperature = document.querySelector(".gauge-svg--temperature");
const gaugeHumidity = document.querySelector(".gauge-svg--humidity");


function defaultWidgetData() {
    widgetValueElements.forEach(element => {
        element.textContent = "0"
    })
    
    gaugeTemperature.style.setProperty("--currentValue", "145")
    gaugeHumidity.style.setProperty("--currentValue", "145")
}

//###########################################
//Datenmodel in JSON beschreiben
//###########################################

function updateWidgetData(data) {
    widgetValueElements.forEach(element => {
        element.textContent = "0"
    })
    
    gaugeTemperature.style.setProperty("--currentValue", "145")
    gaugeHumidity.style.setProperty("--currentValue", "145")
}

defaultWidgetData();

const statusInfo = document.querySelector(".status-info");
const statusInfoMessage = document.querySelector(".status-info__message");
const statusInfoAnimationSection = document.querySelector(".status-info__animation-section");

function displayLoader(message, error) {
    statusInfo.style.display = "flex";
    if(error == true) {
        statusInfo.classList.remove("status-info--animate")
        statusInfo.classList.add("status-info--error")
        statusInfo.style.backgroundcolor = "FF6A6A";
    } else {
        statusInfo.classList.remove("status-info--error")
        statusInfo.classList.add("status-info--animate")
    }
    statusInfoMessage.textContent = message;
}

function hideLoader() {
    statusInfo.style.display = "none";
}

let arduinoInitInfo = document.querySelector(".arduino-init-info");
let arduinoInitInfoText = document.querySelector(".arduino-init-info--container__text");

function showInitStatus(showStatus, message) {
    if(showStatus == true) {
        arduinoInitInfo.style.display = "block";
        arduinoInitInfoText.textContent = message;
    } else {
        arduinoInitInfo.style.display = "none";
    }
}

const socket = io("http://127.0.0.1:3000")

socket.on("connection", () => {
    hideLoader();
})

socket.on("disconnect", () => {
    displayLoader("Keine Verbindung zum Server!", true)
    showInitStatus(true, "Keine Verbindung zum Server!")
})

let arduinoTableBody = document.querySelector(".arduino-overview-table__body");

        //################################
        //Datenmodell in JSON beschreiben
        //################################

socket.on("arduino-init-data", (data) => {
    hideLoader();
    //If no data is returned it means there are no Arduinos in the database
    if(data == null) {
        arduinoTableBody.style.display = "none";
        showInitStatus(true, "Es wurden noch keine Arduinos erfasst!")
    } else if (data.error) {
        console.error(error)
        displayLoader(error, true)
    } else {
        arduinoInitInfo.style.display = "none";
        arduinoTableBody.style.display = "table-footer-group";

        //################################
        //Durchschnitt aller Daten berechnen
        //################################

        for(let i in data) {
            createArduinoInDom(data[i])
        }
    }
})    

function testSocketConnection() {
    //If 1500ms after the ui.js file has been loaded no socket connection is established, a error will be displayed
    let timeout = setTimeout(() => {
        if(!socket.connected) {
            showInitStatus(true, "Keine Verbindung zum Server!")
            displayLoader("Keine Verbidung zum Server!", true)
        } else {
            hideLoader();
        }
    }, 1500)
}

//Eventhandler for Socket.io event that are emitted by the server

        //################################
        //Datenmodell in JSON beschreiben
        //################################

socket.on("arduino-create-event", (data) => {
    createArduinoInDom(data);
    arduinoInitInfo.style.display = "none";
    arduinoTableBody.style.display = "table-footer-group";
})

socket.on("arduino-delete-event", (data) => {
    deleteArduinoInDom(data);
})

socket.on("arduino-update-event", (data) => {
    updateArduinoInDom(data);
})

socket.on("data-update-event", (data) => {
    updateArduinoDataInDom(data);
    updateWidgetData(data);

    const currentUUID = data.uuid;
    const currentArduinoInfoElements = document.querySelectorAll(`.info-${currentUUID}`)
    currentArduinoInfoElements[2].textContent = data.lastseen;
})  

const arduinoTable = document.querySelector(".arduino-overview-table__body");

//Deletes Arduino DOM element
function deleteArduinoInDom(data) {
    const arduinoRowElement = document.querySelector(`.row-${data.uuid}`);
    arduinoTable.removeChild(arduinoRowElement)
}

const tableUnits = ["°", "%", "hPA", "l"]

//Creates Arduino in DOM
function createArduinoInDom(data) {
    const currentUUID = data.uuid;

    let newArduinoRowElement = document.createElement("tr");
    newArduinoRowElement.classList.add("table-row");
    newArduinoRowElement.classList.add(`row-${currentUUID}`)

    let counter = 0;

    for(let elementValue in data.info) {
        let newArduinoTableDataElement = document.createElement("td");
        newArduinoTableDataElement.textContent = data.info[elementValue];
        newArduinoTableDataElement.classList.add(`table-data-general`)
        newArduinoTableDataElement.classList.add(`info-${currentUUID}`)
        newArduinoRowElement.appendChild(newArduinoTableDataElement);
    } 

    for(let elementValue in data.data) {
        let newArduinoTableDataElement = document.createElement("td");
        if(data.data[elementValue] == "-") {
            newArduinoTableDataElement.textContent = data.data[elementValue];
        } else {
            newArduinoTableDataElement.textContent = data.data[elementValue]+" "+tableUnits[counter];
            counter++;
        }
        newArduinoTableDataElement.classList.add(`table-data-general`)
        newArduinoTableDataElement.classList.add(`data-${currentUUID}`)
        newArduinoRowElement.appendChild(newArduinoTableDataElement);
    } 

    let newArduinoTableData = document.createElement("td");
    newArduinoTableData.classList.add(`table-data-general`)
    let newArduinoTablaDataButton = document.createElement("button");
    newArduinoTablaDataButton.classList.add(`button-table`)
    newArduinoTablaDataButton.setAttribute("onclick", `javascript: openContextMenu("${currentUUID}");`);
    newArduinoTablaDataButton.innerHTML = "&#8226;&#8226;&#8226;";

    newArduinoTableData.appendChild(newArduinoTablaDataButton);
    newArduinoRowElement.appendChild(newArduinoTableData);

    arduinoTable.appendChild(newArduinoRowElement);
}

//Bei einer Änderung am Arduino, wird die Änderung ins Frontend übertragen
function updateArduinoInDom(data) {
    const newArduinoInfo = data.data;

    const arduinoTableDataElements = document.querySelectorAll(`.info-${data.uuid}`)

    arduinoTableDataElements[0].textContent = newArduinoInfo.name;
    arduinoTableDataElements[1].textContent = newArduinoInfo.location;  
}

//Wenn durch den Socket.io Event neue Daten empfangen werden, werden diese im Frontend geupdatet
function updateArduinoDataInDom(data) {
    const currentUUID = data.uuid;
    const currentData = data.data;

    const arduinoTableDataElements = document.querySelectorAll(`.data-${currentUUID}`)

    let counter = 0;
    for(const item in currentData) {
        if(arduinoTableDataElements[counter].textContent !== currentData[item]+" "+tableUnits[counter]) {
            arduinoTableDataElements[counter].textContent = currentData[item]+" "+tableUnits[counter];
            //Update animiation
            arduinoTableDataElements[counter].classList.add("data-update");
        }    
        counter++;
    }
}

const signoutButton = document.querySelector("#button-logout")
const createButton = document.querySelector("#button-create")

signoutButton.addEventListener("click", () => {
    //Signout API Call
});

const arduinoCreateMenu = document.querySelector("#arduino-create-menu");
const arduinoDeleteMenu = document.querySelector("#arduino-delete-menu");
const arduinoChangePropertiesMenu = document.querySelector("#arduino-change-properties-menu");
const arduinoOptionsMenu = document.querySelector("#arduino-options-menu");

let allMenus = [
    arduinoOptionsMenu,
    arduinoCreateMenu,
    arduinoDeleteMenu,
    arduinoChangePropertiesMenu,
]

const arduinoCreateMenuForm = document.querySelector("#arduino-create-menu__form");
const arduinoDeleteMenuForm = document.querySelector("#arduino-delete-menu__form");
const arduinoChangePropertiesMenuForm = document.querySelector("#arduino-change-properties-menu__form");

function closeAllMenus() {
    for(let e in allMenus) {
        allMenus[e].style.display = "none"; 
    }
    arduinoCreateMenuForm.reset();
    arduinoChangePropertiesMenuForm.reset();
    arduinoDeleteMenuForm.reset();
    backgroundHide.style.display = "none";
}

//Blur behind every menu which has been opened
const backgroundHide = document.querySelector(".background-hide");

backgroundHide.addEventListener("click", () => {
    closeAllMenus();
})

const arduinoCreateMenuCancelButton = document.querySelector(".arduino-create-menu-button-cancel");
const arduinoCreateMenuCancelButton2 = document.querySelector(".arduino-create-menu-button-cancel-two");
const arduinoDeleteMenuCancelButton = document.querySelector("#arduino-delete-menu-button-cancel");
const arduinoChangePropertiesMenuCancelButton = document.querySelector("#arduino-change-properties-menu-button-cancel");
const ardunioCreateMenuForm = document.querySelector("#arduino-create-menu__form");
const ardunioCreateMenuInfo = document.querySelector(".arduino-create-menu__info");

arduinoCreateMenuCancelButton.addEventListener("click", () => {
    closeAllMenus();
    ardunioCreateMenuForm.style.display = "flex";
    ardunioCreateMenuInfo.style.display = "none";
})

arduinoCreateMenuCancelButton2.addEventListener("click", () => {
    closeAllMenus();
    ardunioCreateMenuForm.style.display = "flex";
    ardunioCreateMenuInfo.style.display = "none";
})

arduinoDeleteMenuCancelButton.addEventListener("click", () => {
    closeAllMenus();
})

arduinoChangePropertiesMenuCancelButton.addEventListener("click", () => {
    closeAllMenus();
})



//Wechsel der Anzeige im CSS, wenn Menü geöffnet werden soll
function changeMenuState(menuelement) {
    
    closeAllMenus();
   
    if(menuelement.style.display = "none") {
        menuelement.style.display = "block";
        backgroundHide.style.display = "block";
    } 
}

function openContextMenu(uuid) {
    currentArduinoUUID = uuid;
    changeMenuState(arduinoOptionsMenu);
}

const arduinoOptionsMenuChangeButton = document.querySelector("#arduino-options-menu-button-change");
const arduinoOptionsMenuDeleteButton = document.querySelector("#arduino-options-menu-button-delete");
const arduinoOptionsMenuCancelButton = document.querySelector("#arduino-options-menu-button-cancel");

arduinoOptionsMenuChangeButton.addEventListener("click", () => {
    changeMenuState(arduinoChangePropertiesMenu);
})

arduinoOptionsMenuDeleteButton.addEventListener("click", () => {
    changeMenuState(arduinoDeleteMenu);
})

arduinoOptionsMenuCancelButton.addEventListener("click", () => {
    closeAllMenus();
})

createButton.addEventListener("click", () => {
    if(!socket.connected) {
        testSocketConnection()
    } else {
        changeMenuState(arduinoCreateMenu);
    }
})

//Functions used to send data to the backend with http POST
async function sendJSONToBackend(url, JSONData, displayMessage) {
    try {
        displayLoader(displayMessage, false);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(JSONData)
        })
        hideLoader();
        if(response.ok) {
            return response;
        } else {
            throw new Error;
        }
    } catch (error) {
        displayLoader("Keine Verbindung zum Server!", true);
        console.error(error)
    }
}

const arduinoChangePropertiesMenuName = document.querySelector("[name='change-arduino-name']")
const arduinoChangePropertiesMenuLocation = document.querySelector("[name='change-arduino-location']")

arduinoChangePropertiesMenuForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if(arduinoChangePropertiesMenuName.value.trim() === "") {
        arduinoChangePropertiesMenuName.classList.remove("input-outline--green");
        arduinoChangePropertiesMenuName.classList.add("input-outline--red");
    } else {
        arduinoChangePropertiesMenuName.classList.remove("input-outline--red");
        arduinoChangePropertiesMenuName.classList.add("input-outline--green");
    }

    if(arduinoChangePropertiesMenuLocation.value.trim() === "") {
        arduinoChangePropertiesMenuLocation.classList.remove("input-outline--green");
        arduinoChangePropertiesMenuLocation.classList.add("input-outline--red");
    } else {
        arduinoChangePropertiesMenuLocation.classList.remove("input-outline--red");
        arduinoChangePropertiesMenuLocation.classList.add("input-outline--green");
    }

    if (arduinoChangePropertiesMenuName.value.trim() !== "" &&  arduinoChangePropertiesMenuLocation.value.trim() !== "") {
        arduinoChangePropertiesMenuName.classList.remove("input-outline--red");
        arduinoChangePropertiesMenuLocation.classList.remove("input-outline--red");
        arduinoChangePropertiesMenuName.classList.add("input-outline--green");
        arduinoChangePropertiesMenuLocation.classList.add("input-outline--green"); 

        sendJSONToBackend(`${API_URL}/api/arduino/change/?uuid=${currentArduinoUUID}`,{name:  arduinoChangePropertiesMenuName.value, location:  arduinoChangePropertiesMenuLocation.value},"Arduino wird geändert")
        .catch((error) => displayLoader(error, true))
        closeAllMenus();
        arduinoChangePropertiesMenuName.classList.remove("input-outline--green");
        arduinoChangePropertiesMenuLocation.classList.remove("input-outline--green");
    }
})

const arudnioCreateMenuFormName = document.querySelector("[name='new-arduino-name']")
const arudnioCreateMenuFormLocation = document.querySelector("[name='new-arduino-location']")

const arduinoCreateMenuInfoUUID = document.querySelector("#arduino-create-menu__info-uuid");
const arduinoCreateMenuInfoAPIKEY = document.querySelector("#arduino-create-menu__info-apikey");


arduinoCreateMenuForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if(arudnioCreateMenuFormName.value.trim() === "") {
        arudnioCreateMenuFormName.classList.remove("input-outline--green");
        arudnioCreateMenuFormName.classList.add("input-outline--red");
    } else {
        arudnioCreateMenuFormName.classList.remove("input-outline--red");
        arudnioCreateMenuFormName.classList.add("input-outline--green");
    }

    if(arudnioCreateMenuFormLocation.value.trim() === "") {
        arudnioCreateMenuFormLocation.classList.remove("input-outline--green");
        arudnioCreateMenuFormLocation.classList.add("input-outline--red");
    } else {
        arudnioCreateMenuFormLocation.classList.remove("input-outline--red");
        arudnioCreateMenuFormLocation.classList.add("input-outline--green");
    }

    if (arudnioCreateMenuFormName.value.trim() !== "" && arudnioCreateMenuFormLocation.value.trim() !== "") {
        arudnioCreateMenuFormName.classList.remove("input-outline--red");
        arudnioCreateMenuFormLocation.classList.remove("input-outline--red");
        arudnioCreateMenuFormName.classList.add("input-outline--green");
        arudnioCreateMenuFormLocation.classList.add("input-outline--green"); 

        sendJSONToBackend(API_URL+"/api/arduino/create/",{name: arudnioCreateMenuFormName.value, location: arudnioCreateMenuFormLocation.value, lastseen: "00:00"},"Arduino wird erstellt")
        .then((response) => response.json()) 
        .then((data) => {
            ardunioCreateMenuForm.style.display = "none";
            ardunioCreateMenuInfo.style.display = "flex";
            arduinoCreateMenuInfoAPIKEY.textContent = data.apikey;
            arduinoCreateMenuInfoUUID.textContent = data.uuid;
        })
        .catch((error) => {
            displayLoader(error, true)
        })
        arudnioCreateMenuFormName.classList.remove("input-outline--green");
        arudnioCreateMenuFormLocation.classList.remove("input-outline--green");
    }
})

const arduinoDeleteForm = document.querySelector("#arduino-delete-menu__form");
const arduinoDeleteFormButton = document.querySelector("#arduino-delete-menu-button-delete");
const arduinoDeleteMenuFormNameInput = document.querySelector("[name='delete-arduino-name']");

arduinoDeleteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        displayLoader("Arduino wird gelöscht", false);
        sendJSONToBackend(`${API_URL}/api/arduino/delete?uuid=${currentArduinoUUID}`, {}, "Arduino wird gelöscht")
        // const response = await fetch(`${API_URL}/api/arduino/delete?uuid=${currentArduinoUUID}`, {method: 'POST'})
        hideLoader();
        closeAllMenus();
    } catch (error) {
        displayLoader("Keine Verbindung zum Server!", true);
        console.error(error)
    }
})

arduinoDeleteMenuFormNameInput.addEventListener("input", () => {
    const name = document.querySelectorAll(`.info-${currentArduinoUUID}`)[0].innerText;

    if(arduinoDeleteMenuFormNameInput.value === name) {
        arduinoDeleteFormButton.setAttribute("type", "submit")
        arduinoDeleteFormButton.classList.remove("button-red--grayed");
        arduinoDeleteFormButton.classList.add("button-red");
    } else {
        arduinoDeleteFormButton.setAttribute("type", "button")
        arduinoDeleteFormButton.classList.remove("button-red");
        arduinoDeleteFormButton.classList.add("button-red--grayed");
    }
})

function copyClipboard(elementID) {
    if(elementID == "arduino-create-menu__info-uuid-info") {
        navigator.clipboard.writeText(currentArduinoUUID);
    } else {
        var textElement = document.getElementById(elementID);
        navigator.clipboard.writeText(textElement.textContent);
    }
}

testSocketConnection()
