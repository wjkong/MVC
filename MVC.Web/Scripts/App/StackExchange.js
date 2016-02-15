$(function () {
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

    $('#btnSearch').click(function () {
        ResetCurrentPage($(this));
    });

    $('#ddlPageSize').change(function () {
        ResetCurrentPage($(this).prev());
    });

    $('#txtQuestion').keypress(function (e) {
        var code = e.keyCode || e.which;
        if (code === 13) {
            e.preventDefault();

            $('#btnSearch').click();
        }
    });

    $('#detail').on('click', 'th', function () {
        if ($(this).attr('data-sort')) {
            var sort = $(this).data('sort');
            var currentOrder = $('#hidCurrentOrder').val();

            if ($('#hidCurrentSort').val() == sort) {
                if (currentOrder == "desc")
                    $('#hidCurrentOrder').val('asc');
                else
                    $('#hidCurrentOrder').val('desc');
            }
            else {
                $('#hidCurrentSort').val(sort);
                $('#hidCurrentOrder').val('desc');
            }

            ResetCurrentPage($(this));
        }
    });

    $('.pagination').on('click', 'a', function () {
        var currentPage = $(this).text();

        ResetCurrentPage($(this).parent().parent(), currentPage);
    });

//    var availableTags = [
//      "ActionScript",
//      "AppleScript",
//      "Asp",
//      "BASIC",
//      "C",
//      "C++",
//      "Clojure",
//      "COBOL",
//      "ColdFusion",
//      "Erlang",
//      "Fortran",
//      "Groovy",
//      "Haskell",
//      "Java",
//      "JavaScript",
//      "Lisp",
//      "Perl",
//      "PHP",
//      "Python",
//      "Ruby",
//      "Scala",
//      "Scheme"
//    ];
//    $("#txtQuestion").autocomplete({
//        source: availableTags
//    });


  
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
    if (target != null) {
        target.ShowProgressIndicator();
    }

    var filter = "!FsaoAlyOR_zUPjccy3_pNwHZ2W";

    var url = "https://api.stackexchange.com/2.2/search/advanced?page={0}&pagesize={1}&order={2}&sort={3}&q={4}&site=stackoverflow&filter={5}";
    var currentPage = $('#hidCurrentPage').val();
    var currentOrder = $('#hidCurrentOrder').val();
    var currentSort = $('#hidCurrentSort').val();
    var pageSize = $('#ddlPageSize').val();
    var question = encodeURIComponent($('#txtQuestion').val().trim());

    url = url.format(currentPage, pageSize, currentOrder, currentSort, question, filter);
    var str = [];

    var totalItem;

    var objAjax = $.getJSON(url, function (data) {
        $('#btnPrev, #btnNext').show();
        //$('.page-header').hide();

        totalItem = data.total;

        var totalNumOfPages = Math.floor(totalItem / pageSize);

        if (totalItem % pageSize != 0)
            totalNumOfPages++;

        BuildNavBar(totalNumOfPages);

        var columnTitle = ["Title of Question", "Votes", "Tags", "Answers", "Created", "Updated"];
        var hiddenColumn = ["Tags", "Answers", "Created", "Updated"]
        var sortColumn = ["Votes", "Created", "Updated"]
        var sortValue = ["Title of Question", "votes", "tags", "Answers", "creation", "activity"];

        str.push("<table class='table table-striped table-bordered table-hover'>");
        str.push("<tr>");

        $.each(columnTitle, function (index, value) {
            var hiddenClass = emptyStr;

            if ($.inArray(value, hiddenColumn) >= 0)
                hiddenClass = "hidden-xs";

            if ($.inArray(value, sortColumn) >= 0) {
                var orderIndicator = emptyStr;

                if (currentSort == sortValue[index]) {
                    orderIndicator = "&nbsp;<span class='glyphicon glyphicon-triangle-{0}' style='color:red'></span>";
                    if (currentOrder == "asc")
                        orderIndicator = orderIndicator.format("top");
                    else
                        orderIndicator = orderIndicator.format("bottom");
                }

                str.push("<th class='text-center sortable text-nowrap {3}'  data-sort={0}>{1}{2}</th>".format(sortValue[index], value, orderIndicator, hiddenClass));
            }
            else
                str.push("<th class='text-center {0}'>".format(hiddenClass), value, "</th>");
        });

        str.push("</tr>");

        var offset = new Date().getTimezoneOffset() * 60000;
        var popover = "<a title='All Tags' data-toggle=popover data-trigger=hover data-placement=right data-html=true data-content='{0}'>{1}</a>";

        $.each(data.items, function (index, item) {
            str.push("<tr>");

            var linkedTitle = "<a target=_blank href={0}>{1}</a>";
            var allTags = [];

            $.each(item.tags, function (index, value) {
                allTags.push(value);
            });

            var tag = emptyStr;
            var maxLength = 15;
            tag = allTags.join(space);

            if (tag.length > 15)
                tag = tag.substring(0, maxLength) + "...";

            tag = popover.format(allTags.join(lineBreak), tag);
  
            str.push("<td class=text-left>", linkedTitle.format(item.link, item.title), "</td>");
            str.push("<td>", item.score, "</td>");
            str.push("<td class=hidden-xs>", tag, "</td>");
            str.push("<td class=hidden-xs>", item.answer_count, "</td>");
            str.push("<td class=hidden-xs>", ConvertUtcSecondToLocalTime(item.creation_date, offset), "</td>");
            str.push("<td class=hidden-xs>", ConvertUtcSecondToLocalTime(item.last_activity_date, offset), "</td>");
            str.push("</tr>");
        });

        str.push("</table>");

        $('#detail').html(str.join(emptyStr));

        if (currentPage == 1) {
            $('#btnPrev').attr('disabled', 'disabled');
        }
        else
            $('#btnPrev').removeAttr('disabled', 'disabled');

        if (data.has_more) {
            $('#btnNext').removeAttr('disabled', 'disabled');
        }
        else
            $('#btnNext').attr('disabled', 'disabled');

    });

    objAjax.complete(function () {
        if (target != null) {
            $('.progressIndicator').fadeOut(100).remove();
        }

        var end = new Date().getTime();
        var time = ((end - start) * 0.001).toFixed(3);

        $('#resultInfo').html("Total results: {0}; Execution time: {1}s".format(totalItem, time));
        $('[data-toggle="popover"]').popover();
    });
}

