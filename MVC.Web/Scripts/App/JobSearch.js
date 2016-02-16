var totalResults;
var componentForm = {
    country: 'short_name',
    administrative_area_level_1: 'short_name',
    locality: 'long_name',
    postal_code: 'short_name'
};


function fillInAddress() {
    // Get the place details from the autocomplete object.
    var place = autocomplete.getPlace();

    for (var component in componentForm) {
        document.getElementById(component).value = emptyStr;
    }

    // Get each component of the address from the place details
    // and fill the corresponding field on the form.
    for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            document.getElementById(addressType).value = val;
        }
    }
}

$(function () {
    initialize('txtCity');

    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        fillInAddress();
    });

    var objAjax = $.getJSON("http://jsonip.com?callback=?", function (data) {
        $('#hidIpAddress').val(data.ip);
    });

    $('#btnNext').click(function () {
        var currentPage = $('#hidCurrentPage').val();
        currentPage++;

        ResetCurrentPage($(this), currentPage);
    });

    $('#btnPrev').click(function () {
        var currentPage = $('#hidCurrentPage').val();
        currentPage--;

        ResetCurrentPage($(this), currentPage);
    });

    $('#btnSearch, #btnDone').click(function () {
        ResetCurrentPage($(this));
    });


    $('#ddlPageSize').change(function () {
        ResetCurrentPage($(this).prev());
    });

    $('#txtQuery').keypress(function (e) {
        var code = e.keyCode || e.which;
        if (code === 13) {
            e.preventDefault();

            $('#btnSearch').click();
        }
    });

    $('.pagination').on('click', 'a', function () {
        var currentPage = $(this).text();

        ResetCurrentPage($(this).parent().parent(), currentPage);
    });

    $('.pagination').on('click', 'a', function () {
        var currentPage = $(this).text();

        ResetCurrentPage($(this).parent().parent(), currentPage);
    });

    $('#modalMap').on('shown.bs.modal', function (e) {
        var map;
        var element = $(e.relatedTarget);
        var latitude = element.data("latitude");
        var longitude = element.data("longitude");

        var myCenter = new google.maps.LatLng(latitude, longitude);

        var marker = new google.maps.Marker({
            position: myCenter
        });

        var mapProp = {
            center: myCenter,
            zoom: 15,
            //draggable: false,
            //scrollwheel: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("map-canvas"), mapProp);
        marker.setMap(map);


        $('#modalMap').find('.modal-title').html(element.text());

        google.maps.event.trigger(map, 'resize');
    });
});

function ResetCurrentPage(target, pageIndex) {
    if (typeof pageIndex === 'undefined') {
        pageIndex = 1;
    }

    $('#hidCurrentPage').val(pageIndex);

    Refresh(target);
}

function Refresh(target) {
    var start = new Date().getTime();

    var userAgent = encodeURI(navigator.userAgent);
    var userIp = $('#hidIpAddress').val();

    var query = $('#txtQuery').val();
    var state = $('#administrative_area_level_1').val();
    var city = $('#locality').val();
    var country = $('#country').val();
    var sort = query.length > 0 ? "relevance" : "date";
    var pageSize = $('#ddlPageSize').val();
    var startIndex = ($('#hidCurrentPage').val() - 1) * 10;

    var radius = $('#ddlRadius').val();
    var siteType = $('#ddlSiteType').val();
    var jobType = $('#ddlJobType').val();
    var fromAge = $('#ddlFromAge').val();


    var url = "http://localhost:39725/route/service/getjob";
    var param = "{ 'query': '{0}', 'country': '{1}', 'state': '{2}', 'city': '{3}', 'startIndex': '{4}', 'pageSize': '{5}', 'sort': '{6}', 'radius': '{7}', 'siteType': '{8}', 'jobType': '{9}', 'fromAge': '{10}', 'userIp': '{11}', 'userAgent': '{12}'}";
    param = param.format(query, country, state, city, startIndex, pageSize, sort, radius, siteType, jobType, fromAge, userIp, userAgent);

    var str = [];
    var i = 0;
    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: param,
        beforeSend: function (xhr) {
            if (target != null)
                target.ShowProgressIndicator();
        },
        success: OnSuccess,
        error: function (xhr, status, error) {
            alert(status);
        },
        complete: function (xhr, status) {
            if (target != null) {
                $('.progressIndicator').fadeOut(100).remove();
            }

            var end = new Date().getTime();
            var time = ((end - start) * 0.001).toFixed(3);

            $('#resultInfo').html("Total results: {0}; Execution time: {1}s".format(totalResults, time));
        }
    });
}

function OnSuccess(data, status) {
    $('.page-header').hide();
    $('.page-header-xs').hide().removeClass('visible-xs');

    $('#btnPrev, #btnNext').show();

    var jsonData = JSON.parse(data)
    var str = [];

    var tableHeaders = ["Job Title", "Company", "Job Description", "Location", "Published"];
    var hiddenColumn = ["Job Description", "Location", "Published"]
    var linkedTitle = "<a target=_blank href={0}>{1}</a>";

    str.push("<table class='table table-striped table-bordered table-hover'>");
    str.push("<tr>");

    $.each(tableHeaders, function (index, header) {
        var hiddenClass = emptyStr;

        if ($.inArray(header, hiddenColumn) >= 0)
            hiddenClass = "hidden-xs";

        str.push("<th class='text-center {0}'>".format(hiddenClass), header, "</th>");
    });

    str.push("</tr>");

    totalResults = jsonData.totalResults;
    var pageSize = $('#ddlPageSize').val();

    var totalNumOfPages = Math.floor(totalResults / pageSize);

    if (totalResults % pageSize != 0)
        totalNumOfPages++;

    BuildNavBar(totalNumOfPages);

    var s = "<td data-latitude='{0}' data-longitude='{1}' class='map text-info hidden-xs' data-toggle='modal' data-target='#modalMap'><span class='glyphicon glyphicon-map-marker'></span>&nbsp;";

    $.each(jsonData.results, function (index, result) {
        str.push("<tr>");

        str.push("<td class=text-left>", linkedTitle.format(result.url, result.jobtitle), "</td>");
        str.push("<td>", result.company, "</td>");
        str.push("<td class=hidden-xs>", result.snippet, "</td>");
        str.push(s.format(result.latitude, result.longitude), result.formattedLocationFull, "</td>");
        str.push("<td class=hidden-xs>", ConvertToLocalTime(result.date), "</td>");

        str.push("</tr>");
    });

    $('#detail').html(str.join(emptyStr));
    var currentPage = $('#hidCurrentPage').val();

    if (currentPage == 1) {
        $('#btnPrev').attr('disabled', 'disabled');
    }
    else
        $('#btnPrev').removeAttr('disabled', 'disabled');

    if (currentPage * pageSize < totalResults) {
        $('#btnNext').removeAttr('disabled', 'disabled');
    }
    else
        $('#btnNext').attr('disabled', 'disabled');

}


