$(document).ready(() => {

  SDK.User.loadNav();

  $("#login-button").click(() => {

    const email = $("#inputEmail").val();
    const password = $("#inputPassword").val();

    SDK.User.login(email, password, (err, data) => {
      if (err && err.xhr.status === 401) {
        $(".form-group").addClass("has-error");
      }
      else if (err){
        console.log("An error happened")
      } else {
        window.location.href = "index.html";
      }
    });

  });

    $("#create-button").click(() => {

        const firstName = $("#inputFirstName").val();
        const lastName = $("#inputLastName").val();
        const emailCreate = $("#inputEmailCreate").val();
        const passwordCreate = $("#inputPasswordCreate").val();
        const verifyPassword = $("#inputVerifyPassword").val();

        SDK.User.createUser(firstName,lastName, emailCreate, passwordCreate,verifyPassword, (err, data) => {
            if (err && err.xhr.status === 401) {
                $(".form-group").addClass("has-error")
            }
            else if (err){
                console.log("An error happened")
            } else {
                window.location.href = "index.html";
            }
        });

    });

});