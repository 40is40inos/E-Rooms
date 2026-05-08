// Employees
function showEmployees() {
    makeAllHidden("employees");
    // enable_btns("btn_employees");
    document.getElementById("empl_msg").innerHTML = "";

    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if (xhr.status === 200) { 
            const obj = JSON.parse(xhr.responseText);
            const empl = obj.data;
            var table = document.getElementById("employeesTable");
            table.innerHTML = "";
            let thead = table.createTHead();

            let row = thead.insertRow(0);
            row.insertCell(0).innerHTML = "id";
            row.insertCell(1).innerHTML = "Position";
            row.insertCell(2).innerHTML = "FirstName";
            row.insertCell(3).innerHTML = "LastName";
            row.insertCell(4).innerHTML = "Address";
            row.insertCell(5).innerHTML = "City";
            row.insertCell(6).innerHTML = "Country";
            row.insertCell(7).innerHTML = "Zip Code";
            row.insertCell(8).innerHTML = "Email";
            row.insertCell(9).innerHTML = "Gender";
            row.insertCell(10).innerHTML = "Phone Num";
            row.insertCell(11).innerHTML = "username";
            row.insertCell(12).innerHTML = "password";
            row.insertCell(13).innerHTML = " ";

            let tbody = table.createTBody();
            var i = 0;
            for(let x in empl){
                let row = tbody.insertRow(i);
                row.id = empl[x].id;
                row.insertCell(0).innerHTML = empl[x].id;
                row.insertCell(1).innerHTML = empl[x].position;
                row.insertCell(2).innerHTML = empl[x].FirstName;
                row.insertCell(3).innerHTML = empl[x].LastName;
                row.insertCell(4).innerHTML = empl[x].address;
                row.insertCell(5).innerHTML = empl[x].city;
                row.insertCell(6).innerHTML = empl[x].country;
                row.insertCell(7).innerHTML = empl[x].zip_code;
                row.insertCell(8).innerHTML = empl[x].email;
                row.insertCell(9).innerHTML = empl[x].gender;
                row.insertCell(10).innerHTML = empl[x].phone_number;
                row.insertCell(11).innerHTML = empl[x].username;
                row.insertCell(12).innerHTML = empl[x].password;
                if ( empl[x].username == null ) {   
                    row.insertCell(13).innerHTML = "<button id='"+empl[x].id+"'  class='btn btn-success' onclick='showFormAddPerson(this.id)'> Add User </button>";
                } else {
                    row.insertCell(13).innerHTML = "<button id='"+empl[x].username+"'  class='btn btn-danger' onclick='deletePerson(this.id)'> Delete User </button>"; 
                } 
                i++;
            }
        } else console.log('xhr.status != 200');
    };

    xhr.open("GET", "http://localhost:8080/employee_person");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}
function addEmployee(){
    const form = document.getElementById("employeeForm");
    
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    const json = JSON.stringify(data);
    
    // console.log(json);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            makeVisible('newEmployee_msg');
            document.getElementById("newEmployee_msg").style.color = "green";
            document.getElementById("newEmployee_msg").innerHTML = "User Added";
            enable("btn_addEmployeeOK");
        } else {
            let obj = JSON.parse(xhr.responseText);
            makeVisible('newEmployee_msg');
            document.getElementById("newEmployee_msg").style.color = "red";
            document.getElementById("newEmployee_msg").innerHTML = "a problem occured";
        }
    };
    xhr.open("POST", "http://localhost:8080/employee");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(json);
}
function addPerson(){

    enable('employee_id');
    const form = document.getElementById("personForm");
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    const json = JSON.stringify(data);
    
    disable('employee_id');

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById("newPerson_msg").style.color = "green";
            document.getElementById("newPerson_msg").innerHTML = "User Added";
            disable("btn_addPerson");
            enable("btn_addPersonOK");
        } else {
            let obj = JSON.parse(xhr.responseText);
            document.getElementById("newPerson_msg").style.color = "red";
            document.getElementById("newPerson_msg").innerHTML = obj.error;
        }
        makeVisible('newPerson_msg');
    };
    xhr.open("POST", "http://localhost:8080/person");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(json);
}
function deletePerson(id){
    // console.log(id);
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const obj = JSON.parse(xhr.responseText);
        // console.log(obj);
        if (xhr.status === 200) { 
        document.getElementById("empl_msg").style.color = "greed";
        document.getElementById("empl_msg").innerHTML = "person deleted";
        showEmployees();
        } else {
            document.getElementById("empl_msg").style.color = "blue";
            document.getElementById("empl_msg").innerHTML = "error";
        }
    };
    
    xhr.open("DELETE", "http://localhost:8080/user/" + id);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}
