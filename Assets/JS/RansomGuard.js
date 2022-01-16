var RANSOMWATCH_GROUPS;
var RANSOMWATCH_POSTS;
var RANDON_BG_TIMER = 300000;
var ORDERBYGROUP = false;
var LINKS;
var POSTS;

var Sources = {
    thetanz: {
        POSTS: 'https://raw.githubusercontent.com/thetanz/ransomwatch/main/posts.json',
        GROUPS: 'https://raw.githubusercontent.com/thetanz/ransomwatch/main/groups.json',
        NAME: 'thetanz'
    },
    JMousqueton: {
        POSTS: 'https://raw.githubusercontent.com/JMousqueton/ransomwatch/main/posts.json',
        GROUPS: 'https://raw.githubusercontent.com/JMousqueton/ransomwatch/main/groups.json',
        NAME: 'JMousqueton'
    }
}

function SetSource(src) {
    if (src == null) {
        RANSOMWATCH_GROUPS = Sources['JMousqueton'].GROUPS;
        RANSOMWATCH_POSTS = Sources['JMousqueton'].POSTS;
    } else {
        RANSOMWATCH_GROUPS = Sources[src].GROUPS;
        RANSOMWATCH_POSTS = Sources[src].POSTS;


        ShowOverlay('Processing....', "Source Update " + Sources[src].NAME, 1);

        $.when().then(function (x) {
            GetData();
        });
    }

}

function LisPostsBy() {
    var SortMethod = "Sorting by Date"
    if (ORDERBYGROUP) {
        ORDERBYGROUP = false;
        $("#sortby").text("by Group")

    } else {
        ORDERBYGROUP = true;
        SortMethod = 'Sorting by Group';
        $("#sortby").text("by Date")
    }

    ShowOverlay('Processing....', SortMethod, 1);

    $.when().then(function (x) {
        LoadData();
    });


}

function SourcesMenu() {
    $('#SourceURLS').empty();

    for (var i in Sources) {

        var src = $('<li><a target=\"_blank\" onclick=\"SetSource(\'' + Sources[i].NAME + '\');\" "\title=\"' + Sources[i].NAME + '"\">' + Sources[i].NAME + '</a></li>');

        $('#SourceURLS').append(src);
    }

}


function CRTFlicker() {
    var element = document.getElementById("main");
    element.classList.toggle("crt");
}

function DaysSince(post_date) {
    var date1 = new Date(post_date);
    var date2 = new Date();

    var Difference_In_Time = date2.setHours(0, 0, 0, 0) - date1.setHours(0, 0, 0, 0);

    return Difference_In_Time / (1000 * 3600 * 24);

}


