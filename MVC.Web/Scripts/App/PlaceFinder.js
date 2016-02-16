var start;
var urlGeoCode = 'http://maps.googleapis.com/maps/api/geocode/json?latlng={0},{1}&sensor=true';

$(function () {
    var str = [];
    var strOption = "<option value={0}>{1}</option>";

    $.each(placeType, function (index, type) {
        str.push(strOption.format(type, type.replace(/_/g, space)));
    });

    $('#ddlType').html(str.join(emptyStr));

    initialize('txtLocation');

    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        DetermineLocation();
    });
       

    $('#btnSearch').click(function (evt) {
        $('.page-header').hide();

        Refresh($(this));
    });

    $('#ddlRadius, #ddlType').change(function (evt) {

        Refresh($(this).prev());
    });

    $('#chkCurrentPosition').click(function () {
        if ($(this).is(':checked')) {
            $('#txtLocation').attr("disabled", "disabled").val("Current Position");

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(getPosition);
            } else {
                x.innerHTML = "Geolocation is not supported by this browser.";
            }

        }
        else {
            $('#txtLocation').removeAttr("disabled").val(emptyStr);

            $('#hidLat').val(emptyStr);
            $('#hidLng').val(emptyStr);
        }
    });

    $('#modalMapMarker').on('shown.bs.modal', function (e) {
        var map;
        var latitude = $('#hidLat').val();
        var longitude = $('#hidLng').val();

        var myCenter = new google.maps.LatLng(latitude, longitude);

        var marker = new google.maps.Marker({
            position: myCenter,
            title: "Your Place"
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
            title += lineBreak + cell.text();

            addMarker(location, map, title);
        });


        $('#modalMapMarker').find('.modal-title').html($('#txtLocation').val());

        google.maps.event.trigger(map, 'resize');
    });


    $('#modalDetail').on('shown.bs.modal', function (e) {
        var element = $(e.relatedTarget);

        var placeid = element.data('placeid');

        var url = "place-finder.aspx/RetrievePlaceDetail";
        var param = "{ 'placeId': '{0}' }";
        param = param.format(placeid);
        var str = [];

        $.ajax({
            type: 'POST',
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: param,
            success: OnSuccess,
            error: function (xhr, status, error) {
                alert(error);
            },
            complete: function (xhr, status) {
                $('#modalDetail span.stars').stars();
                $('[data-toggle="popover"]').popover();
            }
        });
    });

    $('#modalDetail').on('hidden.bs.modal', function (e) {

        $('#review').html(emptyStr);
    });

});

function OnSuccess(data,   status) {
    var jsonData = JSON.parse(data.d);

    if (jsonData.status == "OK") {
        var place = jsonData.result;

        var icon = "<img src={0} alt=icon/>";
        var phone = "<span class=hidden-xs>{0}</span><a class=visible-xs href='tel:{0}'>{0}</a>";

        //$('#photo').html(imgLink.format(photoLink.format(place.photos[0].photo_reference)));

        $('#modalDetail .modal-title').html(imgLink.format(place.icon));
        $('#name').html(place.name);

        if (place.formatted_phone_number == undefined)
            $('#phone').html('N/A');
        else
            $('#phone').html(phone.format(place.formatted_phone_number));

        $('#address').html(mapLink.format(place.geometry.location.lat,   place.geometry.location.lng,   place.formatted_address));
        
        if (place.website == undefined)
            $('#website').html("N/A");
        else
            $('#website').html(linkText.format(place.website,   place.website));

        if (place.rating == undefined)
            $('#rating').html(0);
        else
            $('#rating').html(place.rating);

        $('#googlePlus').html(linkText.format(place.url,   place.name));

        var str = [];
        var status = "<p data-toggle=collapse data-target='#tblHours'>{0}</p>";

        if (place.opening_hours != undefined) {
            str.push("<a title='Business Hours' data-toggle=popover data-trigger=hover data-placement=top data-html=true data-content='"); ;

            str.push("<table id=tblHours>");

            $.each(place.opening_hours.weekday_text,   function (index,   weekday) {
                str.push("<tr><td>",   weekday,   "</td></tr>");
            });

            str.push("</table>'>");

            if (place.opening_hours.open_now) {
                str.push("Currently Open (Hover for detail)");
            }
            else
                str.push("Currently Closed (Hover for detail)");

            str.push("</a>");
        }
        else
            str.push("N/A");

        $('#businessHours').html(str.join(emptyStr));

        if (place.reviews != undefined) {

            var tableHeaders = ["Review",   "Rating",   "Reviewer", "Updated"];
            var hiddenColumn = ["Rating", "Updated"];

            str = [];

            str.push("<table class='table table-striped'>");
            str.push("<tr>");
            $.each(tableHeaders,   function (index,   header) {
                var hiddenClass = emptyStr;

                if ($.inArray(header,   hiddenColumn) >= 0)
                    hiddenClass = "hidden-xs";

                str.push("<th class='text-center {0}' id='{1}'>".format(hiddenClass,   header),   header,   "</th>");
            });
            str.push("</tr>");

            var offset = new Date().getTimezoneOffset() * 60000;
            $.each(place.reviews,   function (index,   review) {
                str.push("<tr>");
                str.push("<td class=text-left>",   review.text,   "</td>");
                str.push("<td class='hidden-xs'><span class=stars>",   review.rating,   "</span></td>");
                str.push("<td>",   linkText.format(review.author_url,   review.author_name),   "</td>");
                str.push("<td class=hidden-xs>", ConvertUtcSecondToLocalTime(review.time, offset), "</td>");
                str.push("</tr>");
            });

            str.push("</table>");

            $('#review').html(str.join(emptyStr));
        }
    }
}

