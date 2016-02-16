$(function () {
    $('#btnTranslate').click(function (evt) {
        Refresh($(this));
    });

    $('#ddlLanguageTo').change(function (evt) {
        txtWords = $.trim($('#txtWords').val());

        if (txtWords.length > 0)
            Refresh($(this).prev());
    });


});

function Refresh(target) {
    var translatedWords = $('#divTranslatedWords');
    target.ShowProgressIndicator();

    var start = new Date().getTime();

//    $('.page-header').hide();
    $('.page-header-xs').hide().removeClass('visible-xs');
    var url = "http://api.mymemory.translated.net/get?q={0}&langpair={1}|{2}";

    var txtWords = $.trim($('#txtWords').val());

    if (txtWords.length == 0) {
        translatedWords.show();
        translatedWords.html("Please enter words you want to be translated.");
        $('.progressIndicator').fadeOut(100).remove();
        return false;
    }

    txtWords = encodeURI(txtWords.replace('&', space));

    if (txtWords.length > 400)
        txtWords = txtWords.subString(0, 400);

    url = url.format(txtWords, $('#ddlLanguageFrom').val(), $('#ddlLanguageTo').val());

    var objAjax = $.getJSON(url, function (data) {
        translatedWords.show();
        translatedWords.html(data.responseData.translatedText);
    });

    objAjax.error(function (status, error) {
        translatedWords.show();
        translatedWords.html(error);
    });

    objAjax.complete(function () {
        $('.progressIndicator').fadeOut(100).remove();

        var end = new Date().getTime();
        var time = ((end - start) * 0.001).toFixed(3);

        $('#resultInfo').html("Execution time: {0}s".format(time));
    });
}