$(document).ready(() => {

    SDK.User.loadNav();
    const $ownEventList = $("#created-event-tbody");


    SDK.User.current((error, res) => {
        var currentStudent = JSON.parse(res);
        //console.log(currentStudent);
        currentID = $("#velkommen").html(`
              <h1>Hi, ${currentStudent.firstName}</h1>
              <h1>Lastname: ${currentStudent.lastName}</h1>
              <h1>Email: ${currentStudent.email}</h1>
            `)

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
                        <td><button class="btn-danger">SLET</button></td>
                    </tr>
                    `;
                    $ownEventList.append(eventHtml);
                }

            });
        });

    })


    const $modalTbody = $("#basket-tbody");
    const $checkoutActions = $("#checkout-actions");
    const $nothingInBasketContainer = $("#nothing-in-basket-container");


    /* $(".profile-info").html(`
     <dl>
         <dt>Name</dt>
         <dd>${currentUser.firstName} ${currentUser.lastName}</dd>
         <dt>Email</dt>
         <dd>${currentUser.email}</dd>
         <dt>ID</dt>
         <dd>${currentUser.id}</dd>
      </dl>
   `); */

    /*
        SDK.Event.findAll((err, orders) => {
            if(err) throw err;
            orders.forEach(order => {
                $basketTbody.append(`
            <tr>
                <td>${order.id}</td>
                <td>${parseOrderItems(order.orderItems)}</td>
                <td>kr. ${sumTotal(order.orderItems)}</td>
            </tr>
          `);
            });
        });

        function parseOrderItems(items){
            return items.map(item => {
                return item.count + " x " + item.bookInfo.title
            }).join(", ");
        }

        function sumTotal(items){
            let total = 0;
            items.forEach(item => {
                total += item.count * item.bookInfo.price
            });
            return total;
        }

        */

    function loadBasket() {
        //const currentUser = SDK.User.current();
        const basket = SDK.Storage.load("basket") || [];
        let total = 0;

        $nothingInBasketContainer.show();

        if (!basket.length) {
            $("#checkout-table-container").hide();
        } else {
            $nothingInBasketContainer.hide();
        }

        basket.forEach(entry => {
            let subtotal = entry.book.price * entry.count;
            total += subtotal;
            $modalTbody.append(`
        <tr>
            <td>
                <img src="${entry.book.imgUrl}" height="120"/>
            </td>
            <td>${entry.book.title}</td>
            <td>${entry.count}</td>
            <td>kr. ${entry.book.price}</td>
            <td>kr. ${subtotal}</td>
        </tr>
      `);
        });

        $modalTbody.append(`
      <tr>
        <td colspan="3"></td>
        <td><b>Total</b></td>
        <td>kr. ${total}</td>
      </tr>
    `);

        /*if (currentUser) {
          $checkoutActions.append(`
          <button class="btn btn-success btn-lg" id="checkout-button">Checkout</button>
        `);
        }
        else {
          $checkoutActions.append(`

        `);
        }*/
    }

    loadBasket();

    $("#clear-basket-button").click(() => {
        SDK.Storage.remove("basket");
        loadBasket();
    });

    $("#checkout-button").click(() => {
        const basket = SDK.Storage.load("basket");
        SDK.Order.create({
            createdById: SDK.User.current().id,
            orderItems: basket.map(orderItem => {
                return {
                    count: orderItem.count,
                    bookId: orderItem.book.id
                }
            })
        }, (err, order) => {
            if (err) throw err;
            $("#order-alert-container").find(".alert-success").show();
            SDK.Storage.remove("basket");
            loadBasket();
            $nothingInBasketContainer.hide();
        });
    });

});