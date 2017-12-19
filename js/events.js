$(document).ready(() => {

  SDK.User.loadNav();

    const $eventList = $("#event-list");
    const $attendingStudents = $("#attending-students")

   // Find all events and store the in a panel from bootstrap
  SDK.Event.findAll((cb, events) => {
    events = JSON.parse(events);
    events.forEach((event) => {
      const eventHtml = `
      <div class="col-xs-4 event-container">
      <div class="panel panel-default">
      <div class="panel-heading">
      <h3 class="panel-title">${event.eventName}</h3>
      </div>
       <div class="col-lg-8">
         <dl>
          <dt style="margin-top: 10px">Description</dt>
          <dd>${event.description}</dd>
          <dt>Owner</dt>
          <dd>${event.owner}</dd>
          <dt>Date</dt>
          <dd>${event.eventDate}
          <dt>Location</dt>
          <dd>${event.location}</dd>
          <dt>Price</dt>
          <dd>${event.price}</dd>
            <button class="btn attend-button" style="background: #008DD5" data-event-id="${event.idEvent}"><span style="color: #ffffff;">Attend event</span></button> 
            <button class="btn all-attending-students" style="background: #008DD5;" data-toggle="modal" data-target="#attendingStudents" data-attending-event-id="${event.idEvent}"><span style="color: #ffffff;">Attending students</span></button>
          </dl>
         </div>
        </div>
       `;

      $eventList.append(eventHtml)

    });

    //The function behind the attend-button
    $(".attend-button").click(function(){

      //Store the id of the event to send to the server
      const idEvent = $(this).data("event-id");
      const event = events.find((event) => event.idEvent === idEvent);

      console.log(event);

      SDK.Event.attendEvent(idEvent, event.eventName, event.location, event.price, event.eventDate, event.description, (err, data) =>{
        if (err && err.xhr.status === 401) {
          $(".form-group").addClass("has-error")
        }
        else if (err){
          console.log("An error happened")
            window.alert("Something happened - try to join the event again")
        } else {
          window.location.href = "profile.html";
        }


      })

    });

    //See all attending events
    $(".all-attending-students").click(function(){
      var idEvent = $(this).data("attending-event-id")

        //Gets students on the specific event id
        SDK.Event.findAllAttendingStudents(idEvent, (cb, students) => {
          if(students){
            students = JSON.parse(students);
            students.forEach((student) => {

              //Shows the student in a modal fra bootstrap
                const attendHtml = `
        <tr>
        <td>${student.firstName}</td> 
        <td>${student.lastName}</td>
         </tr>`;

         $attendingStudents.append(attendHtml)

            });
          } else {
            window.alert("No one is attending")
          }
        });
      });
    });

  $("#close").click(function () {
    $("#attending-students").html("");

  });

  });