function ProcessPostsData() {
    if (POSTS != null) {


        var DosTable = $('#ticker');
        DosTable.empty();

        $('#sideList').empty();

        if (ORDERBYGROUP) {
            const filterResults = (results) => {
                const flags = [],
                    output = [];
                results.forEach((result) => {
                    if (flags.indexOf(result.group_name) < 0) {
                        output.push(result)
                        flags.push(result.group_name)
                    }
                })
                return output;
            }

            POSTS = POSTS.sort((a, b) => {
                let retval = 0;
                retval = a.group_name < b.group_name ? -1 : 1;
                return retval;
            });

            $.each(filterResults(POSTS), function (groupkey, val) {
                var found = POSTS.filter(function (item) {
                    return item.group_name == val.group_name;
                });
                var GroupList = $("<div></div>").append("<h1 id=\"" + val.group_name + "\">" + val.group_name + "<span class=\"count\">(" + found.length + ")</span></h1>");
                $('#sideList').append("<li><a href=\"#" + val.group_name + "\" title=\"" + val.group_name + "\">" + val.group_name + " <small>(" + found.length + ")</small></a></li>");


                $.each(POSTS, function (postkey, post) {
                    if (post.group_name == val.group_name) {
                        GroupList.append(CreateArticle(post.post_title, post.group_name, post.discovered));
                    }
                });
                DosTable.append(GroupList);
            });


        } else {

            var dayOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

            const currentdate = (new Date())
            let day = currentdate.getDay();;
            let year = currentdate.getFullYear();
            var thisMonthDays = currentdate.getDate() - (day + 7);

            let target = 1
            let date = new Date()
            date.setDate(date.getDate() - (date.getDay() == target ? 7 : (date.getDay() + (7 - target)) % 7))
            let LastMonday = DaysSince(date);

            let loop = LastMonday;

            for (var i = 0; i <= loop; i++) {
                var found = POSTS.filter(function (item) {
                    return DaysSince(Date.parse(item.discovered)) == (day + i);
                });

                if (found.length > 0) {
                    if (i == 0) {
                        DosTable.append(GetDateFilteredPost('Today', found));
                    } else if (i == 1) {
                        DosTable.append(GetDateFilteredPost('Yesterday', found));
                    } else {
                        DosTable.append(GetDateFilteredPost(dayOfWeek[loop - i], found));
                    }

                }
            }


            //Last Week Items 
            var from = LastMonday + 1
            var until = LastMonday + 7
            var lstWeekItems = POSTS.filter(function (item) {
                return DaysSince(Date.parse(item.discovered)) >= from && DaysSince(Date.parse(item.discovered)) <= until;
            });

            if (lstWeekItems.length > 0) {
                DosTable.append(GetDateFilteredPost('Last Week', lstWeekItems));
            }


            //Rest of Month
            from = until + 1;
            until = day + 7 + thisMonthDays

            if (thisMonthDays > 0) {
                var thisMonth = POSTS.filter(function (item) {
                    return DaysSince(Date.parse(item.discovered)) >= from && DaysSince(Date.parse(item.discovered)) < until;
                });
                DosTable.append(GetDateFilteredPost('This Month', thisMonth));
            }


            //Rest of this year
            from = until
            until = DaysSince(Date.parse(new Date(year, 0, 1)))
            var thisYear = POSTS.filter(function (item) {
                return DaysSince(Date.parse(item.discovered)) >= from && DaysSince(Date.parse(item.discovered)) <= until;
            });

            if (thisYear.length > 0) {
                DosTable.append(GetDateFilteredPost('This Year', thisYear));
            }

            //Remaining By Year			
            for (var i = year - 1; i >= 2020; i--) {

                const byYear1 = POSTS.filter(function (item) {
                    return Date.parse(item.discovered) >= Date.parse(new Date(i, 0, 1, 0, 0, 0)) && Date.parse(item.discovered) <= Date.parse(new Date(i, 11, 31, 23, 59, 59));
                });
                if (byYear1.length > 0) {
                    DosTable.append(GetDateFilteredPost(i, byYear1));
                }


            }
        }

        $('#JumpLinks').empty();
        $("#sideList").children().clone().appendTo("#JumpLinks");

        HideOverlay();

    }
}


function GetRansomPostsData(sURL) {


    $.ajax({
        url: sURL,
        type: "get",
        dataType: "json",
        beforeSend: function () {
            ShowOverlay('Loading...', 'Getting Post Data', 1);
        },
        complete: function () {
            GetRansomGroupsData(RANSOMWATCH_GROUPS);
        },
        success: function (data) {
            $('#ticker').show();

            //Sort records by date 
            data = data.sort((a, b) => {

                let retval = 0;
                if (Date.parse(a.discovered) > Date.parse(b.discovered))
                    retval = -1;
                if (Date.parse(a.discovered) < Date.parse(b.discovered))
                    retval = 1;
                if (retval === 0)
                    retval = a.group_name < b.group_name ? -1 : 1;
                return retval;

            });


            POSTS = data;
            LoadData();
            HideOverlay();

        },
        error: function (jqXHR, exception) {
            AjaxError(jqXHR, exception);
            $('table.terminalTable').hide();
        }
    });

}

function GetDateFilteredPost(selectioName, items) {
    const selection = $("<div></div>").append("<h1 id=\"" + selectioName + "\">" + selectioName + "<span class=\"count\">(" + items.length + ")</span></h1>");

    $('#sideList').append("<li><a href=\"#" + selectioName + "\" title=\"" + selectioName + "\">" + selectioName + " <small>(" + items.length + ")</small></a></li>");
    $('#JumpLinks').append("<li><a href=\"#" + selectioName + "\" title=\"" + selectioName + "\">" + selectioName + " <small>(" + items.length + ")</small></a></li>");
    FilteredLoop(items, selection)
    return selection;
}


Date.prototype.monthDays = function () {
    var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
    return d.getDate();
}

function FilteredLoop(data, Today) {
    $.each(data, function (key, val) {
        var dateT = GetDate(val.discovered)
        var age = DaysSince(Date.parse(val.discovered));
        var article = CreateArticle(val.post_title, val.group_name, dateT);
        Today.append(article);
    });
}


