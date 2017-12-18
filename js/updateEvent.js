$(document).ready(() => {

    SDK.User.loadNav();

    //Function when the update-event button is clicked
    $("#update-event-button").click(() => {

        const eventName = $("#inputEventName").val();
        const price = $("#inputPrice").val();
        const location = $("#inputLocation").val();
        const description = $("#inputDescription").val();
        const eventDate = $("#inputEventDate").val();
        //Gets the event id with the url from the previous side
        const idEvent = SDK.URL.getParameterByName("eventId")

        //Pass the information about the new event
        SDK.Event.updateEvent(eventName, price, location, description, eventDate, idEvent, (err, data) => {
            if (err && err.xhr.status === 401) {
                $(".form-group").addClass("has-error")
            }
            else if (err){
                console.log("An error happened")
            } else {
                window.location.href = "profile.html";
            }
        });

    });

});


