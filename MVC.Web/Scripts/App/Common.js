var emptyStr = '';
var zero = 0.00;
var lineBreak = '<br />';
var yes = "Y";
var singleQuote = "'";
var comma = ",";
var space = " ";
var root = emptyStr;
var linkText = "<a target=_blank href='{0}'>{1}</a>";
var mapLink = "<span data-latitude='{0}' data-longitude='{1}' class='map text-info' data-toggle='modal' data-target='#modalMap'><span class='glyphicon glyphicon-map-marker'></span>{2}</span>";
var imgLink = "<img src='{0}' alt=icon />"; 

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-65517203-1', 'auto');
ga('send', 'pageview');

Date.prototype.yyyymmdd = function () {
    
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
};

Date.prototype.mmdd = function () {
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]); // padding
};

String.prototype.format = function () {
    var s = this;
    var i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};


String.prototype.formatNumber = function () {
    var s = this;

    return Number(s.replace(/[^0-9\.]+/g, ""));
};


$.fn.stars = function () {
    
    var strStar = "<span style='width: {0}px;'></span>";

    return $(this).each(function () {
        // Get the value
        var val = parseFloat($(this).html());
        // Make sure that the value is in 0 - 5 range, multiply to get width
        var size = Math.max(0, (Math.min(5, val))) * 16;
        // Create stars holder
        // Replace the numerical value with stars
        $(this).html(strStar.format(size));
    });
}

$.fn.ShowProgressIndicator = function () {
    // To prevent double-click, create an invisible layer to cover the submit button. Also, display a progress indicator.
    $(this).append("<span class='progressIndicator'><img src='../Images/loading.gif' /></span>");

    var position = $(this).position();

    var left = position.left - 2;
    var top = position.top - 2;
    var height = $(this).outerHeight() + 4;
    var width = $(this).outerWidth() + 4;

    $('.progressIndicator').css('left', left)
                                      .css('top', top)
                                      .css('width', width)
                                      .css('height', height)
                                      .show();
}


$(function () {
    if ($('.page-header').length) {
        var pageHeader = document.title.replace("Api Expert - ", emptyStr);

        $('.page-header').append("<h3>" + pageHeader + "</h3>")
                        .addClass('hidden-xs')
                        .after("<div class='page-header-xs visible-xs'><h4>" + pageHeader + "</h4><hr /></div>");
    }

    if ($('#hidRoot').length)
        root = $('#hidRoot').val();

    $('#' + $('#hidActiveMenu').val()).parent().addClass('active');

    $(window).resize(function () {
        if ($("#dimensions").length) {
            $("#dimensions").html($(window).width());
        }
    }).resize();

    //GetSiteStat();

    $('.glyphicon-thumbs-up, .glyphicon-thumbs-down').click(function (evt) {
        var numOfLike = $(this).next().text();
        numOfLike++;

        $(this).next().html(numOfLike);

        var url = root + "Service/WebService.asmx/AddFeedback";
        var param = "{ 'url': '{0}', 'type': '{1}' }";
        var type = $(this).hasClass('glyphicon-thumbs-up') ? "LIKE" : "DISLIKE";
        param = param.format(window.location.href, type);

        $.ajax({
            type: 'POST',
            url: url,
            data: param,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            error: function (xhr, status, error) {
                alert(error);
            }
        });
    });

    $(".glyphicon-bookmark").click(function () {
        if (window.sidebar) { // Mozilla Firefox Bookmark
            window.sidebar.addPanel(location.href, document.title, "");
        } else if (window.external) { // IE Favorite
            window.external.AddFavorite(location.href, document.title);
        }
        else if (window.opera && window.print) { // Opera Hotlist
            this.title = document.title;
            return true;
        }
    });

    $(".glyphicon-print").click(function () {
        window.print();
        return false;
    });

    $('#btnAddComment').click(function (evt) {
        if ($.trim($('#txtComment').val()).length == 0)
            return false;

        AddComment(0);
    });

    $('#btnReplyComment').click(function (evt) {
        if ($.trim($('#txtComment').val()).length == 0)
            return false;

        AddComment($(this).data('id'));


    });


    $('.glyphicon-comment').click(function (evt) {
        RefreshComment();
    });

    $('#modalComment').on('click', 'a', function () {
        var id = $(this).data("id");

        $('#txtComment').focus();
        $('#btnReplyComment').show().attr('data-id', id);
        $('#btnAddComment').hide();
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

        var infowindow = new google.maps.InfoWindow({
            content: title
        });

        infowindow.open(map, marker);

        $('#modalMap').find('.modal-title').html(element.text());

        google.maps.event.trigger(map, 'resize');
    });
});                // end ready

function GetParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function RefreshComment() {
    var url = root + "Service/WebService.asmx/GetCommentByUrl";
    var param = "{ 'url': '{0}' }";
    param = param.format(window.location.href);

    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: param,
        success: function (data, status) {
            var jsonData = JSON.parse(data.d);

            var str = [];
            str.push("<table class='table table-striped table-hover'>");

            var commentTitle = "<div><a class='reply' data-id={0}>Reply</a>&nbsp;&nbsp;Created: <small>{1}</small></div>";

            var replyLine = "Replied: <small>{0}</small><div class='text-left reply'><span class='glyphicon glyphicon-share-alt'></span>{1}</div>";
            $.each(jsonData, function (index, comment) {
                if (comment.ParentId == undefined || comment.ParentId == 0) {
                    str.push("<tr><td>");

                    str.push(commentTitle.format(comment.Id, ConvertToTime(comment.TimeCreated)));
                    str.push("<p  class='text-left'>", decodeURI(comment.Description), "</p>");
                    str.push("<p>");
                    $.each(jsonData, function (i, reply) {
                        if (reply.ParentId == comment.Id) {
                            str.push(replyLine.format(ConvertToTime(reply.TimeCreated), decodeURI(reply.Description)));
                        }
                    });
                    str.push("</p>");

                    str.push("</td></tr>");
                }
            });

            $('#listOfComment').html(str.join(emptyStr));
        },
        error: function (xhr, status, error) {
            alert(error);
        }
    });
}

function AddComment(parentId) {

    var numOfLike = $('footer .glyphicon-comment').next().text();
    numOfLike++;

    $('footer .glyphicon-comment').next().html(numOfLike);

    var url = root + "Service/WebService.asmx/AddComment";
    var param = "{ 'content': '{0}', 'url': '{1}', 'parentId': '{2}' }";
    param = param.format(encodeURI($('#txtComment').val()), window.location.href, parentId);

    $.ajax({
        type: 'POST',
        url: url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: param,
        success: function (data, status) {
            $('#txtComment').val(emptyStr);

            if (parentId > 0) {
                $('#btnReplyComment').hide().removeAttr('data-id');
                $('#btnAddComment').show();
            }

            RefreshComment();

//            rec
//            grecaptcha.reset()
        },
        error: function (xhr, status, error) {
            alert(error);
        }
    });
}

function getScriptCache(url, callback) {
    jQuery.ajax({
        type: "GET",
        url: url,
        success: callback,
        dataType: "script",
        cache: true
    });
};

function GetDayOfWeek(dateStr) {
//     var dte = new Date(dateStr);
//    dte.setTime(dte.getTime() - dte.getTimezoneOffset() * 60 * 1000);
    var d = new Date(dateStr);
    var weekday = new Array(7);

    
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    weekday[7] = "Sunday";

    var n = d.getDay() + 1;
    return weekday[n];
}

function GetSiteStat() {
    var url = root + "Service/WebService.asmx/GetStat";
    var param = "{ 'url': '{0}' }";
    param = param.format(window.location.href);

    $.ajax({
        type: "POST",
        url: url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: param,
        success: function (data, status) {
            var jsonData = JSON.parse(data.d);

            $('.glyphicon-thumbs-up').next().html(jsonData.TotalLike);
            $('.glyphicon-thumbs-down').next().html(jsonData.TotalDislike);
            $('.glyphicon-comment').next().html(jsonData.TotalComment);
        },
        error: function (xhr, status, error) {
            alert(error);
        }
    });
}


var latitude;
var longitude;
var mapId;
var content;

function ShowMap(id, lat, long, con) {
    var map;
    mapId = id;
    latitude = lat;
    longitude = long;
    content = con;

    google.maps.event.addDomListener(window, 'load', initialize);
}

function BuildNavBar(totalNumOfPages) {
    $('#hidLastPageIndex').val(totalNumOfPages);

    var str = [];
    var currentIndex = $('#hidCurrentPage').val();

    var currentWindowNum = parseInt((currentIndex - 1) / 10);
    var startIndex = currentWindowNum * 10 + 1;
    var lastIndex = (currentWindowNum + 1) * 10;
    lastIndex = Math.min(totalNumOfPages, lastIndex);

    for (var i = startIndex; i <= lastIndex; i++) {
        if (i == currentIndex) {
            str.push("<li class='active'><a>", i, "</a></li>");
        }
        else
            str.push("<li><a>", i, "</a></li>");
    }

    $('.pagination').empty()
                    .append(str.join(emptyStr));
}

function initialize() {
    var mapOptions = {
        zoom: 14
    };

    map = new google.maps.Map(document.getElementById(mapId), mapOptions);

    var pos = new google.maps.LatLng(latitude, longitude);

    var infowindow = new google.maps.InfoWindow({
        map: map,
        position: pos,
        content: content
    });

    map.setCenter(pos);
}

