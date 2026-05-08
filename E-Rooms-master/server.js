const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("./e-rooms.db", sqlite.OPEN_READWRITE, (err) => {
    if (err) return console.log(err);
});

db.run( `CREATE TABLE IF NOT EXISTS Administrator ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            FirstName TEXT, 
            LastName TEXT, 
            username TEXT, 
            password TEXT, 
            email TEXT 
        );
`);

db.run( `CREATE TABLE IF NOT EXISTS Employee ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            position TEXT, 
            FirstName TEXT, 
            LastName TEXT, 
            gender TEXT, 
            email TEXT, 
            phone_number INTEGER, 
            country TEXT, 
            city TEXT, 
            zip_code INTEGER, 
            address TEXT 
        ); 
`);

db.run( `CREATE TABLE IF NOT EXISTS Person ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            username TEXT, 
            password TEXT, 
            employee_id INTEGER 
        ); 
`);

db.run( `CREATE TABLE IF NOT EXISTS Room ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            room_name TEXT, 
            photo1 TEXT, 
            photo2 TEXT, 
            min_person_capacity INTEGER, 
            max_person_capacity INTEGER 
        ); 
`);

db.run(`
    CREATE TABLE IF NOT EXISTS Reservation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER,
        room_name TEXT,
        username TEXT,
        fromDate TEXT,
        toDate TEXT,
        ConfirmationNumber INTEGER,
        status TEXT
    );

    UPDATE Reservation
    SET status =
        CASE
            WHEN status = 'accepted' AND date('now') >= fromDate AND date('now') <= toDate THEN 'active'
            WHEN status = 'active' AND date('now') > toDate THEN 'done'
            ELSE status
        END;
`);

db.run( `CREATE TABLE IF NOT EXISTS Review ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            room_id INTEGER, 
            username TEXT, 
            review_text TEXT, 
            date TEXT 
        ); 
`);

db.run( `CREATE TABLE IF NOT EXISTS Notification (  
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            notification_text TEXT, 
            toUsername TEXT, 
            date TEXT 
        );
`);

const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500'); // Replace with your client's domain
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

function generateRandomString(length) {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var randomString = '';
    
    for (var i = 0; i < length; i++) {
        var randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    
    return randomString;
}

let sql ;

app.use(bodyParser.json());
app.use(cors());

app.get("/room-popularity", (req,res) => {
    sql = "SELECT Room.room_name AS room_name, COUNT(Reservation.id) AS reservations FROM Room LEFT JOIN Reservation ON Room.id = Reservation.room_id GROUP BY Room.id, Room.room_name;";
    try {   
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.log(sql);
                console.log(err);
                return res.status(300).json({status : 300, success : false, error : err});
            }
            if ( rows.length < 1) 
                return res.status(300).json({status : 300, success : false, error : "No match"});

            return res.status(200).json({status : 200, data : rows, success : true});
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status : 400, success : false});
    }
});

//Administrator
app.get("/admin", (req,res) => {
    sql = "SELECT * FROM Administrator";
    try {   
        const url = require('url');
        const queryObject = url.parse(req.url, true).query;
        if (queryObject.username && queryObject.password) {
            sql += " WHERE username = '?' and password = '?'";
        }
        db.all(sql, [queryObject.username,queryObject.password], (err, rows) => {
            if (err) {
                console.log(sql);
                console.log(err);
                return res.status(300).json({status : 300, success : false, error : err});
            }
            if ( rows.length < 1) 
                return res.status(300).json({status : 300, success : false, error : "No match"});

            return res.status(200).json({status : 200, data : rows, success : true});
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status : 400, success : false});
    }
});

app.get("/is-admin", (req,res) => {
    const url = require("url");
    const queryObject = url.parse(req.url, true).query;
    const sql = "SELECT * FROM Administrator WHERE username = ? AND password = ?";
    const params = [queryObject.username, queryObject.password];
    
    db.all(sql, params, (err, rows) => {
    if (err) {
        console.log(sql);
        console.log(err);
        return res.status(300).json({ status: 300, success: false, error: err });
    }
    if (rows.length < 1) {
        return res.status(204).json({ status: 204, success: false, error: "No match" });
    }
    return res.status(200).json({ status: 200, data: rows, success: true });
    });
});