function deleteEmployee(){
    const id = document.getElementById("del_employee_id").value;
    if (id == '') {
        document.getElementById("empl_msg").style.color = "red";
        document.getElementById("empl_msg").innerHTML = "You have to enter an id!";
    } else {

        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
            console.log(xhr.responseText);
            const obj = JSON.parse(xhr.responseText);
            if (xhr.status === 200) { 
                document.getElementById("empl_msg").style.color = "greed";
                document.getElementById("empl_msg").innerHTML = "employee deleted";
                document.getElementById("del_employee_id").value = '';
                showEmployees();
            } else {
                document.getElementById("empl_msg").style.color = "red";
                document.getElementById("empl_msg").innerHTML = obj.error;
            }
        };
    
        xhr.open("DELETE", "http://localhost:8080/employee/" + id);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send();

    }
}
function editEmployee(){
    document.getElementById("empl_id").disabled = false;
    const id = document.getElementById("empl_id").value;
    document.getElementById("empl_id").disabled = true;

    const form = document.getElementById("edit_employeeForm");
    
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    const json = JSON.stringify(data);
    
    console.log(json);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById("newEmployeeEdit_msg").style.color = "green";
            document.getElementById("newEmployeeEdit_msg").innerHTML = "Employee Info Updated";
            disable("btn_updateEmployee");
            enable("btn_editEmployee_OK");
        } else {
            let obj = JSON.parse(xhr.responseText);
            document.getElementById("newEmployeeEdit_msg").style.color = "red";
            document.getElementById("newEmployeeEdit_msg").innerHTML = obj.error;
        }
        makeVisible("newEmployeeEdit_msg");
    };
    xhr.open("PUT", "http://localhost:8080/employee/" + id);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(json);
}
function showFormAddPerson(id){
    document.getElementById("personForm").reset();
    document.getElementById("newPerson_msg").innerHTML = "";
    makeAllHidden("addPersonForm");
    enable("btn_addPerson");
    disable("btn_addPersonOK");
    document.getElementById("employee_id").value = id;
    makeVisible("btn_cancel");
}
function ShowNewEmployeeForm(){
    makeAllHidden("addEmployeeForm");
    makeVisible("btn_cancel");
    document.getElementById("employeeForm").reset();
    document.getElementById("newEmployee_msg").innerHTML = "";
}
function ShowEditEmployeeForm(id){
    if ( id == '' ){
        document.getElementById('empl_msg').style.color = "red";
        document.getElementById('empl_msg').innerHTML = 'You have to enter an id';
        return;    
    }
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const obj = JSON.parse(xhr.responseText);
        console.log(obj.data);
        if (xhr.status === 200) { 
            document.getElementById("empl_id").value = obj.data[0].id;
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
            
            makeAllHidden("editemployeeForm");
            makeVisible("btn_cancel");
        } else if (xhr.status === 300) {
            document.getElementById('empl_msg').style.color = "red";
            document.getElementById('empl_msg').innerHTML = 'Id not found';  
        } 
        else {
            document.getElementById('empl_msg').style.color = "red";
            document.getElementById('empl_msg').innerHTML = 'error';  
        }  
    };

    xhr.open("GET", "http://localhost:8080/employee/" + id);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}

