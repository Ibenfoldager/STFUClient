const SDK = {
  serverURL: "http://localhost:8080/api",
  request: (options, cb) => {

/*    let headers = {};
    if (options.headers) {
      Object.keys(options.headers).forEach((h) => {
        headers[h] = (typeof options.headers[h] === 'object') ? JSON.stringify(options.headers[h]) : options.headers[h];
      });
    }
*/
    let token = {
      "Authorization":localStorage.getItem("token")
    }

    $.ajax({
      url: SDK.serverURL + options.url,
      method: options.method,
      headers: token,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(options.data),
      success: (data, status, xhr) => {
        cb(null, data, status, xhr);
      },
      error: (xhr, status, errorThrown) => {
        cb({xhr: xhr, status: status, error: errorThrown});
      }
    });

  },
  Event: {
    addToAttendingEvents: (event) => {

      SDK.request({
          method: "POST",
          url: "/events/join"

      });

      let mineEvents = SDK.Storage.load("mineEvents");

      //Has anything been added to mine events before?
      if (!mineEvents) {
        return SDK.Storage.persist("mineEvents", [{
          count: 1,
          event: event
        }]);
      }

      //Does the event already exist?
      let foundEvent = mineEvents.find(e => e.event.id === event.id);
      if (foundEvent) {
        let i = mineEvents.indexOf(foundEvent);
        mineEvents[i].count++;
      } else {
        mineEvents.push({
          count: 1,
          event: event
        });
      }

      SDK.Storage.persist("mineEvents", event);
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

  },

  Order: {
    create: (data, cb) => {
      SDK.request({
        method: "POST",
        url: "/orders",
        data: data,
        headers: {authorization: SDK.Storage.load("tokenId")}
      }, cb);
    },
    findMine: (cb) => {
      SDK.request({
        method: "GET",
        url: "/orders/" + SDK.User.current().id + "/allorders",
        headers: {
          authorization: SDK.Storage.load("tokenId")
        }
      }, cb);
    }
  },
  User: {
    findAll: (cb) => {
      SDK.request({method: "GET", url: "/staffs"}, cb);
    },
    current: (cb) => {

        SDK.request({
            url:"/students/profile",
            method:"GET"
        }, (err, data) => {

          if (err) return cb(err);

          cb(null,data);
        });
    },
    logOut: () => {
   /*   SDK.Storage.remove("tokenId");
      SDK.Storage.remove("userId");
      SDK.Storage.remove("user");  */
      localStorage.removeItem("token");
      window.location.href = "login.html";
    },

    login: (email, password, cb) => {
      SDK.request({
        data: {
          email: email,
          password: password
        },
        //url: "/users/login?include=user",
          url:"/login",
        method: "POST"
      }, (err, data) => {

        //On login-error
        if (err) return cb(err);

        localStorage.setItem("token", data);


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
            $("#logout-link").click(() => SDK.User.logOut());

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
  }
};