app.post('/admin', (req,res) => {
    try {
        const { FirstName, LastName, username, password, email } = req.body;

        sql = "SELECT * FROM Administrator WHERE username = ?";
        db.get(sql, [username], (err, row) => {
            if (err) 
                return res.status(300).json({ status: 300, success: false, error: err });

            if (row) 
                return res.status(300).json({ status: 300, success: false, error: "Username already exists" }); 
            else {
                sql = "INSERT INTO Administrator(FirstName, LastName, username, password, email) VALUES (?,?,?,?,?)";
                db.run(sql, [FirstName, LastName, username, password, email], (err) => {
                    if (err) {
                        return res.status(300).json({ status: 300, success: false, error: err });
                    }
                    console.log('Successfully inserted new Administrator');
                    return res.status(200).json({ status: 200, success: true });
                });
            }
        });
    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});

app.put('/admin/:id', (req, res) => {
    try {
        const id = req.params.id;
        const { FirstName, LastName, username, password, email } = req.body;

        const selectSql = "SELECT * FROM Administrator WHERE id = ?";
        db.get(selectSql, [id], (err, row) => {
            if (err) {
                return res.status(500).json({ status: 500, success: false, error: "Failed to check if record exists" });
            }

            if (!row) {
                return res.status(404).json({ status: 404, success: false, error: "Id not found" });
            }

            const emailSelectSql = "SELECT * FROM Administrator WHERE email = ? AND id != ?";
            db.get(emailSelectSql, [email, id], (err, row) => {
                if (err) {
                    return res.status(500).json({ status: 500, success: false, error: "Failed to check if email exists" });
                }

                if (row) {
                    return res.status(400).json({ status: 400, success: false, error: "Email already exists in another administrator record" });
                }

                const updateSql = "UPDATE Administrator SET FirstName = ?, LastName = ?, username = ?, password = ?, email = ? WHERE id = ?";
                db.run(updateSql, [FirstName, LastName, username, password, email, id], (err) => {
                    if (err) {
                        return res.status(500).json({ status: 500, success: false, error: "Failed to update record" });
                    }
                    console.log(`Successfully updated administrator with id ${id}`);
                    return res.status(200).json({ status: 200, success: true });
                });
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: 400, success: false });
    }
});

app.delete('/admin/:id', (req, res) => {
    try {
        const id = req.params.id;

        const selectSql = "SELECT * FROM Administrator WHERE id = ?";
        db.get(selectSql, [id], (err, row) => {
            if (err) {
                return res.status(500).json({ status: 500, success: false, error: "Failed to check if record exists" });
            }

            if (!row) {
                return res.status(404).json({ status: 404, success: false, error: "Id not found" });
            }

            const deleteSql = "DELETE FROM Administrator WHERE id = ?";
            db.run(deleteSql, [id], (err) => {
                if (err) {
                    return res.status(500).json({ status: 500, success: false, error: "Failed to delete record" });
                }
                console.log(`Successfully deleted administrator with id ${id}`);
                return res.status(200).json({ status: 200, success: true });
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: 400, success: false });
    }
});

//Employee  
app.get("/employee", (req,res) => {
    sql = "SELECT * FROM Employee";
    try {   
        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(300).json({status : 300, success : false, error : err});
            }
            if ( rows.length < 1) {
                return res.status(300).json({status : 300, success : false, error : "No match"});
            }
            return res.status(200).json({status : 200, data : rows, success : true});
        });
    } catch (error) {
        console.log(error);
        return res.json({ status : 400, success : false, });
    }
});

app.get("/employee_person", (req,res) => {
    sql = "SELECT Employee.*, Person.username, Person.password  FROM Employee LEFT JOIN Person ON Employee.id = Person.employee_id";
    try {   
        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(300).json({status : 300, success : false, error : err});
            }
            if ( rows.length < 1) {
                return res.status(204).json({status : 204, success : false, error : "No match"});
            }
            return res.status(200).json({status : 200, data : rows, success : true});
        });
    } catch (error) {
        console.log(error);
        return res.json({ status : 400, success : false, });
    }
});

app.get("/employee/:id", (req,res) => {
    const id = req.params.id;
    sql = "SELECT * FROM Employee WHERE id = ?";
    try {   
        db.all(sql, [id], (err, rows) => {
            if (err) {
                return res.status(300).json({status : 300, success : false, error : err});
            }
            if ( rows.length < 1) {
                return res.status(300).json({status : 300, success : false, error : "No match"});
            }
            return res.status(200).json({status : 200, data : rows, success : true});
        });
    } catch (error) {
        console.log(error);
        return res.json({ status : 400, success : false, });
    }
});

