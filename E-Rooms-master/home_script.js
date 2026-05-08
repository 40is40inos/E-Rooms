function onload(){
    ShowNotifications(); 
    if (sessionStorage.getItem('username') != null) document.getElementById('btn_username').innerHTML = sessionStorage.getItem('username');
    else window.location.href = './Login.html';
}

function ShowRooms(){
    makeAllHidden("rooms");
    // enable_btns("btn_rooms");

    if ( document.getElementById("persons").value == '') persons = '*';
    else persons = parseInt(document.getElementById("persons").value); 

    fromDate = document.getElementById("fromDate").value;
    toDate   = document.getElementById("toDate").value;

    if ( fromDate == '' && toDate == '' ) dates = '';
    else if ( fromDate == '' && toDate != '') {
        fromDate = toDate;
        dates = '?fromDate=' + toDate + '&toDate=' + toDate ;
    }else if ( fromDate != '' && toDate == '' ) {
        toDate = fromDate;
        dates = '?fromDate=' + fromDate + '&toDate=' + fromDate ;
    }else dates = '?fromDate=' + fromDate + '&toDate=' + toDate ;


    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const obj = JSON.parse(xhr.responseText);
        const rooms = obj.data;
        if (xhr.status === 200) { 
            let html = '';
            for ( let r in rooms ) {
                html += '<div class="card mb-4" style="min-width: 20rem; max-width: 20rem;">' + 
                        '<div class="row no-gutters">'; 
                if (rooms[r].photo2 == '') html += '<div class="col">'; else html += '<div class="col-md-6">';   

                html += '<img class="card-img" src="' + rooms[r].photo1 + '" alt="Card image cap" style="height : 175px" ></div>';  
                if (rooms[r].photo2 != '') html += '<div class="col-md-6"><img class="card-img" src="' + rooms[r].photo2 + '" alt="Card image cap" style="height : 175px" ></div>';
                html += '</div><div class="card-body"><h5 class="card-title">' + rooms[r].room_name + '</h5>' + 
                        '<p class="card-text" style="text-align: right;">' + rooms[r].min_person_capacity + '-' + rooms[r].max_person_capacity + ' persons</p>' + 
                        '<button id="' + rooms[r].id + '" class="btn btn-success" onclick="ShowSingleRoom(this.id);">Book It Now</button></div></div>';
            }
            document.getElementById("room_cards").innerHTML = html;
        }
    };

    xhr.open("GET", "http://localhost:8080/rooms/" + persons + dates );
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}

