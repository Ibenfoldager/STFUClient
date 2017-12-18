$(document).ready(() => {

  SDK.User.loadNav();

  //Login function when the login button is clicked
  $("#login-button").click(() => {

      //Gets the inputs from the textboxes
    const email = $("#inputEmail").val();
    const password = $("#inputPassword").val();

    //Pass the users email og passwords from the inputs in the textboxes
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

  //Function if the create button is clicked
    $("#create-button").click(() => {

        //Gets the inputs from the textboxes
        const firstName = $("#inputFirstName").val();
        const lastName = $("#inputLastName").val();
        const emailCreate = $("#inputEmailCreate").val();
        const passwordCreate = $("#inputPasswordCreate").val();
        const verifyPassword = $("#inputVerifyPassword").val();

        //Pass the inputs from the textboxes
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