app.post('/employee', (req,res) => {
    try {
        const {position, FirstName, LastName, gender, email, phone_number, country, city, zip_code, address} = req.body;

        sql = "SELECT * FROM Employee WHERE email = ?";
        db.get(sql, [email], (err, row) => {
            if (err) 
                return res.status(300).json({ status: 300, success: false, error: err });

            if (row) 
                return res.status(300).json({ status: 300, success: false, error: "Email already exists" }); 
            else {
                sql = "INSERT INTO Employee(position, FirstName, LastName, gender, email, phone_number, country, city, zip_code, address) VALUES (?,?,?,?,?,?,?,?,?,?)"
                db.run(sql, [position, FirstName, LastName, gender, email, phone_number, country, city, zip_code, address], (err) => {
                    if (err) 
                        return res.status(300).json({ status: 300, success: false, error: err });
                    console.log('Successfully inserted new Employee');
                    return res.status(200).json({ status: 200, success: true });
                });
            }
        });
    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});

app.put('/employee/:id', (req, res) => {
    try {
        const id = req.params.id;
        const { position, FirstName, LastName, gender, email, phone_number, country, city, zip_code, address } = req.body;

        sql = "SELECT * FROM Employee WHERE id = ?";
        db.get(sql, [id], (err, row) => {
            if (err) {
                return res.status(300).json({ status: 300, success: false, error: err });
            }

            if (!row) {
                return res.status(404).json({ status: 404, success: false, error: "Employee not found" });
            }

            sql = "SELECT * FROM Employee WHERE email = ? AND id != ?";
            db.get(sql, [email, id], (err, row) => {
                if (err) {
                    return res.status(300).json({ status: 300, success: false, error: err });
                }

                if (row) {
                    return res.status(300).json({ status: 300, success: false, error: "Email already exists in another employee" });
                }

                sql = "UPDATE Employee SET position = ?, FirstName = ?, LastName = ?, gender = ?, email = ?, phone_number = ?, country = ?, city = ?, zip_code = ?, address = ? WHERE id = ?";
                db.run(sql, [position, FirstName, LastName, gender, email, phone_number, country, city, zip_code, address, id], (err) => {
                    if (err) {
                        return res.status(300).json({ status: 300, success: false, error: err });
                    }
                    console.log(`Successfully updated Employee with id ${id}`);
                    return res.status(200).json({ status: 200, success: true });
                });
            });
        });

    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});

app.delete('/employee/:id', (req, res) => {
    try {
        const id = req.params.id;

        sql = "SELECT * FROM Employee WHERE id = ?";
        db.get(sql, [id], (err, row) => {
            if (err) {
                return res.status(300).json({ status: 300, success: false, error: err });
            }

            if (!row) {
                return res.status(404).json({ status: 404, success: false, error: "Employee not found" });
            }

            sql = "SELECT id FROM Person WHERE employee_id = ?";
            db.get(sql, [id], (err, row) => {
                if (err) {
                    return res.status(300).json({ status: 300, success: false, error: err });
                }
                if (row) {
                    sql = "DELETE FROM Person WHERE id = ?";
                    db.run(sql, [row.id], (err) => {
                        if (err) {
                            return res.status(300).json({ status: 300, success: false, error: err });
                        }
                        console.log(`Successfully deleted Person with id ${row.id}`);
                    });
                }
            });

            sql = "DELETE FROM Employee WHERE id = ?";
            db.run(sql, [id], (err) => {
                if (err) {
                    return res.status(300).json({ status: 300, success: false, error: err });
                }
                console.log(`Successfully deleted Employee with id ${id}`);
                return res.status(200).json({ status: 200, success: true });
            });
        });
    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});

//Person    
app.get("/person", (req,res) => {
    sql = "SELECT * FROM Person";
    try {   
        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(300).json({status : 300, success : false, error : err});
            }
            if ( rows.length < 1) {
                return res.status(300).json({status : 300, success : false, error : "No match"});
            }
            return res.status(200).json({status : 200, data : rows, success : true});
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status : 400, success : false, });
    }
});

