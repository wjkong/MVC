var currencyValue = ["USD", "CAD", "EUR", "CNY", "AUD", "JPY", "HKD", "INR", "JMD", "ZAR", "MXN"];
var currencyText = ["U.S. Dollars", "Canadian Dollars", "Euros", "Chinese Yuan", "Australian Dollars", "Japan Yen", "Hong Kong Dollars", "Indian Rupees", "Jamaican Dollars", "South African Rands", "Mexican Pesos"];

$(function () {
    var resultRow = $('#divResult');
    var amount = $('#txtAmount');

    resultRow.hide();

    $.each(currencyValue, function (index, value) {
        var text = "{0} ({1})".format(currencyText[index], value);
        var option = new Option(value, value);
        $(option).html(text);

        var newOption = new Option(value, value);
        $(newOption).html(text);

        $('#ddlFromCurrency').append(option);
        $('#ddlToCurrency').append(newOption);
    });

    $('#ddlToCurrency').val('CAD');

    $('#btnConvert').click(function (evt) {
        if ($(this).text() == 'Convert') {
            $(this).ShowProgressIndicator();

            var fromCurrency = $('#ddlFromCurrency').val();
            var toCurrency = $('#ddlToCurrency').val();
            var amt = (amount.val().length == 0 || isNaN(amount.val())) ? zero : amount.val();

            if (fromCurrency == toCurrency)
                return false;

            $(this).text("Startover");

            $('#txtAmount, #ddlFromCurrency, #ddlToCurrency').attr('disabled', 'true');

            resultRow.show();

            GetRate(fromCurrency, toCurrency, amt);
            amount.val(FormatCurrency(amount.val()));
        }
        else {
            $(this).text("Convert");
            $('#txtAmount, #ddlFromCurrency, #ddlToCurrency').removeAttr('disabled');

            amount.val(amount.val().formatNumber());
            resultRow.hide();
        }
    }); // end btnCalculate click event

});

function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
}


function GetRate(fromCurrency, toCurrency, amt) {
    var url = "http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.xchange where pair in ({0})&format=json&env=store://datatables.org/alltableswithkeys";
    var str = [];

    $.each(currencyValue, function (index, value) {
        if (value != fromCurrency)
            str.push(singleQuote + fromCurrency + value + singleQuote);
    });

    url = encodeURI(url.format(str.join(comma)));

    var objAjax = $.getJSON(url, function (data) {
//        $('.page-header').hide();
        $('.page-header-xs').hide().removeClass('visible-xs');

        var columnTitle = ["From Currency", "To Currency", "Exchange Rate", "Yield Amount"];
        var rates = data.query.results.rate;
        var items = [];
        var i = 0;

        var result = "Converting {0} {1} to {2} will yield {3} {2}. <br/> (Exchange rate = {4} at {5} on {6})";
        var str = [];

        str.push("<table class='table table-striped'>");
        str.push("<tr>");

        $.each(columnTitle, function (index, value) {
            str.push("<th>", value, "</th>");
        });

        str.push("</tr>");

        var rateEffected = "Effected Rate on {0}";

        $.each(rates, function (index, rate) {
            if (rate.id == fromCurrency + toCurrency) {
                rateEffected = rateEffected.format(rate.Date);
                str.push("<tr class=success>");
            }
            else {
                str.push("<tr>");
            }

            var convertedCurrency = rate.id.replace(fromCurrency, emptyStr);

            str.push("<td>", FormatCurrency(amt) + space + fromCurrency, "</td>");
            str.push("<td>", $('#ddlToCurrency option[value=' + convertedCurrency + ']').text(), "</td>");
            str.push("<td>", rate.Rate, "</td>");
            str.push("<td>", FormatCurrency(amt * rate.Rate) + " " + convertedCurrency, "</td>");
            str.push("</tr>");
        });

        str.push("</table>");

        var info = "<div class='row text-info'><div class=col-sm-6>Powered by Yahoo Financial API</div><div class='col-sm-6 text-right'>{0}</div></div>".format(rateEffected);

        $('#detail').html(info + str.join(emptyStr));
    });

    objAjax.complete(function () {
        $('.progressIndicator').fadeOut(100).remove();
    });
}