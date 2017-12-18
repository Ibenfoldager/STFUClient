const SDK = {
    serverURL: "http://localhost:8080/api",
    request: (options, cb) => {


        let token = {
            "Authorization": localStorage.getItem("token")
        };

        //Asynchronous JavaScript And XML
        $.ajax({
            url: SDK.serverURL + options.url,
            method: options.method,
            headers: token,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(SDK.Encryption.encrypt(JSON.stringify(options.data))),
            success: (data, status, xhr) => {
                cb(null, SDK.Encryption.decrypt(data), status, xhr);
            },
            error: (xhr, status, errorThrown) => {
                cb({xhr: xhr, status: status, error: errorThrown});
            }
        });

    },

    Event: {

        //Make it possible to join a created event. Passes all the data to the server-side
        attendEvent: (idEvent, eventName, location, price, eventDate, description, cb) => {

            SDK.request({
                data: {
                    idEvent: idEvent,
                    eventName: eventName,
                    price: price,
                    location: location,
                    description: description,
                    eventDate: eventDate,
                },
                method: "POST",
                url: "/events/join"
            }, (err, data) => {

                cb(null, data);

            });

        },

        //Make it possible to delete one of the events you created yourself. Passes all the data to the server-side
        deleteEvent: (idEvent, eventName, location, price, eventDate, description, cb) => {
            SDK.request({
                data: {
                    idEvent: idEvent,
                    eventName: eventName,
                    price: price,
                    location: location,
                    description: description,
                    eventDate: eventDate,
                },
                method: "PUT",

                //Need to pass the concerned idEvent to the server
                url: "/events/" + idEvent + "/delete-event",
            }, cb);
        },

        //Find all events
        findAll: (cb, events) => {
            SDK.request({
                method: "GET",
                url: "/events",
                headers: {
                    filter: {
                        include: ["events"]
                    }
                }
            }, cb);
        },

        //Find all attending students for the specific event
        findAllAttendingStudents: (idEvent, cb) => {
            SDK.request({
                method: "GET",
                //Need to pass the concerned idEvent to the server
                url: "/events/" + idEvent + "/students",
            }, cb);
        },

        //The user can create an event. passes all the data to the server-side.
        createEvent: (eventName, price, location, description, eventDate, cb) => {
            SDK.request({
                data: {
                    eventName: eventName,
                    price: price,
                    location: location,
                    description: description,
                    eventDate: eventDate,
                },
                url: "/events",
                method: "POST"
            }, (err, data) => {

                if (err) return cb(err);

                SDK.Storage.persist("crypted", data);

                cb(null, data);

            });
        },

        //The user can update one of their own created events. passes all the data to the server-side.
        updateEvent: (eventName, price, location, description, eventDate, idEvent, cb) => {
            SDK.request({
                data: {
                    eventName: eventName,
                    price: price,
                    location: location,
                    description: description,
                    eventDate: eventDate,
                },

                //Need to pass the concerned idEvent to the server
                url: "/events/" + idEvent + "/update-event",
                method: "PUT"
            }, (err, data) => {

                if (err) return cb(err);

                SDK.Storage.persist("crypted", data);

                cb(null, data);

            });
        },

    },

    User: {
        //Finds the current student af pass it to the localStorage
        current: (cb) => {

            SDK.request({
                url: "/students/profile",
                method: "GET"
            }, (err, data) => {

                if (err) return cb(err);

                localStorage.setItem("idStudent", JSON.parse(data).idStudent);

                cb(null, data);
            });
        },

        //Logout the current student
        logOut: (cb) => {
            SDK.request({
                method: "POST",
                url: "/students/logout",
            }, (err, data) => {
                if (err) {
                    return cb(err);
                }

                cb(null, data);
            });
        },

        //Login methode. You can't access any other methods before loggin in.
        //Passes email and password to server-side
        login: (email, password, cb) => {
            SDK.request({
                data: {
                    email: email,
                    password: password
                },

                url: "/login",
                method: "POST"
            }, (err, data) => {


                if (err) return cb(err);

                //Gets the current student's token and store it in the localStorage
                localStorage.setItem("token", JSON.parse(data));


                cb(null, data);

            });
        },

        //New students can create an user. passes all the data to the server-side.
        createUser: (firstName, lastName, email, password, verifyPassword, cb) => {
            SDK.request({
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password,
                    verifyPassword: verifyPassword
                },
                url: "/register",
                method: "POST"
            }, (err, data) => {

                //On create error?
                if (err) return cb(err);

                SDK.Storage.persist("crypted", data);

                cb(null, data);
            });
        },

        //Find all the events the current student is attending in
        findAllAttendingEvents: (cb, events) => {
            SDK.request({
                method: "GET",
                //Get the students id from the localStorage
                url: "/students/" + localStorage.getItem("idStudent") + "/events",
                headers: {
                    filter: {
                        include: ["events"]
                    }
                }
            }, cb);
        },

        //Method fot loading the nav-bar and controlling whether is should show a 'logout' or 'login' button
        loadNav: (cb) => {
            $("#nav-container").load("nav.html", () => {
                var currentUser = null;
                SDK.User.current((error, res) => {
                    currentUser = res;

                    if (currentUser) {
                        $(".navbar-right").html(`
            <li><a href="#" id="logout-link">Logout</a></li>
          `);
                    } else {
                        $(".navbar-right").html(`
            <li><a href="login.html">Log-in <span class="sr-only">(current)</span></a></li>
          `);
                    }
                    //Removes the token and student id from the localStorage, when the log-out button is clicked
                    $("#logout-link").click(() => {
                        SDK.User.logOut((err, data) =>{
                         if (err && err.xhr.status === 401) {
                             $(".form-group").addClass("has-error");
                         } else {
                             localStorage.removeItem("token");
                             localStorage.removeItem("idStudent");
                             window.location.href = "login.html";
                         }

                        });
                    });

                });

                cb && cb();
            });
        }
    },

        //Storage method that make it possible to localstorage token, id and so
        Storage: {
            prefix: "EventStoreSDK",
            persist: (key, value) => {
                window.localStorage.setItem(SDK.Storage.prefix + key, (typeof value === 'object') ? JSON.stringify(value) : value)
            },
            load: (key) => {
                const val = window.localStorage.getItem(SDK.Storage.prefix + key);
                try {
                    return JSON.parse(val);
                }
                catch (e) {
                    return val;
                }
            },
            remove: (key) => {
                window.localStorage.removeItem(SDK.Storage.prefix + key);
            }
        },


    Encryption: {

        //Encrypt the values sent from the client to the server
        encrypt: (encrypt) => {
            if (encrypt !== undefined && encrypt.length !== 0) {
                const fields = ['J', 'M', 'F'];
                let encrypted = '';
                for (let i = 0; i < encrypt.length; i++) {
                    encrypted += (String.fromCharCode((encrypt.charAt(i)).charCodeAt(0) ^(fields[i % fields.length]).charCodeAt(0)))
                }
                return encrypted;
            } else {
                return encrypt;
            }
        },

        //Decrypt the methods received from the serverside
        decrypt: (decrypt) => {
         if (decrypt.length > 0 && decrypt !== undefined) {
             const fields = ['J', 'M', 'F'];
             let decrypted = '';
             for (let i = 0; i < decrypt.length; i++) {
                 decrypted += (String.fromCharCode((decrypt.charAt(i)).charCodeAt(0) ^(fields[i % fields.length]).charCodeAt(0)))
             }
             return decrypted;
         } else {
             return decrypt;
            }
        }
    },

        //Pass the url to the next window, for instance when updating event
        URL: {
            getParameterByName: (name) => {
                var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
                return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
            }
        }

};