function getPosition(position) {
    $('#hidLat').val(position.coords.latitude);
    $('#hidLng').val(position.coords.longitude);
}

function Refresh(target) {
    var latitude = $('#hidLat').val();
    var longitude = $('#hidLng').val();
    var radius = $('#ddlRadius').val();

    if (latitude == undefined || longitude == undefined || latitude == emptyStr || longitude == emptyStr) 
        return;

    target.ShowProgressIndicator();
    start = new Date().getTime();

    var myCenter = new google.maps.LatLng(latitude,   longitude);

    var mapProp = {
        center: myCenter,  
        zoom: 12,  
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("mapMarker-canvas"),   mapProp);
    var type = $('#ddlType').val();

    var request = {
        location: myCenter,  
        radius: radius,  
        types: [type]
    };

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request,   callback);
}

function callback(results,   status,   page) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        $('#mapMarker').show();

        var tableHeaders = ["Place Name",   "Rating",   "Address"];
        var hiddenColumn = ["Rating"];
        var linkedTitle = "<a href='place-detail.aspx?placeid={0}'>{1}</a>";

        var str = [];

        str.push("<table class='table table-striped table-bordered table-hover'>");
        str.push("<tr>");
        $.each(tableHeaders,   function (index,   header) {
            var hiddenClass = emptyStr;

            if ($.inArray(header,   hiddenColumn) >= 0)
                hiddenClass = "hidden-xs";

            str.push("<th class='text-center {0}'>".format(hiddenClass),   header,   "</th>");
        });
        str.push("</tr>");

        var address = "<td data-latitude={0} data-longitude={1} class='map text-info text-left' data-toggle='modal' data-target='#modalMap'><span class='glyphicon glyphicon-map-marker'></span>{2}</td>";
        var detail = "<td class='text-left' data-toggle='modal' data-target='#modalDetail' data-placeid='{0}'><span class='badge'>{1}</span>&nbsp;{2}</td>";
        $.each(results,   function (index,   place) {
            str.push("<tr>");
            str.push(detail.format(place.place_id,   labels[index],   place.name));
            str.push("<td class=hidden-xs><span class=stars>",   place.rating == undefined ? 0 : place.rating,   "</span></td>");
            str.push(address.format(place.geometry.location.lat,   place.geometry.location.lng,   place.vicinity));
            str.push("</tr>");
        });

        str.push("</table>");

        $('#detail').html(str.join(emptyStr));

        $('.progressIndicator').fadeOut(100).remove();


        var end = new Date().getTime();
        var time = ((end - start) * 0.001).toFixed(3);

        $('#resultInfo').html("Totol Result: {0}; Execution time: {1}s".format(results.length,   time));

        $('span.stars').stars();
    }
}

function DetermineLocation() {
    var place = autocomplete.getPlace();

    $('#hidLat').val(place.geometry.location.lat);
    $('#hidLng').val(place.geometry.location.lng);
}

var placeType = [
"accounting", 
"airport", 
"amusement_park", 
"aquarium", 
"art_gallery", 
"atm", 
"bakery", 
"bank", 
"bar", 
"beauty_salon", 
"bicycle_store", 
"book_store", 
"bowling_alley", 
"bus_station", 
"cafe", 
"campground", 
"car_dealer", 
"car_rental", 
"car_repair", 
"car_wash", 
"casino", 
"cemetery", 
"church", 
"city_hall", 
"clothing_store", 
"convenience_store", 
"courthouse", 
"dentist", 
"department_store", 
"doctor", 
"electrician", 
"electronics_store", 
"embassy", 
"establishment", 
"finance", 
"fire_station", 
"florist", 
"food", 
"funeral_home", 
"furniture_store", 
"gas_station", 
"general_contractor", 
"grocery_or_supermarket", 
"gym", 
"hair_care", 
"hardware_store", 
"health", 
"hindu_temple", 
"home_goods_store", 
"hospital", 
"insurance_agency", 
"jewelry_store", 
"laundry", 
"lawyer", 
"library", 
"liquor_store", 
"local_government_office", 
"locksmith", 
"lodging", 
"meal_delivery", 
"meal_takeaway", 
"mosque", 
"movie_rental", 
"movie_theater", 
"moving_company", 
"museum", 
"night_club", 
"painter", 
"park", 
"parking", 
"pet_store", 
"pharmacy", 
"physiotherapist", 
"place_of_worship", 
"plumber", 
"police", 
"post_office", 
"real_estate_agency", 
"restaurant", 
"roofing_contractor", 
"rv_park", 
"school", 
"shoe_store", 
"shopping_mall", 
"spa", 
"stadium", 
"storage", 
"store", 
"subway_station", 
"synagogue", 
"taxi_stand", 
"train_station", 
"travel_agency", 
"university", 
"veterinary_care", 
"zoo"
];