function AdminLogin(){
    makeAllHidden('adminLogin');
}

function UserLogin(){
    makeAllHidden('userLogin');
}

function isAdmin(){
    var username = document.getElementById("a_username").value;
    var password = document.getElementById("a_password").value;

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        const data = JSON.parse(xhr.responseText);
        console.log(data);
        if ( xhr.status === 200) {
            document.getElementById("adm_msg").style.color = 'green';
            document.getElementById("adm_msg").innerHTML = 'Connected';
            window.location.href = './Admin.html';
        }else {
            document.getElementById("adm_msg").style.color = 'red';
            document.getElementById("adm_msg").innerHTML = 'Wrong Credentials';
        }
    };
    xhr.open("GET", "http://localhost:8080/is-admin?username=" + username + "&password=" + password );
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}

function isUser(){
    var username = document.getElementById("u_username").value;
    var password = document.getElementById("u_password").value;

    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        const data = JSON.parse(xhr.responseText);
        console.log(data);
        if ( xhr.status === 200) {
            document.getElementById("per_msg").style.color = 'green';
            document.getElementById("per_msg").innerHTML = 'Connected';
            sessionStorage.setItem('username',username);
            window.location.href = './Home.html';
        }else if ( xhr.status === 300 ) {
            document.getElementById("per_msg").style.color = 'red';
            document.getElementById("per_msg").innerHTML = 'Wrong Credentials';
        }
    };
    xhr.open("GET", "http://localhost:8080/is-user?username=" + username + "&password=" + password );
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}

function ShowRooms(){
    makeAllHidden("rooms");

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
                        '</div></div>';
            }
            document.getElementById("room_cards").innerHTML = html;
        }
    };

    xhr.open("GET", "http://localhost:8080/rooms/*" );
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}

function makeAllHidden(id){
    makeHidden("startbtn");
    makeHidden("adminLogin");
    makeHidden("userLogin");
    makeHidden("rooms");

    makeVisible(id);
}