function FormatCurrency(amt) {
    var currencyAmt = 0.00;

    currencyAmt = '$' + parseFloat(amt, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");

    return currencyAmt;
}



function ConvertUtcSecondToLocalTime(utcSeconds, offset) {
    var utcDate = new Date(0); // The 0 there is the key, which sets the date to the epoch
    utcDate.setUTCSeconds(utcSeconds);

    var localDate = new Date(utcDate.getTime() - offset);

    var dateString = "{0}/{1}/{2}";
    var d = localDate.getDate();
    var m = localDate.getMonth() + 1;
    var y = localDate.getFullYear();

    return dateString.format(m, d, y);
}

function ConvertToLocalTime(gmtDate) {
    var dte = new Date(gmtDate);
    dte.setTime(dte.getTime() - dte.getTimezoneOffset() * 60 * 1000);

    var dateString = "{0}/{1}/{2} {3}:{4}:{5}";
    var d = dte.getDate();
    var m = dte.getMonth() + 1;
    var y = dte.getFullYear();
    var min = dte.getMinutes().toString();
    var sec = dte.getSeconds().toString();

    if (min.length < 2)
        min = "0" + min;

    if (sec.length < 2)
        sec = "0" + sec;

    return dateString.format(m, d, y, dte.getHours(), min, sec);
}

function ConvertToTime(serverDate) {
    var dte = new Date(serverDate);
    var dateString = "{0}/{1}/{2} {3}:{4}:{5}";
    var d = dte.getDate();
    var m = dte.getMonth() + 1;
    var y = dte.getFullYear();
    var min = dte.getMinutes().toString();
    var sec = dte.getSeconds().toString();

    if (min.length < 2)
        min = "0" + min;

    if (sec.length < 2)
        sec = "0" + sec;

    return dateString.format(m, d, y, dte.getHours(), min, sec);
}

var autocomplete;

function initialize(fieldAutoComplete) {
    autocomplete = new google.maps.places.Autocomplete((document.getElementById(fieldAutoComplete)), { types: ['geocode'] });
}

function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var geolocation = new google.maps.LatLng(
          position.coords.latitude, position.coords.longitude);
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
        });
    }
}

var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;

function addMarker(location, map, title) {
    // Add the marker at the clicked location, and add the next-available label
    // from the array of alphabetical characters.
    var marker = new google.maps.Marker({
        position: location,
        label: labels[labelIndex++ % labels.length],
        map: map
    });

    var infowindow = new google.maps.InfoWindow({
        content: title
    });
      
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker);
    });
}


function toSHA1(str) {
    //  discuss at: http://phpjs.org/functions/sha1/
    // original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // improved by: Michael White (http://getsprink.com)
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //    input by: Brett Zamir (http://brett-zamir.me)
    //   example 1: sha1('Kevin van Zonneveld');
    //   returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'

    var rotate_left = function (n, s) {
        var t4 = (n << s) | (n >>> (32 - s));
        return t4;
    };

    /*var lsb_hex = function (val) {
    // Not in use; needed?
    var str="";
    var i;
    var vh;
    var vl;

    for ( i=0; i<=6; i+=2 ) {
    vh = (val>>>(i*4+4))&0x0f;
    vl = (val>>>(i*4))&0x0f;
    str += vh.toString(16) + vl.toString(16);
    }
    return str;
    };*/

    var cvt_hex = function (val) {
        var str = '';
        var i;
        var v;

        for (i = 7; i >= 0; i--) {
            v = (val >>> (i * 4)) & 0x0f;
            str += v.toString(16);
        }
        return str;
    };

    var blockstart;
    var i, j;
    var W = new Array(80);
    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;
    var A, B, C, D, E;
    var temp;

    // utf8_encode
    str = unescape(encodeURIComponent(str));
    var str_len = str.length;

    var word_array = [];
    for (i = 0; i < str_len - 3; i += 4) {
        j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
        word_array.push(j);
    }

    switch (str_len % 4) {
        case 0:
            i = 0x080000000;
            break;
        case 1:
            i = str.charCodeAt(str_len - 1) << 24 | 0x0800000;
            break;
        case 2:
            i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 0x08000;
            break;
        case 3:
            i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) <<
      8 | 0x80;
            break;
    }

    word_array.push(i);

    while ((word_array.length % 16) != 14) {
        word_array.push(0);
    }

    word_array.push(str_len >>> 29);
    word_array.push((str_len << 3) & 0x0ffffffff);

    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++) {
            W[i] = word_array[blockstart + i];
        }
        for (i = 16; i <= 79; i++) {
            W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        }

        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;

        for (i = 0; i <= 19; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 20; i <= 39; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 40; i <= 59; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        for (i = 60; i <= 79; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }

        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }

    temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
    return temp.toLowerCase();
}


function setCookie(key, value) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

