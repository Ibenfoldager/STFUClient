$(document).ready(() => {

    SDK.User.loadNav();

    $("#create-event-button").click(() => {

        const eventName = $("#inputEventName").val();
        const price = $("#inputPrice").val();
        const location = $("#inputLocation").val();
        const description = $("#inputDescription").val();
        const eventDate = $("#inputEventDate").val();

        SDK.Event.createEvent(eventName, price, location, description, eventDate, (err, data) => {
            if (err && err.xhr.status === 401) {
                $(".form-group").addClass("has-error")
            }
            else if (err){
                console.log("An error happened")
            } else {
                window.location.href = "events.html";
            }
        });

    });

});