app.get("/is-user", (req,res) => {
    const url = require("url");
    const queryObject = url.parse(req.url, true).query;
    const sql = "SELECT * FROM Person WHERE username = ? AND password = ?";
    const params = [queryObject.username, queryObject.password];
    
    db.all(sql, params, (err, rows) => {
    if (err) {
        console.log(sql);
        console.log(err);
        return res.status(300).json({ status: 300, success: false, error: err });
    }
    if (rows.length < 1) {
        return res.status(300).json({ status: 300, success: false, error: "No match" });
    }
    return res.status(200).json({ status: 200, data: rows, success: true });
    });
});

app.get("/userInfo/:username", (req,res) => {

    const username = req.params.username; 
    const sql = "SELECT Employee.*, Person.password FROM Employee JOIN Person ON Employee.id = Person.employee_id WHERE Person.username = ?";
    
    db.all(sql, [username], (err, rows) => {
    if (err) {
        console.log(sql);
        console.log(err);
        return res.status(300).json({ status: 300, success: false, error: err });
    }
    if (rows.length < 1) {
        return res.status(300).json({ status: 300, success: false, error: "No match" });
    }
    return res.status(200).json({ status: 200, data: rows, success: true });
    });
});

app.post('/person', (req,res) => {
    try {
        const { username, password, employee_id } = req.body;

        sql = "SELECT * FROM Person WHERE username = ?";
        db.get(sql, [username], (err, row) => {
            if (err) {
                return res.status(300).json({ status: 300, success: false, error: err });
            }

            if (row) {
                return res.status(409).json({ status: 409, success: false, error: "Username already exists" });
            }

            sql = "INSERT INTO Person(username, password, employee_id) VALUES (?,?,?)"
            db.run(sql, [username, password, employee_id], (err) => {
                if (err) {
                    return res.status(300).json({ status: 300, success: false, error: err });
                }
                console.log('Successful input', username, password, employee_id);
                return res.status(200).json({ status: 200, success: true });
            });
        });
    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});

app.put('/person/:id', (req, res) => {
    try {
        const id = req.params.id;
        const { username, password, employee_id } = req.body;

        sql = "SELECT * FROM Person WHERE id = ?";
        db.get(sql, [id], (err, row) => {
            if (err) {
                return res.status(300).json({ status: 300, success: false, error: err });
            }

            if (!row) {
                return res.status(404).json({ status: 404, success: false, error: "Person not found" });
            }

            sql = "SELECT * FROM Person WHERE username = ? AND id != ?";
            db.get(sql, [username, id], (err, row) => {
                if (err) {
                    return res.status(300).json({ status: 300, success: false, error: err });
                }

                if (row) {
                    return res.status(409).json({ status: 409, success: false, error: "Username already exists" });
                }

                sql = "UPDATE Person SET username = ?, password = ?, employee_id = ? WHERE id = ?";
                db.run(sql, [username, password, employee_id, id], (err) => {
                    if (err) {
                        return res.status(300).json({ status: 300, success: false, error: err });
                    }
                    console.log(`Successfully updated Person with id ${id}`);
                    return res.status(200).json({ status: 200, success: true });
                });
            });
        });
    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});

app.delete('/user/:username', (req, res) => {
    try {
        const username = req.params.username;

        sql = "SELECT * FROM Person WHERE username = ?";
        db.get(sql, [username], (err, row) => {
            if (err) {
                return res.status(300).json({ status: 300, success: false, error: err });
            }

            if (!row) {
                return res.status(404).json({ status: 404, success: false, error: "User not found" });
            }

            sql = "DELETE FROM Person WHERE username = ?";
            db.run(sql, [username], (err) => {
                if (err) {
                    return res.status(300).json({ status: 300, success: false, error: err });
                }
                console.log(`Successfully deleted Person with username ${username}`);
                return res.status(200).json({ status: 200, success: true });
            });
        });
    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});

//Room
app.get("/rooms/:persons", async (req, res) => {
    const persons = req.params.persons;
    const url = require("url");
    const queryObject = url.parse(req.url, true).query;

    if (persons == "*") sql = "SELECT * FROM Room";
    else sql = "SELECT * FROM Room WHERE min_person_capacity <= " + persons + " AND max_person_capacity >= " + persons;

    try {
        const rows = await new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                resolve(rows);
            });
        });

        if (rows.length < 1) {
            return res.status(300).json({ status: 300, success: false, error: "No match" });
        }
        if (queryObject.fromDate && queryObject.toDate) {
            let array = [];
            for (let x in rows) {
                let sql2 = 'SELECT * FROM Reservation WHERE room_id = ? AND status != "done" AND status != "canceled" AND fromDate <= ? AND toDate >= ?';
                const dates = await new Promise((resolve, reject) => {
                    db.all(sql2, [rows[x].id, queryObject.toDate, queryObject.fromDate], (err, dates) => {
                        if (err) {
                            console.log('err2 : ' + err);
                            reject(err);
                        }
                        resolve(dates);
                    });
                });
                if (dates.length > 0) {
                    array.push(rows[x].id);
                }
            }
            for (x in array ){
                for (room in rows){
                    if (rows[room].id == array[x])
                        rows.splice(room,1);
                }
            }
        } 
        return res.status(200).json({ status: 200, data: rows, success: true });
    } catch (error) {
        console.log(error);
        return res.json({ status: 400, success: false });
    }
});


