$(document).ready(() => {

  SDK.User.loadNav();
  //const currentUser = SDK.User.current();
    const $eventList = $("#event-list");

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
        <button class="btn btn-success attend-button" data-event-id="${event.id}">Attend event</button>
             </div>
        </div>
       </div>
       </div>
       </div>`;

      $eventList.append(eventHtml)

    });

    $(".attend-button").click(function(){

      const eventId = $(this).data("event-id");
      const event = events.find((event) => event.id === eventId);
window.alert(eventId);
      SDK.Event.addToAttendingEvents(event);



    });

  });

  $("#attend-modal").on("shown.es.modal", () => {
    const mineEvents = SDK.Storage.load("mineEvents");
    const $modalTbody = $("#modal-tbodyody");
    mineEvents.forEach((entry) => {
      $modalTbody.append(`
      <tr>
      <td>${entry.event.eventName}</td>
      <td>${entry.count}</td>
      <td>kr. ${entry.event.price}</td>
      <td>kr. 0</td>
      </tr>
      
      `)
    });
  });
});