function ShowGroupLinks(grp) {

    if (links != null) {
        var grp_links = links.filter(function (item) {
            return item.name == grp;
        });
        if (grp_links[0] != null) {
            console.log(grp_links);
            $Links = $("<ul></ul")
            $.each(grp_links[0].locations, function (keys, vals) {

                var cl = "";
                var slugtitle = vals.title;
                if (slugtitle == null) {
                    slugtitle = ""
                }
                if (!vals.available) {
                    cl = "inactive";
                    slugtitle += " (inactive)"
                }

                var slug_type = 'w3';

                if (vals.slug.includes('.onion')) {
                    slug_type = 'ToR'
                }
                $Links.append("<li><a target=\"_blank\" class=\"" + cl + "\" href=\"" + vals.slug + "\" title=\"" + slugtitle + "\">" + grp_links[0].name + " (" + slug_type + ")" + "</a></li>");


            });
            ShowOverlay(grp_links[0].name, $Links, false, false);

        } else {
            ShowOverlay(grp, 'NO LINKS', false, true);
        }
    }

}

function CreateArticle(title, group, date) {
    var article = $("<div class=\"article\"></div>");
    var title = $("<span class=\"title\"></span>").append(title);
    var sub = $("<div class=\"sub\"></div>")
    var group = $("<span class=\"group\"></span>").append("<a href=\"javascript:void(0);\" onclick=\"ShowGroupLinks('" + group + "')\">" + group + "</a>");
    var date = $("<span class=\"date\"></span>").append(date);
    article.append(title);
    sub.append(group);
    sub.append(date);
    article.append(sub);
    return article
}

function AjaxError(jqXHR, exception) {
    var msg = '';
    if (jqXHR.status === 0) {
        msg = 'Not connected.\n Verify Network.';
    } else if (jqXHR.status == 404) {
        msg = 'Requested page not found. [404]';
    } else if (jqXHR.status == 500) {
        msg = 'Internal Server Error [500].';
    } else if (exception === 'parsererror') {
        msg = 'Requested JSON parse failed.';
    } else if (exception === 'timeout') {
        msg = 'Time out error.';
    } else if (exception === 'abort') {
        msg = 'Ajax request aborted.';
    } else {
        msg = 'Uncaught Error.\n' + jqXHR.responseText;
    }
    ShowOverlay("Error", msg, 0, 1);
}

function GetDate(d) {
    var date = new Date(d)
    var aaaa = date.getUTCFullYear();
    var gg = date.getUTCDate();
    var mm = (date.getUTCMonth() + 1);

    if (gg < 10)
        gg = "0" + gg;

    if (mm < 10)
        mm = "0" + mm;

    var cur_day = aaaa + "-" + mm + "-" + gg;

    var hours = date.getUTCHours()
    var minutes = date.getUTCMinutes()
    var seconds = date.getUTCSeconds();

    if (hours < 10)
        hours = "0" + hours;

    if (minutes < 10)
        minutes = "0" + minutes;

    if (seconds < 10)
        seconds = "0" + seconds;

    return cur_day + " " + hours + ":" + minutes + ":" + seconds;

}

function GetRansomGroupsData(sURL) {

    $.ajax({
        url: sURL,
        dataType: 'json',
        beforeSend: function () {
            ShowOverlay('Loading...', 'Getting Group Data', 1);
        },
        complete: function () {

        },
        success: function (data) {

            links = data;
            HideOverlay();
        },
        error: function (jqXHR, exception) {
            AjaxError(jqXHR, exception);
            $('div.SideNav').hide();
        }
    });

}


function ShowOverlay(title, message, loading, error) {

    if (error) {
        $('#overlay .popupBox').addClass("error");
    } else {
        $('#overlay .popupBox').removeClass('error');
    }

    $('#overlay').show();
    $('#overlay .message').html(message);
    $('#overlay .title').text(title);

    if (!loading) {
        $('#overlay .close').show();
        $('#overlay .progress').hide();
    } else {
        $('#overlay .close').hide();
        $('#overlay .progress').show();
    }

}

function ShowAbout() {
    ShowOverlay('RansomWatch Viewer', 'Presents the data from thetanz/ransomwatch lists', 0);
}

function HideOverlay() {
    $('#overlay .message').empty();
    $('#overlay .title').empty();
    $('#overlay').hide();
}

function GetData() {
    GetRansomPostsData(RANSOMWATCH_POSTS);
}


function LoadData() {

    ProcessPostsData();
}

function BGTimer() {
    GetData();
    setTimeout("BGTimer()", RANDON_BG_TIMER);
}

$(document).ready(function () {
    SetSource();
    SourcesMenu();
    BGTimer()
});