// Rooms
function showRooms() {
    makeAllHidden("rooms");
    // enable_btns("btn_rooms");
    document.getElementById("room_msg").innerHTML = '';

    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const obj = JSON.parse(xhr.responseText);
        const rooms = obj.data;
        if (xhr.status === 200) { 

            var table = document.getElementById("roomsTable");
            table.innerHTML = "";
            let thead = table.createTHead();

            let row = thead.insertRow(0);
            row.insertCell(0).innerHTML = "id";
            row.insertCell(1).innerHTML = "Room Name";
            row.insertCell(2).innerHTML = "Photo 1";
            row.insertCell(3).innerHTML = "Photo 2";
            row.insertCell(4).innerHTML = "Minimum Person Capacity";
            row.insertCell(5).innerHTML = "Maximum Person Capacity";
            row.insertCell(6).innerHTML = " ";
            row.insertCell(7).innerHTML = " ";

            let tbody = table.createTBody();
            var i = 0;
            for(let x in rooms){
                let row = tbody.insertRow(i);
                row.id = rooms[x].id;
                row.insertCell(0).innerHTML = rooms[x].id;
                row.insertCell(1).innerHTML = rooms[x].room_name;

                if ( rooms[x].photo1 == '') 
                    row.insertCell(2).innerHTML = ''; 
                else 
                    row.insertCell(2).innerHTML = "<img src='" + rooms[x].photo1 + "' height='100' width='100'  >";   

                if ( rooms[x].photo2 == '') 
                    row.insertCell(3).innerHTML = ''; 
                else 
                    row.insertCell(3).innerHTML = "<img src='" + rooms[x].photo2 + "' height='100' width='100'  >";   

                row.insertCell(4).innerHTML = rooms[x].min_person_capacity;
                row.insertCell(5).innerHTML = rooms[x].max_person_capacity;
                row.insertCell(6).innerHTML = "<button id='"+ rooms[x].id + "'  class='btn btn-info' onclick='ShowEditRoomForm(this.id)'> Edit </button>";
                row.insertCell(7).innerHTML = "<button id='"+ rooms[x].id + "'  class='btn btn-danger' onclick='deleteRoom(this.id)'> Delete </button>";
                
                i++;
            }
        }
    };

    xhr.open("GET", "http://localhost:8080/rooms/*");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}
function addRoom(){
    const form = document.getElementById("roomForm");
    
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    const json = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const name = document.getElementById("new_room_name").value;
            Notify("New Room Available : " + name + "!","*");
            document.getElementById("newRoom_msg").style.color = "green";
            document.getElementById("newRoom_msg").innerHTML = "Room Added";
            disable("btn_addRoom");
            enable("btn_addRoomOK");
        } else {
            let obj = JSON.parse(xhr.responseText);
            document.getElementById("newRoom_msg").style.color = "red";
            document.getElementById("newRoom_msg").innerHTML = obj.error;
        }
        makeVisible("newRoom_msg");
    };
    xhr.open("POST", "http://localhost:8080/room");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(json);
}
function deleteRoom(id){
    // const id = document.getElementById("room_id").value;
    // console.log(id);
    if (id == '') {
        document.getElementById("delete_room_msg").style.color = "red";
        document.getElementById("delete_room_msg").innerHTML = "You have to enter an id!";
    } else {

        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
            const obj = JSON.parse(xhr.responseText);
            // console.log(obj);
            if (xhr.status === 200) { 
                document.getElementById("room_msg").style.color = "greed";
                document.getElementById("room_msg").innerHTML = "room deleted";
                showRooms();
            } else {
                document.getElementById("room_msg").style.color = "red";
                document.getElementById("room_msg").innerHTML = obj.error;
            }
        };
    
        xhr.open("DELETE", "http://localhost:8080/room/" + id);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send();

    }
}
function editRoom(){
    document.getElementById("ed_room_id").disabled = false;
    const id = document.getElementById("ed_room_id").value;
    document.getElementById("ed_room_id").disabled = true;

    // console.log(id);
    const form = document.getElementById("edit_roomForm");
    
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    const json = JSON.stringify(data);
    
    // console.log(json);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            document.getElementById("newRoomEdit_msg").style.color = "green";
            document.getElementById("newRoomEdit_msg").innerHTML = "Room Info Updated";
            disable("btn_updateRoom");
            enable("btn_updateRoomOK");
        } else {
            let obj = JSON.parse(xhr.responseText);
            document.getElementById("newRoomEdit_msg").style.color = "red";
            document.getElementById("newRoomEdit_msg").innerHTML = obj.error;
        }
        makeVisible("newRoomEdit_msg");
    };
    xhr.open("PUT", "http://localhost:8080/room/" + id);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(json);
}
function ShowNewRoomForm(){
    document.getElementById("roomForm").reset();
    document.getElementById("newRoom_msg").innerHTML = "";
    makeAllHidden("addRoomForm");
    makeVisible("btn_cancel");
    enable("btn_addRoom");
    disable("btn_addRoomOK");
}
function ShowEditRoomForm(id){
    makeAllHidden("editRoomForm");
    makeVisible("btn_cancel");
    enable("btn_updateRoom");
    disable("btn_updateRoomOK");
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const obj = JSON.parse(xhr.responseText);
        if (xhr.status === 200) { 
            document.getElementById("ed_room_id").value = obj.data[0].id;
            document.getElementById("room_name").value = obj.data[0].room_name;
            document.getElementById("photo1").value = obj.data[0].photo1;
            document.getElementById("photo2").value = obj.data[0].photo2;
            document.getElementById("photo2").value = obj.data[0].photo2;
            document.getElementById("min_person_capacity").value = obj.data[0].min_person_capacity;
            document.getElementById("max_person_capacity").value = obj.data[0].max_person_capacity;
        
            document.getElementById("displ_photo1").src = obj.data[0].photo1;
            document.getElementById("displ_photo2").src = obj.data[0].photo2;
        }
    };

    xhr.open("GET", "http://localhost:8080/room/" + id);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
    // makeVisible("editRoomForm");
}