app.get("/room/:id", (req,res) => {
    const id = req.params.id;
    sql = "SELECT * FROM Room WHERE id = ?";
    try {   
        db.all(sql, [id], (err, rows) => {
            if (err) {
                return res.status(300).json({status : 300, success : false, error : err});
            }
            if ( rows.length < 1) {
                return res.status(300).json({status : 300, success : false, error : "No match"});
            }
            return res.status(200).json({status : 200, data : rows, success : true});
        });
    } catch (error) {
        console.log(error);
        return res.json({ status : 400, success : false, });
    }
});

app.post('/room', (req,res) => {
    try {
        console.log(req.body.username);
        const {room_name,photo1,photo2,min_person_capacity,max_person_capacity } = req.body;
        sql = "INSERT INTO Room(room_name,photo1,photo2,min_person_capacity,max_person_capacity) VALUES (?,?,?,?,?)"
        db.run(sql, [room_name,photo1,photo2,min_person_capacity,max_person_capacity], (err) => {
            if (err) {
                return res.status(300).json({status : 300, success : false, error : err});
            }
            console.log('successful input', room_name,photo1,photo2,min_person_capacity,max_person_capacity);
        });
        return res.status(200).json({ status : 200, success : true, });
    } catch (error) {
        return res.status(400).json({ status : 400, success : false, });
    }
});

app.put('/room/:id', (req, res) => {
    try {
        const id = req.params.id;
        const { room_name, photo1, photo2, min_person_capacity, max_person_capacity } = req.body;

        sql = "SELECT * FROM Room WHERE id = ?";
        db.get(sql, [id], (err, row) => {
            if (err) {
                return res.status(300).json({ status: 300, success: false, error: err });
            }

            if (!row) {
                return res.status(404).json({ status: 404, success: false, error: "Room not found" });
            }

            sql = "SELECT * FROM Room WHERE room_name = ? AND id != ?";
            db.get(sql, [room_name, id], (err, row) => {
                if (err) {
                    return res.status(300).json({ status: 300, success: false, error: err });
                }

                if (row) {
                    return res.status(409).json({ status: 409, success: false, error: "Room name already exists" });
                }

                sql = "UPDATE Room SET room_name = ?, photo1 = ?, photo2 = ?, min_person_capacity = ?, max_person_capacity = ? WHERE id = ?";
                db.run(sql, [room_name, photo1, photo2, min_person_capacity, max_person_capacity, id], (err) => {
                    if (err) {
                        return res.status(300).json({ status: 300, success: false, error: err });
                    }
                    console.log(`Successfully updated Room with id ${id}`);
                    return res.status(200).json({ status: 200, success: true });
                });
            });
        });
    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});

app.delete('/room/:id', (req, res) => {
    try {
        const id = req.params.id;

        sql = "SELECT * FROM Room WHERE id = ?";
        db.get(sql, [id], (err, row) => {
            if (err) {
                return res.status(300).json({ status: 300, success: false, error: err });
            }

            if (!row) {
                return res.status(404).json({ status: 404, success: false, error: "Room not found" });
            }

            sql = "DELETE FROM Room WHERE id = ?";
            db.run(sql, [id], (err) => {
                if (err) {
                    return res.status(300).json({ status: 300, success: false, error: err });
                }
                console.log(`Successfully deleted Room with id ${id}`);
                return res.status(200).json({ status: 200, success: true });
            });
        });
    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});

//Notifications
app.get("/notification", (req,res) => {
    sql = "SELECT * FROM Notification";
    try {   
        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(300).json({status : 300, success : false, error : err});
            }
            if ( rows.length < 1) {
                return res.status(300).json({status : 300, success : false, error : "No match"});
            }
            return res.status(200).json({status : 200, data : rows, success : true});
        });
    } catch (error) {
        console.log(error);
        return res.json({ status : 400, success : false, });
    }
});

