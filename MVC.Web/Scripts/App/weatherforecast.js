var data;

$(function () {
    initialize('txtLocation');

    $('#btnForecast').click(function (evt) {
        Refresh($(this));
    });

    $("input[name=type]:radio").change(function () {
        Refresh($(this));
    });

    $('#ddlForecast').change(function (evt) {
        txtLocation = $.trim($('#txtLocation').val());

        if (txtLocation.length > 0)
            Refresh($(this).prev());
    });

    $('#txtLocation').keypress(function (e) {
        var code = e.keyCode || e.which;
        if (code === 13) {
            e.preventDefault();

            $('#btnForecast').click();
        }
    });


    $("#detail").on('click', '.glyphicon-plus', function () {
        $(this).removeClass('glyphicon-plus').addClass('glyphicon-minus');
    });

    $("#detail").on('click', '.glyphicon-minus', function () {
        $(this).removeClass('glyphicon-minus').addClass('glyphicon-plus');
    });
});

function Refresh(target) {
    var start = new Date().getTime();
    txtLocation = $.trim($('#txtLocation').val());
    if (txtLocation.length == 0) {
        $('.progressIndicator').fadeOut(100).remove();
        return false;
    }

    target.ShowProgressIndicator();

    var url = "http://api.worldweatheronline.com/free/v2/weather.ashx?q={0}&format=json&num_of_days=5&key=7f059d6f26f9a7440aa5a8c0fa5e0";


    $('.page-header').hide();
    $('.page-header-xs').hide().removeClass('visible-xs');

    txtLocation = encodeURI(txtLocation);

    url = url.format(txtLocation);

    var objAjax = $.getJSON(url, function (result) {
        current = result.data.current_condition[0];
        var imgIcon = "<img src='{0}' title='{1}' />";
        
        var temp = "{0} &#176;C | {1} &#176;F";

        $('#temperature').html(GetTemperture(current.temp_C, current.temp_F));
        $('#feelsLikeC').html(GetTemperture(current.FeelsLikeC, current.FeelsLikeF));
        $('#humidity').html(current.humidity + "%");
        $('#pressure').html(current.pressure + " mb");
        $('#visibility').html(current.visibility + " km");
        $('#windspeed').html(current.windspeedKmph + " km/h");
        $('#weatherDesc').html(current.weatherDesc[0].value);
        $('#location').html(result.data.request[0].query);
        $('#weatherIcon').html(imgIcon.format(current.weatherIconUrl[0].value, current.weatherDesc[0].value)); $('#panelForecast').show();
        $('#cloud').html(current.cloudcover + "%");
        $('#winddir').html(current.winddir16Point);

        var columnTitle = [space, "Date", "Min Temp.", "Max Temp.", "UV Index", "Sun Rise", "Sun Set"];
        var hiddenColumn = ["UV Index", "Sun Rise", "Sun Set"]

        var hourColumnTitle = ["Time", "Weather", "Condition", "Temperature", "Humidity", "Wind", "Cloud"];
        var hourHiddenColumn = ["Temperature", "Humidity", "Cloud", "Wind"]

        var str = [];

        str.push("<table class='table table-striped table-bordered table-hover'>");
        str.push("<tr>");

        $.each(columnTitle, function (index, header) {
            var hiddenClass = emptyStr;

            if ($.inArray(header, hiddenColumn) >= 0)
                hiddenClass = "hidden-xs";

            str.push("<th class='text-center text-info {0}'>".format(hiddenClass), header, "</th>");
        });
        str.push("</tr>");

        var collapseControl = "<span class='glyphicon glyphicon-plus' data-toggle='collapse' data-target='#forecastDate{0}' title='Show/Collapse hourly forecast'></span>";

        data = new google.visualization.DataTable();

        data.addColumn('string', 'Date');
        data.addColumn('number', 'Min Temperture');
        data.addColumn('number', 'Max Temperture');
        data.addRows(5);

        $.each(result.data.weather, function (index, forecast) {
            var dateF = new Date(forecast.date).mmdd();

            str.push("<tr>");
            str.push("<td class=text-center>", collapseControl.format(index), "</td>");
            str.push("<td class=text-left>", GetDayOfWeek(forecast.date), space, dateF, "</td>");
            str.push("<td>", GetTemperture(forecast.mintempC, forecast.mintempF), "</td>");
            str.push("<td>", GetTemperture(forecast.maxtempC, forecast.maxtempF), "</td>");
            str.push("<td class=hidden-xs>", forecast.uvIndex, "</td>");
            str.push("<td class=hidden-xs>", forecast.astronomy[0].sunrise, "</td>");
            str.push("<td class=hidden-xs>", forecast.astronomy[0].sunset, "</td>");
            str.push("</tr>");
            str.push("<tr class=collapse id='forecastDate", index, "'><td colspan=7><table class='table table-striped table-hover'>");

            str.push("<tr>");

            data.setCell(index, 0, dateF);
            data.setCell(index, 1, GetTemperture(forecast.mintempC, forecast.mintempF, true));
            data.setCell(index, 2, GetTemperture(forecast.maxtempC, forecast.maxtempF, true));


            $.each(hourColumnTitle, function (index, header) {
                var hiddenClass = emptyStr;

                if ($.inArray(header, hourHiddenColumn) >= 0)
                    hiddenClass = "hidden-xs";

                str.push("<th class='text-left {0}'>".format(hiddenClass), header, "</th>");
            });
            str.push("</tr>");

            $.each(forecast.hourly, function (index, forecastHour) {
                str.push("<tr>");
                str.push("<td  class=text-left>", forecastHour.time * 0.01, ":00", "</td>");
                str.push("<td  class=text-left>", imgIcon.format(forecastHour.weatherIconUrl[0].value, forecastHour.weatherDesc[0].value), "</td>");
                str.push("<td  class=text-left>", forecastHour.weatherDesc[0].value, "</td>");
                str.push("<td  class='text-left hidden-xs'>", GetTemperture(forecastHour.tempC, forecastHour.tempF), "</td>");
                str.push("<td  class='text-left hidden-xs'>", forecastHour.humidity, "%", "</td>");
                str.push("<td  class='text-left hidden-xs'>", forecastHour.windspeedKmph, " km/h", "</td>");
                str.push("<td  class='text-left hidden-xs'>", forecastHour.cloudcover, "%", "</td>");
                str.push("</tr>");
            });

            str.push("</table></td></tr>");
        });

        str.push("</table>");

        $('#detail').html(str.join(emptyStr));

        drawChart(data);
    });

    objAjax.error(function (status, error) {
        $('.progressIndicator').fadeOut(100).remove();
        alert(error);
    });

    objAjax.complete(function () {
        $('.progressIndicator').fadeOut(100).remove();

        var end = new Date().getTime();
        var time = ((end - start) * 0.001).toFixed(3);

        $('#resultInfo').html("Execution time: {0}s".format(time));
    });
}

function GetTemperture(tempC, tempF, onlyNumber) {
    var temp = tempC
    if (onlyNumber == undefined || onlyNumber == false)
        temp  += " &#176;C";

    var selected = $("input[type='radio'][name='type']:checked");
    if (selected.length > 0) {
        tempType = selected.val();

        if (tempType == "fahrenheit") {
            temp = tempF

            if (onlyNumber == undefined || onlyNumber == false)
                temp += " &#176;F";
        }
    }

    return temp;
}

function drawChart(data) {
    var options = {
        title: '5 Days Weather Forecast in ' + $("input[type='radio'][name='type']:checked").val(),
        curveType: 'function',
        legend: { position: 'bottom' }
    };

    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

    chart.draw(data, options);
}