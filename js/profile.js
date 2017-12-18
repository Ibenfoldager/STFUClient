$(document).ready(() => {

    SDK.User.loadNav();

    const $attendEventList = $("#attending-event-tbody");
    const $ownEventList = $("#created-event-tbody");


    SDK.User.current((error, res) => {
        var currentStudent = JSON.parse(res);
        //Prints the firstname, lastname and email of the current student
        currentID = $("#velkommen").html(`
              <h3>Hi, ${currentStudent.firstName}</h3>
              <h3>Lastname: ${currentStudent.lastName}</h3>
              <h3>Email: ${currentStudent.email}</h3>
            `)

        //Find all the events that the student has created and pass the to a tabel
        SDK.Event.findAll((cb, events) => {
            events = JSON.parse(events);
            events.forEach((event) => {
                if (currentStudent.idStudent === event.owner) {
                    let eventHtml = `
                    <tr>
                        <td>${event.eventName}</td>
                        <td>${event.location}</td>
                        <td>${event.description}</td>
                        <td>${event.eventDate}</td>
                        <td><button class="btn-danger deleteEvent" data-delete-event-id=${event.idEvent}>Delete</button></td>
                        <td><a href="updateEvent.html?eventId=${event.idEvent}"><button class="btn-success update-event">Update</button></a></td>                
                    </tr>
                    `;
                    $ownEventList.append(eventHtml);
                }


            });


            //Delete function
            $(".deleteEvent").click(function () {
                //Gets the id from the event
                const idEvent = $(this).data("delete-event-id");
                const event = events.find((event) => event.idEvent === idEvent);

                console.log(event);

                //Pass the information about the event you want to delete
                SDK.Event.deleteEvent(idEvent, event.eventName, event.location, event.price, event.eventDate, event.description, (err, data) => {
                    if (err && err.xhr.status === 401) {
                        $(".form-group").addClass("has-error")
                    }
                    else if (err) {
                        console.log("An error happened")
                        window.alert("Something happened - try to delete the event again")
                    } else {
                        window.location.href = "profile.html";
                    }


                })

            });

        });

        //Find all the events that the student is attending in
        SDK.User.findAllAttendingEvents((cb, events) => {
            events = JSON.parse(events);
            events.forEach((event) => {
                let eventHtml = `
                   <tr>
                    <td>${event.owner}</td>
                    <td>${event.eventName}</td>
                    <td>${event.location}</td>
                    <td>${event.description}</td>
                    <td>${event.eventDate}</td>
                    </tr>
                   `;
                $attendEventList.append(eventHtml);
            })
        });

    });

});