app.get("/notification/:username", (req,res) => {
    const username = req.params.username;
    sql = "SELECT * FROM Notification WHERE toUsername = ? OR toUsername = '*' ORDER BY id DESC ";
    try {   
        db.all(sql, [username], (err, rows) => {
            if (err) {
                return res.status(300).json({status : 300, success : false, error : err});
            }
            if ( rows.length < 1) {
                return res.status(300).json({status : 300, success : false, error : "No match"});
            }
            return res.status(200).json({status : 200, data : rows, success : true});
        });
    } catch (error) {
        console.log(error);
        return res.json({ status : 400, success : false, });
    }
});

app.post('/notification', (req,res) => {
    try {
        console.log(req.body.username);
        const {notification_text,toUsername,date } = req.body;
        sql = "INSERT INTO Notification(notification_text,toUsername,date) VALUES (?,?,?)"
        db.run(sql, [notification_text,toUsername,date], (err) => {
            if (err) return res.status(300).json({status : 300, success : false, error : err});
            console.log('successful input Notification :', notification_text,toUsername,date);
        });
        return res.status(200).json({ status : 200, success : true, });
    } catch (error) {
        return res.status(400).json({ status : 400, success : false, });
    }
});

app.delete('/notification/:id', (req, res) => {
    try {
        const id = req.params.id;

        sql = "SELECT * FROM Notification WHERE id = ?";
        db.get(sql, [id], (err, row) => {
            if (err) {
                return res.status(300).json({ status: 300, success: false, error: err });
            }

            if (!row) {
                return res.status(404).json({ status: 404, success: false, error: "Notification not found" });
            }

            sql = "DELETE FROM Notification WHERE id = ?";
            db.run(sql, [id], (err) => {
                if (err) {
                    return res.status(300).json({ status: 300, success: false, error: err });
                }
                console.log(`Successfully deleted Notification with id ${id}`);
                return res.status(200).json({ status: 200, success: true });
            });
        });
    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});

//Reservation
app.get("/reservation", (req,res) => {
    sql = "SELECT * FROM Reservation";
    try {   
        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(300).json({status : 300, success : false, error : err});
            }
            if ( rows.length < 1) {
                return res.status(300).json({status : 300, success : false, error : "No match"});
            }
            return res.status(200).json({status : 200, data : rows, success : true});
        });
    } catch (error) {
        console.log(error);
        return res.json({ status : 400, success : false, });
    }
}); 

app.get("/reservation/:username", (req,res) => {
    const username = req.params.username;
    sql = "SELECT * FROM Reservation WHERE username = ?";
    try {   
        db.all(sql, [username], (err, rows) => {
            if (err) {
                return res.status(300).json({status : 300, success : false, error : err});
            }
            if ( rows.length < 1) {
                return res.status(300).json({status : 300, success : false, error : "No match"});
            }
            return res.status(200).json({status : 200, data : rows, success : true});
        });
    } catch (error) {
        console.log(error);
        return res.json({ status : 400, success : false, });
    }
}); 

app.get("/occupied-days/:room_id", (req,res) => {
    const room_id = req.params.room_id;
    sql = "SELECT fromDate as start, toDate as end, '#FF0000' as color FROM Reservation WHERE room_id = ? AND  status != 'done' AND status != 'declined' AND status != 'canceled' ";
    try {   
        db.all(sql, [room_id], (err, rows) => {
            if (err) {
                return res.status(300).json({status : 300, success : false, error : err});
            }
            if ( rows.length < 1) {
                return res.status(300).json({status : 300, success : false, error : "No match"});
            }
            return res.status(200).json({status : 200, data : rows, success : true});
        });
    } catch (error) {
        console.log(error);
        return res.json({ status : 400, success : false, });
    }
});

