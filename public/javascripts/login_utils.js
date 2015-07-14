var formAjaxPptions = {
    success: fnt_showResponse
};
$(document).on('submit', 'form', function() {
    $(this).ajaxSubmit(formAjaxPptions);
    return false;
});
function fnt_showResponse(responseText, statusText, xhr, form) {
    var response = responseText;
    //response = JSON.parse(responseText);
    if (response.callback) {
        if (response.data) {
            window[response.callback](response.data);
        } else {
            window[response.callback](response);
        }
    }
    if (response.message) {
        if (response.status === 200) {
            sweetAlert({
                title: "\xc9xito",
                text: response.message,
                type: "success",
                timer: 4000
            });
            $(form).clearForm();
        } else {
            sweetAlert({
                title: "Error",
                text: response.message,
                type: "error",
                timer: 4000
            });
        }
    }
}

function redirectToApp () {
    window.location.href = "/";
}