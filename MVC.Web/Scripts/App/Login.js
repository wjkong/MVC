$(function () {
    var userName = getCookie("userName");

    if (userName != undefined && userName.length > 0) {
        $('#txtUsername').val(userName);

        $("#chkRememberMe").prop('checked', true);
    }

    $('#btnLogin').click(function () {
        $(this).ShowProgressIndicator();

        var username = $.trim($('#txtUsername').val());
        var password = $.trim($('#txtPassword').val());
        var response = grecaptcha.getResponse();

        if (username.length > 0 && password.length > 0 && response.length > 0) {
            var url = "Login.aspx/LoginUser";

            var param = "{ 'username': '{0}', 'password': '{1}', 'response': '{2}' }";
            param = param.format(username, password, response);
            var str = [];

            $.ajax({
                type: 'POST',
                url: url,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: param,
                success: OnSuccess,
                error: function (xhr, status, error) {
                    PopupValidation(error);
                },
                complete: function (xhr, status) {
                    grecaptcha.reset();
                    $('.progressIndicator').fadeOut(100).remove();
                }
            });
        }
        else {
            grecaptcha.reset();

            var str = [];

            if (username.length == 0)
                str.push("<span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span>Username is requried<br/>");

            if (password.length == 0)
                str.push("<span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span>Password is requried<br/>");

            if (response.length == 0)
                str.push("<span class='glyphicon glyphicon-exclamation-sign' aria-hidden='true'></span>ReCaptcha is requried<br/>");

            $('.progressIndicator').fadeOut(100).remove();

            PopupValidation(str.join(emptyStr));
        }
    });


});

function OnSuccess(data, status) {
    if (data.d == "OK") {
        if ($("#chkRememberMe").prop('checked')) {
            var username = $.trim($('#txtUsername').val());

            setCookie("userName", username);
        }

        window.location.href = "Member/MyPhoto.aspx";
    }
    else {
        PopupValidation("Invalid username and password");
    }
}

function PopupValidation(content) {
    $('#modalValidation .modal-body').html("<div class='alert alert-danger'>" + content + "</div>");
    $('#modalValidation').modal('show');
}