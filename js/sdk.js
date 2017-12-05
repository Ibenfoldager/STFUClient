const SDK = {
    serverURL: "http://localhost:8080/api",
    request: (options, cb) => {


        let token = {
            "Authorization": localStorage.getItem("token")
        };

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
                url: "/events/" + idEvent + "/delete-event",
            }, cb);
        },

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

        findAllAttendingStudents: (idEvent, cb) => {
            SDK.request({
                method: "GET",
                url: "/events/" + idEvent + "/students",
            }, cb);
        },

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

        updateEvent: (eventName, price, location, description, eventDate, idEvent, cb) => {
            SDK.request({
                data: {
                    eventName: eventName,
                    price: price,
                    location: location,
                    description: description,
                    eventDate: eventDate,
                },
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
        findAll: (cb) => {
            SDK.request({method: "GET", url: "/staffs"}, cb);
        },
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

        login: (email, password, cb) => {
            SDK.request({
                data: {
                    email: email,
                    password: password
                },
                //url: "/users/login?include=user",
                url: "/login",
                method: "POST"
            }, (err, data) => {

                //On login-error
                if (err) return cb(err);


                localStorage.setItem("token", JSON.parse(data));


                cb(null, data);

            });
        },

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

        findAllAttendingEvents: (cb, events) => {
            SDK.request({
                method: "GET",
                url: "/students/" + localStorage.getItem("idStudent") + "/events",
                headers: {
                    filter: {
                        include: ["events"]
                    }
                }
            }, cb);
        },

        loadNav: (cb) => {
            $("#nav-container").load("nav.html", () => {
                var currentUser = null;
                SDK.User.current((error, res) => {
                    currentUser = res;


                    console.log(currentUser);

                    if (currentUser) {
                        $(".navbar-right").html(`
            <li><a href="#" id="logout-link">Logout</a></li>
          `);
                    } else {
                        $(".navbar-right").html(`
            <li><a href="login.html">Log-in <span class="sr-only">(current)</span></a></li>
          `);
                    }
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


        URL: {
            getParameterByName: (name) => {
                var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
                return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
            }
        }

};