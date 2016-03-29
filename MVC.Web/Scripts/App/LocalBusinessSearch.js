var totalResults;


$(function () {
    initialize('txtLocation');

    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        fillInAddress();
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

    $('#ddlPageSize, #ddlRadius').change(function () {
        ResetCurrentPage($(this).prev());
    });

    $('#btnSearch').click(function () {
        ResetCurrentPage($(this));
    });

    $('#txtBusiness').keypress(function (e) {
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
        var title = element.parent().find('td:first').text();

        var infowindow = new google.maps.InfoWindow({
            content: title
        });

        var marker = new google.maps.Marker({
            position: myCenter,
            title: title
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

    $('#modalMapMarker').on('shown.bs.modal', function (e) {
        var map;
        var element = $(e.relatedTarget);
        var latitude = element.data("latitude");
        var longitude = element.data("longitude");

        var myCenter = new google.maps.LatLng(latitude, longitude);

        var marker = new google.maps.Marker({
            position: myCenter,
        });

        var mapProp = {
            center: myCenter,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("mapMarker-canvas"), mapProp);
        marker.setMap(map);

        var infowindow = new google.maps.InfoWindow({
            content: "Your Place"
        });

        infowindow.open(map, marker);


        labelIndex = 0;
        $("#detail td.map").each(function () {
            var cell = $(this);
            var lat = cell.data('latitude');
            var lng = cell.data('longitude');

            var location = new google.maps.LatLng(lat, lng);
            var title = cell.parent().find('td:first').text();

            addMarker(location, map, title);
        });


        $('#modalMapMarker').find('.modal-title').html($('#txtLocation').val());

        google.maps.event.trigger(map, 'resize');
    });
});

function fillInAddress() {

    // Get the place details from the autocomplete object.
    var place = autocomplete.getPlace();

    $('#mapMarker').attr('data-latitude', place.geometry.location.G);
    $('#mapMarker').attr('data-longitude', place.geometry.location.K);

}

function ResetCurrentPage(target, pageIndex) {
    if (typeof pageIndex === 'undefined') {
        pageIndex = 1;
    }

    $('#hidCurrentPage').val(pageIndex);

    Refresh(target);
}

function Refresh(target) {
    var start = new Date().getTime();

    var term = $('#txtBusiness').val();
    var location = $('#txtLocation').val();
    var pageSize = $('#ddlPageSize').val();
    var startIndex = ($('#hidCurrentPage').val() - 1) * 10;
    var radius = $('#ddlRadius').val();

    if ($.trim(location).length == 0)
        return false;

    var url = "local-business-search-yelp/RetrieveLocalInfo"
    var param = "{ 'term': '{0}', 'location': '{1}', 'startIndex': '{2}', 'pageSize': '{3}', 'radius': '{4}' }";
    param = param.format(term, location, startIndex, pageSize, radius);
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
            alert(error);
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

    $('#btnPrev, #btnNext, #mapMarker').show();

    var jsonData = JSON.parse(data.d)
    var str = [];

    var tableHeaders = ["Business", "Rating", "Distance", "Description", "Address", "Phone"];
    var hiddenColumn = ["Distance", "Description"]
    var rateImg = "<img src='{0}' alt='{1}' title='{1} stars' />";
    var businessImg = "<img src='{0}' alt='{1}' />";

    str.push("<table class='table table-striped table-bordered table-hover'>");
    str.push("<tr>");

    $.each(tableHeaders, function (index, header) {
        var hiddenClass = emptyStr;

        if ($.inArray(header, hiddenColumn) >= 0)
            hiddenClass = "hidden-xs";

        str.push("<th class='text-center {0}' id='{1}'>".format(hiddenClass, header), header, "</th>");
    });

    str.push("</tr>");

    totalResults = jsonData.total;
    var pageSize = $('#ddlPageSize').val();

    var totalNumOfPages = Math.floor(totalResults / pageSize);

    if (totalResults % pageSize != 0)
        totalNumOfPages++;

    BuildNavBar(totalNumOfPages);

    var s = "<td data-latitude='{0}' data-longitude='{1}' class='map text-info' data-toggle='modal' data-target='#modalMap'><span class='glyphicon glyphicon-map-marker'></span>&nbsp;";
    var review = "<br/><span class=text-nowrap>{0} reviews</span>";
    var phone = "<td><span class=hidden-xs>{0}</span><a class=visible-xs href='tel:{0}'>{0}</a></td>";
    $.each(jsonData.businesses, function (index, business) {
        str.push("<tr>");

        str.push("<td class=text-left>", linkText.format(business.url, business.name), "</td>");
        str.push("<td>", rateImg.format(business.rating_img_url_small, business.rating), review.format(business.review_count), "</td>");
        str.push("<td class='text-nowrap hidden-xs'>", ConvertToKM(business.distance), "</td>");
        str.push("<td class='text-left hidden-xs'>", business.snippet_text, "</td>");
        str.push(s.format(business.location.coordinate.latitude, business.location.coordinate.longitude));

        if (business.location.address[1] != undefined)
            str.push(business.location.address[1], space);

        str.push(business.location.address[0], lineBreak, space, business.location.city, space, business.location.postal_code, "</td>");

        str.push(phone.format(business.phone));

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

function ConvertToKM(meter) {
    var km = "N/A";

    if (meter != undefined)
        km = (meter * 0.001).toFixed(2) + space + "KM";

    return km;
}