function ShowSingleRoom(id){
    makeAllHidden('singleRoomDisplay');
    // enable('btn_rooms');
    document.getElementById("ReviewDetails").innerHTML='';

    document.getElementById("date_error").innerHTML = "";
    document.getElementById("start_date").value = "";
    document.getElementById("end_date").value = "";
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const obj = JSON.parse(xhr.responseText);
        let html = '';
        if (xhr.status === 200) { 
            const room = obj.data[0];
            document.getElementById("r_name").innerHTML = room.room_name;
            html = '<img src="' + room.photo1 + '" alt="Image 1" class="img-fluid" style="max-height: 500px;">';
            document.getElementById("img1").innerHTML   = html;
            if ( room.photo2 != "" ) {
                html = '<img src="' + room.photo2 + '" alt="Image 1" class="img-fluid" style="max-height: 500px;">';
                document.getElementById("img2").innerHTML   = html;
            }
            document.getElementById("bookItDiv").innerHTML =    '<button id="room' + room.id + '" class="btn btn-info" onclick="bookIt(\'' + room.id + '\',\'' + room.room_name + '\');">Book It</button>' + 
                                                                ' <button id="request_ok_btn" class="btn btn-success" onclick="ShowNotifications();">OK</button>';
            disable('request_ok_btn');
        }
    };

    xhr.open("GET", "http://localhost:8080/room/" + id);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();

    const xhr2 = new XMLHttpRequest();
    xhr2.onload = function() {
        const response = JSON.parse(xhr2.responseText);
        document.getElementById("calendar").remove();
        document.getElementById("calendarDiv").innerHTML = '<div id="calendar" style="max-width: 500px;"></div>';
        if (xhr2.status === 200){
            const events = response.data.map(function(item) {
                const endDate = new Date(item.end);
                endDate.setDate(endDate.getDate() + 1); 
        
                return {
                    start: item.start,
                    end: endDate.toISOString().substring(0, 10), 
                    color: item.color
                };
            });
        
            $(document).ready(function() {
                $('#calendar').fullCalendar({
                    events: events
                });
            });
        } else {
            $(document).ready(function() {  
                $('#calendar').fullCalendar({
                    events: []
                });
            });
        }

    };

    xhr2.open("GET", "http://localhost:8080/occupied-days/" + id);
    xhr2.setRequestHeader("Accept", "application/json");
    xhr2.setRequestHeader("Content-Type", "application/json");
    xhr2.send();

    document.getElementById("Review_msg").innerHTML = '';

    const xhr3 = new XMLHttpRequest();
    xhr3.onload = function() {
        const obj = JSON.parse(xhr3.responseText);
        if (xhr3.status === 200) { 
            let html = '';
            for (let x in  obj.data){
                html += '<h5 style="color : rgb(120, 170, 195)">' + obj.data[x].date + '</h5>' +
                        '<h4>' + obj.data[x].review_text + '</h4>';
            }
            document.getElementById("ReviewDetails").innerHTML =html;
        } else document.getElementById("Review_msg").innerHTML = obj.error;
    };

    xhr3.open("GET", "http://localhost:8080/review/" + id);
    xhr3.setRequestHeader("Accept", "application/json");
    xhr3.setRequestHeader("Content-Type", "application/json");
    xhr3.send();
}
function ShowHistory() {
    makeAllHidden("history");
    // enable_btns("btn_history");

    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const obj = JSON.parse(xhr.responseText);
        const reserv = obj.data;
        if (xhr.status === 200) {

            var table = document.getElementById("historyTable");
            table.innerHTML = "";
            let thead = table.createTHead();

            let row = thead.insertRow(0);
            row.insertCell(0).innerHTML = "id";
            row.insertCell(1).innerHTML = "room_id";
            row.insertCell(2).innerHTML = "room_name";
            row.insertCell(3).innerHTML = "username";
            row.insertCell(4).innerHTML = "fromDate";
            row.insertCell(5).innerHTML = "toDate";
            row.insertCell(6).innerHTML = "ConfirmationNumber";
            row.insertCell(7).innerHTML = "status";
            row.insertCell(8).innerHTML = "";


            let tbody = table.createTBody();
            var i = 0;

            for(let x in reserv){
                let row = tbody.insertRow(i);
                row.id = reserv[x].id;
                row.insertCell(0).innerHTML = reserv[x].id;
                row.insertCell(1).innerHTML = reserv[x].room_id;
                row.insertCell(2).innerHTML = reserv[x].room_name;
                row.insertCell(3).innerHTML = reserv[x].username;
                row.insertCell(4).innerHTML = reserv[x].fromDate;
                row.insertCell(5).innerHTML = reserv[x].toDate;
                row.insertCell(6).innerHTML = reserv[x].ConfirmationNumber;
                row.insertCell(7).innerHTML = reserv[x].status;
                    
                if(reserv[x].status === "accepted" ){
                    row.insertCell(8).innerHTML = "<button id='cancel"  + reserv[x].id + "'  class='btn btn-danger' "+
                        "onclick='ChangeReservStatus(" + reserv[x].id + ", \"canceled\" )'> Cancel </button> "; 
                }
                else if(reserv[x].status === "done"){
                    row.insertCell(8).innerHTML = "<button id='review" + reserv[x].id + "' class='btn btn-info' " +
                        "onclick='ShowReviewForm(" + reserv[x].room_id + ", \"" + reserv[x].username + "\")'>Review</button>";
                }
                else if(reserv[x].status === "active"){
                    row.insertCell(8).innerHTML = "<button id='cancel"  + reserv[x].id + "'  class='btn btn-success' "+
                        "onclick='ChangeReservStatus(" + reserv[x].id + ", \"done\" )'> Complete </button> "; 
                } 
                i++;
            }
        }
    }
    

    xhr.open("GET", "http://localhost:8080/reservation/" + sessionStorage.getItem('username'));
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}
function ShowReviewForm(room_id, username){
    makeAllHidden('addReviewForm');
    document.getElementById('room_id').value = room_id;
    document.getElementById('username').value = username;
    document.getElementById('review_text').value = '';
    
    var now = new Date();
    document.getElementById('date').value = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
}
function addReview(room_id, username) {

    console.log(room_id, username);

    enable('room_id');
    enable('username');
    enable('date');
    const form = document.getElementById("reviewForm");
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    const json = JSON.stringify(data);
    
    disable('room_id');
    disable('username');
    disable('date');

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById("newReview_msg").style.color = "green";
            document.getElementById("newReview_msg").innerHTML = "Review Added";
            disable("btn_addReview");
            enable("btn_addReviewOK");
        } else {
            let obj = JSON.parse(xhr.responseText);
            document.getElementById("newReview_msg").style.color = "red";
            document.getElementById("newReview_msg").innerHTML = obj.error;
            disable("btn_addReview");
            enable("btn_addReviewOK");
        }
        makeVisible('newReview_msg');
    };
    xhr.open("POST", "http://localhost:8080/review");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(json);
}
function ChangeReservStatus(id, new_status){

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200) ShowHistory() 
        else {
            let obj = JSON.parse(xhr.responseText);
            alert(obj.error);
        }
    };
    xhr.open("PUT", "http://localhost:8080/change-status/" + id + "/" + new_status );
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}
function ShowPersonalInfoForm(){
    // enable_btns("btn_PerInfo");
    makeAllHidden("PersonalInfoForm");

    enable("btn_updateEmployee");
    disable("btn_editEmployee_OK");

    document.getElementById("EmployeeEdit_msg").innerHTML = '';

    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const obj = JSON.parse(xhr.responseText);
        if (xhr.status === 200) { 
            document.getElementById("empl_id").value = obj.data[0].id;
            document.getElementById("user").value = sessionStorage.getItem("username");
            document.getElementById("password").value = obj.data[0].password;
            document.getElementById("position").value = obj.data[0].position;
            document.getElementById("FirstName").value = obj.data[0].FirstName;
            document.getElementById("LastName").value = obj.data[0].LastName;
            document.getElementById("gender").value = obj.data[0].gender;
            document.getElementById("email").value = obj.data[0].email;
            document.getElementById("country").value = obj.data[0].country;
            document.getElementById("city").value = obj.data[0].city;
            document.getElementById("zip_code").value = obj.data[0].zip_code;
            document.getElementById("address").value = obj.data[0].address;
            document.getElementById("phone_number").value = obj.data[0].phone_number;
            
        } else {
            console.log(obj);
        } 
    };

    xhr.open("GET", "http://localhost:8080/userInfo/" + sessionStorage.getItem("username"));
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}
function ShowNotifications(){
    makeAllHidden("notifications");
    // enable_btns("btn_notific");
    document.getElementById("notif_msg").innerHTML = '';

    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const obj = JSON.parse(xhr.responseText);
        if (xhr.status === 200) { 
            // console.log(obj.data);
            let html = '';
            for (let x in  obj.data){
                html += '<h5 style="color : rgb(105, 176, 187)">' + obj.data[x].date + '</h5>' +
                        '<h4>' + obj.data[x].notification_text + '</h4>';
            }
            document.getElementById("notificationsDetails").innerHTML =html;
        } else document.getElementById("notif_msg").innerHTML = obj.error;
    };

    xhr.open("GET", "http://localhost:8080/notification/" + sessionStorage.getItem("username"));
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}
function UpdatePersonalInfo(){
    enable("position");
    enable("email");
    enable("empl_id");

    const id = document.getElementById("empl_id").value;
    const form = document.getElementById("edit_employeeForm");
    
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    const json = JSON.stringify(data);
    
    // console.log(json);    
    disable("position");
    disable("email");
    disable("empl_id");

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById("EmployeeEdit_msg").style.color = "green";
            document.getElementById("EmployeeEdit_msg").innerHTML = "Info Updated";
            disable("btn_updateEmployee");
            enable("btn_editEmployee_OK");
        } else {
            let obj = JSON.parse(xhr.responseText);
            document.getElementById("EmployeeEdit_msg").style.color = "red";
            document.getElementById("EmployeeEdit_msg").innerHTML = obj.error;
        }
        makeVisible("EmployeeEdit_msg");
    };
    xhr.open("PUT", "http://localhost:8080/employee/" + id);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(json);
}
function deleteNotification(id){
    console.log(id);
}
function ConvertDate(dateInput) {
    const dateValue = dateInput.value;

    if (!dateValue) {
        console.log("Invalid date value");
        return '';
    }

    const selectedDate = new Date(dateValue);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}
