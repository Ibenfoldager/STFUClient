$(document).ready(() => {

  SDK.User.loadNav();
  //const currentUser = SDK.User.current();
    const $eventList = $("#event-list");
    const $attendingStudents = $("#attending-students")

  /*$(".page-header").html(`
    <h1>Hi, ${currentUser.firstName} ${currentUser.lastName}</h1>
  `);*/


  SDK.Event.findAll((cb, events) => {
    events = JSON.parse(events);
    events.forEach((event) => {
      const eventHtml = `
      <div class="col-lg-4 event-container">
      <div class="panel panel-default">
      <div class="panel-heading">
      <h3 class="panel-title">${event.eventName}</h3>
  </div>
       <div class="col-lg-8">
         <dl>
          <dt>Description</dt>
          <dd>${event.description}</dd>
          <dt>Owner</dt>
          <dd>${event.owner}</dd>
          <dt>Date</dt>
          <dd>${event.eventDate}
          <dt>Location</dt>
          <dd>${event.location}</dd>
          </dl>
         </div>
        </div>
        <div class=""panel-footer">
            <div class="row"
            <div class="col-lg-4 price-label">
            <p>Kr. <span class="price-amount">${event.price}</span></p>
            </div>
        <button class="col-lg-8 tex-right">
        <button class="btn attend-button" data-event-id="${event.idEvent}">Attend event</button>
        <button class="btn all-attending-students" data-toggle="modal" data-target="#attendingStudents" data-attending-event-id="${event.idEvent}">Attending students</button>
             </div>
        </div>
       </div>
       </div>
       </div>`;

      $eventList.append(eventHtml)

    });

    $(".attend-button").click(function(){

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

    $(".all-attending-students").click(function(){
      var idEvent = $(this).data("attending-event-id")


        SDK.Event.findAllAttendingStudents(idEvent, (cb, students) => {
          if(students){
            students = JSON.parse(students);
            students.forEach((student) => {

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


