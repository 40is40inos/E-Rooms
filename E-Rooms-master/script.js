
function disable(id){
    document.getElementById(id).disabled = true; 
}

function enable(id){
    document.getElementById(id).disabled = false; 
}

function makeVisible(id){
    document.getElementById(id).className = "isvisible";
}

function makeHidden(id){
    document.getElementById(id).className = "ishidden";
}

function Notify(text, username) {
    var now = new Date();
    var data = {
        "notification_text": text,
        "toUsername": username,
        "date": now.toLocaleDateString() + ' ' + now.toLocaleTimeString()  
    };
    const json = JSON.stringify(data);
    console.log(json);
    var xhr2 = new XMLHttpRequest();
    xhr2.onload = function () {
        if (xhr2.readyState === 4 && xhr2.status === 200) {
            console.log('notification send');
        } else {
            console.log(obj.error);
        }
    };
    xhr2.open("POST", "http://localhost:8080/notification");
    xhr2.setRequestHeader("Content-type", "application/json");
    xhr2.send(json);
}

function getCurrentDate() {
    var currentDate = new Date();
    
    var year = currentDate.getFullYear();
    var month = String(currentDate.getMonth() + 1).padStart(2, '0');
    var day = String(currentDate.getDate()).padStart(2, '0');
    
    var formattedDate = year + '-' + month + '-' + day;
    return formattedDate;
  }