app.post('/reservation', (req,res) => {
    try {
        console.log(req.body.username);
        const {room_id ,room_name,username,fromDate,toDate,ConfirmationNumber,status} = req.body;
        sql = "INSERT INTO Reservation(room_id,room_name,username,fromDate,toDate,ConfirmationNumber,status) VALUES (?,?,?,?,?,?,?)"
        db.run(sql, [room_id ,room_name,username,fromDate,toDate,ConfirmationNumber,status], (err) => {
            if (err) return res.status(300).json({status : 300, success : false, error : err});
            console.log('successful input', room_id,room_name,username,fromDate,toDate,ConfirmationNumber,status);
        });
        return res.status(200).json({ status : 200, success : true, });
    } catch (error) {
        return res.status(400).json({ status : 400, success : false, });
    }
});

app.post('/request-reservation', (req,res) => {
    try {
        const {room_id ,room_name,username,fromDate,toDate,ConfirmationNumber,status} = req.body;
        sql = 'SELECT * FROM Reservation WHERE room_id = ? AND  status != "done" AND status != "canceled" AND fromDate <= ? AND toDate >= ?';
        db.all(sql,[room_id,toDate,fromDate],(err,rows) => {
            if (err) {
                console.log('err1 : ' + err);
                return res.status(300).json({ status: 300, success: false, error: err });
            }
            if (rows.length > 0) {
                return res.status(400).json({ status: 400, success: false, error: "Invalid Dates" });
            } else {
                console.log("No reservation found for the specified date period.");
                sql = "INSERT INTO Reservation(room_id,room_name,username,fromDate,toDate,ConfirmationNumber,status) VALUES (?,?,?,?,?,?,?)"
                db.run(sql, [room_id ,room_name,username,fromDate,toDate,ConfirmationNumber,status], (err) => {
                    if (err) return res.status(300).json({status : 300, success : false, error : err});
                    console.log('successful input', room_id,room_name,username,fromDate,toDate,ConfirmationNumber,status);
                });
                return res.status(200).json({ status : 200, success : true, });
            }
        });
    } catch (error) {
        return res.status(400).json({ status : 400, success : false, });
    }
});

