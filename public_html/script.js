$(document).ready(function () {

  $("#contact-form").validate({
    debug: true,
    errorClass: "alert alert-danger",
    errorLabelContainer: "#output-area",
    errorElement: "div",

    //rules for contact form info
    rules: {
      name: {
        required: true
      },
      year: {
        required: true
      },
      email: {
        email: true,
        required: false
      },
      message: {
        required: true,
        maxlength: 2000
      }
    },

//error messages
    messages: {
      name: {
        required: "Name is a required field",
      },
      year: {
        required: "This is a required field",
      },
      message: {
        required: "This is a required field",
        maxlength: "Message is too long!!"
      },
    },

    submitHandler: function (form) {
      $("#contact-form").ajaxSubmit({
        type: "POST",
        url: $('#contact-form').attr('action'),
        success: function (ajaxOutput) {
          $("#output-area").css("display", "")
          $("#output-area").html(ajaxOutput)

          if ($(".alert-success").length >= 1) {
            $("#contact-form")[0].reset()
          }
        }
      })
    }

  })

})