function bookIt(id,name){

    const startDate = ConvertDate(document.getElementById('start_date'));
    const endDate = ConvertDate(document.getElementById('end_date'));

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;

    if(startDate < currentDate){
        makeVisible('date_error');
        document.getElementById('date_error').innerHTML = 'You have selected a past date';
        return;
    }

    if (endDate < startDate) {
        makeVisible('date_error');
        document.getElementById('date_error').innerHTML = 'End Date must be after Start Date';
        return;
    } 

    if (endDate == '' || startDate == '') {
        makeVisible('date_error');
        document.getElementById('date_error').innerHTML = 'Enter Both Days';
        return;
    } 

    const data = {};
    data['room_id'] = id;
    data['room_name'] = name;
    data['username'] = sessionStorage.getItem('username');
    data["fromDate"] = startDate;
    data['toDate'] = endDate;
    data['confirmationNumber'] = null;
    data['status'] = 'requested';

    const json = JSON.stringify(data);

    console.log(json);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            makeVisible('date_error');
            document.getElementById("date_error").style.color = "green";
            document.getElementById("date_error").innerHTML = "Request Completed";
            enable('request_ok_btn');
            Notify('You have Requested for room : ' +  name + ' for the period : ' + startDate + ' to ' + endDate , sessionStorage.getItem('username') );
        } else {
            let obj = JSON.parse(xhr.responseText);
            makeVisible('date_error');
            document.getElementById('date_error').style.color.red;
            document.getElementById('date_error').innerHTML = obj.error;
            return;
        }
    };
    xhr.open("POST", "http://localhost:8080/request-reservation");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(json);
}

//UI
function enable_btns(id){
    enable("btn_notific");
    enable("btn_rooms");
    enable("btn_PerInfo");
    enable("btn_history");
    enable("btn_logout");
    disable(id);
}

function makeAllHidden(id){
    makeHidden("rooms");
    makeHidden("history");
    makeHidden("addReviewForm");
    makeHidden("singleRoomDisplay");
    makeHidden("PersonalInfoForm");
    makeHidden("notifications");

    makeVisible(id);
}