// Reservations
function showReservations() {
    makeAllHidden("reservations");
    // enable_btns("btn_reservs");

    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const obj = JSON.parse(xhr.responseText);
        const reserv = obj.data;
        if (xhr.status === 200) { 

            var table = document.getElementById("reservationsTable");
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
                
                if (reserv[x].status === 'requested') {
                    row.insertCell(7).innerHTML =   "<button id='a-"  + reserv[x].id + "'  class='btn btn-success' onclick='ChangeReservStatus(\"" + reserv[x].username + "\",\"" + reserv[x].room_name  + "\",\"" + reserv[x].id + "\", \"accepted\" )'> Accept </button> " + 
                                                    "<button id='na-" + reserv[x].id + "'  class='btn btn-danger'  onclick='ChangeReservStatus(\"" + reserv[x].username + "\",\"" + reserv[x].room_name  + "\",\"" + reserv[x].id + "\", \"declined\" )'> Decline </button>";    
                } else {
                    row.insertCell(7).innerHTML = reserv[x].status;      
                }
                
                // if ( reserv[x].status === 'done' || reserv[x].status === 'canceled' || reserv[x].status === 'declined' ) 
                //     row.insertCell(8).innerHTML = "<button id='na-" + reserv[x].id + "'  class='btn btn-danger'  onclick='DeleteReservation(\"" + reserv[x].id + "\" )'> Delete </button>";

                i++;
            }
        } else {
            console.log(obj.error);
        }
    }

    xhr.open("GET", "http://localhost:8080/reservation");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}
function ChangeReservStatus(username, room_name,id, new_status){

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200) {
            Notify('Your Request for room : ' + room_name + ' has been ' + new_status + '. Check your Booking!' , username);
            showReservations(); 
        } 
        else {
            console.log(xhr.responseText);
            let obj = JSON.parse(xhr.responseText);
            alert(obj.error);
        }
    };
    xhr.open("PUT", "http://localhost:8080/change-status/" + id + "/" + new_status );
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send();
}
function DeleteReservation(id){
    // console.log(id);
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const obj = JSON.parse(xhr.responseText);
        if (xhr.status === 200) { 
            showReservations();
        } else {
            alert(obj.error);
        }
    };
    
    xhr.open("DELETE", "http://localhost:8080/reservation/" + id);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}

//UI
function enable_btns(id){
    enable("btn_employees");
    enable("btn_rooms");
    enable("btn_logout");
    enable("btn_reservs");
    disable(id);
}

function makeAllHidden(id){
    makeHidden("btn_cancel");

    makeHidden("employees");
    makeHidden("addPersonForm");
    makeHidden("addEmployeeForm");
    makeHidden("editemployeeForm");
    makeHidden("rooms");
    makeHidden("addRoomForm");
    makeHidden("editRoomForm");
    makeHidden("reservations");

    makeVisible(id);
}