app.put('/reservation/:reservation_id', (req, res) => {
    try {
        const id = req.params.reservation_id;
        console.log(id);
        const {room_id ,room_name,username,fromDate,toDate,ConfirmationNumber,status} = req.body;

        sql = "SELECT * FROM Reservation WHERE id = ?";
        db.get(sql, [id], (err, row) => {
            console.log(sql);
            if (err) {
                return res.status(300).json({ status: 300, success: false, error: err });
            }

            if (!row) {
                return res.status(404).json({ status: 404, success: false, error: "Reservation not found" });
            }

            sql = "UPDATE Reservation SET room_id = ?, room_name = ?, username = ?, fromDate = ?, toDate = ?, ConfirmationNumber = ?, status = ? WHERE id = ?";
            db.run(sql, [room_id ,room_name,username,fromDate,toDate,ConfirmationNumber,status, id], (err) => {
                console.log(sql);
                if (err) {
                    console.log(err);
                    return res.status(300).json({ status: 300, success: false, error: err });
                }
                console.log(`Successfully updated Reservation with id ${id}`);
                return res.status(200).json({ status: 200, success: true });
            });
        });
    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});

app.put('/change-status/:reservation_id/:new_status', (req, res) => {
    try {
        const id = req.params.reservation_id;
        const new_status = req.params.new_status;

        const accepted_status = ["requested", "accepted", "declined", "active", "done", "canceled"];

        
        if (!accepted_status.includes(new_status)) 
            return res.status(400).json({ status: 400, success: false, error: "Invalid Status" }); 

        sql = "SELECT * FROM Reservation WHERE id = ?";
        db.get(sql, [id], (err, row) => {
            console.log(sql);
            if (err) {
                return res.status(300).json({ status: 300, success: false, error: err });
            }

            if (!row) {
                return res.status(404).json({ status: 404, success: false, error: "Reservation not found" });
            }
            if (new_status === 'accepted') {
                sql = "UPDATE Reservation SET status = ?, ConfirmationNumber = \'" + generateRandomString(10) + "\' WHERE id = ?"; 
            } else sql = "UPDATE Reservation SET status = ? WHERE id = ?";
            db.run(sql, [new_status,id], (err) => {
                console.log(sql);
                if (err) {
                    console.log(err);
                    return res.status(300).json({ status: 300, success: false, error: err });
                }
                console.log(`Successfully updated status to ${new_status} Reservation with id ${id}`);
                return res.status(200).json({ status: 200, success: true });
            });
        });
    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});

app.delete('/reservation/:reservation_id', (req, res) => {
    try {
        const id = req.params.reservation_id;
        sql = "SELECT * FROM Reservation WHERE id = ?";
        db.get(sql, [id], (err, row) => {
            if (err) {
                return res.status(300).json({ status: 300, success: false, error: err });
            }

            if (!row) {
                return res.status(404).json({ status: 404, success: false, error: "Reservation not found" });
            }

            sql = "DELETE FROM Reservation WHERE id = ?";
            db.run(sql, [id], (err) => {
                if (err) {
                    return res.status(300).json({ status: 300, success: false, error: err });
                }
                console.log(`Successfully deleted Reservation with id ${id}`);
                return res.status(200).json({ status: 200, success: true });
            });
        });
    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});


//Review  
app.get("/review", (req,res) => {
    sql = "SELECT * FROM Review";
    try {   
        db.all(sql, [], (err, rows) => {
            if (err) {
                return res.status(300).json({status : 300, success : false, error : err});
            }
            if ( rows.length < 1) {
                return res.status(300).json({status : 300, success : false, error : "No match"});
            }
            return res.status(200).json({status : 200, data : rows, success : true});
        });
    } catch (error) {
        console.log(error);
        return res.json({ status : 400, success : false, });
    }
});
app.get("/review/:room_id", (req,res) => {
    const room_id = req.params.room_id;
    sql = "SELECT * FROM Review WHERE room_id = ? ";
    try {   
        db.all(sql, [room_id], (err, rows) => {
            if (err) {
                return res.status(300).json({status : 300, success : false, error : err});
            }
            if ( rows.length < 1) {
                return res.status(300).json({status : 300, success : false, error : "No Reviews"});
            }
            return res.status(200).json({status : 200, data : rows, success : true});
        });
    } catch (error) {
        console.log(error);
        return res.json({ status : 400, success : false, });
    }
});

app.post('/review', (req,res) => {
    try {
        console.log(req.body.username);
        const {room_id,username,review_text,date} = req.body;
        sql = "SELECT id FROM Review WHERE username = ? AND room_id = ?"
        db.all(sql, [username,room_id], (err,rows) => {
            if (err) return res.status(300).json({status : 300, success : false, error : err});

            if (rows.length > 0) {
                return res.status(400).json({ status: 400, success: false, error: "Review Already Exists" });
            } else {
                console.log("No review found.");
                sql = "INSERT INTO Review(room_id,username,review_text,date ) VALUES (?,?,?,?)"
                db.run(sql, [room_id,username,review_text,date ], (err) => {
                    if (err) return res.status(300).json({status : 300, success : false, error : err});
                    console.log('successful input', room_id,username,review_text,date );
                });
                return res.status(200).json({ status : 200, success : true, });
            }
        });

    } catch (error) {
        return res.status(400).json({ status : 400, success : false, });
    }
});

app.put('/review/:review_id', (req, res) => {
    try {
        const id = req.params.id;
        if ( isExist("Review", id) ) {
            const {room_id,username,review_text,date} = req.body;
            sql = "UPDATE Review SET room_id = ?,username = ?,review_text = ? ,date = ? WHERE id = ?";
            db.run(sql, [room_id,username,review_text,date, id], (err) => {
                if (err) {
                    return res.status(300).json({ status: 300, success: false, error: err });
                }
                console.log(`Successfully updated Review with id ${id}`);
                return res.status(200).json({ status: 200, success: true });
            });
        } else return res.status(300).json({ status: 300, success: false, error: "not found id" });
    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});

app.delete('/review/:review_id', (req, res) => {
    try {
        const id = req.params.id;
        if ( isExist("Review", id) ) {
            sql = "DELETE FROM Review WHERE id = ?";
            db.run(sql, [id], (err) => {
                if (err) {
                    return res.status(300).json({ status: 300, success: false, error: err });
                }
                console.log(`Successfully deleted Review with id ${id}`);
                return res.status(200).json({ status: 200, success: true });
            });
        } else return res.status(300).json({ status: 300, success: false, error: "not found id" });
    } catch (error) {
        return res.status(400).json({ status: 400, success: false });
    }
});

app.listen(8080, () => console.log("E-Rooms Server is running on http://localhost:8080"));

