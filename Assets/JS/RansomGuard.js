var RANSOMWATCH_GROUPS;
var RANSOMWATCH_POSTS;
var RANDON_BG_TIMER = 300000;
var ORDERBYGROUP = false;
var LINKS;
var POSTS;

var Sources = {
    LEVEL4: {
        POSTS: 'https://raw.githubusercontent.com/xfivesao/ransomwatch/main/posts.json',
        GROUPS: 'https://raw.githubusercontent.com/xfivesao/ransomwatch/main/groups.json',
        NAME: 'LEVEL4'
    },
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
        RANSOMWATCH_GROUPS = Sources['LEVEL4'].GROUPS;
        RANSOMWATCH_POSTS = Sources['LEVEL4'].POSTS;
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


function DaysSince(post_date) {
    var date1 = new Date(post_date);
    var date2 = new Date();

    var Difference_In_Time = date2.setHours(0, 0, 0, 0) - date1.setHours(0, 0, 0, 0);

    return Difference_In_Time / (1000 * 3600 * 24);

}


function ProcessPostsData() {
    if (POSTS != null) {

        var DosTable = $('#ticker')
        DosTable.empty();

        $('#sideList').empty();

        if (ORDERBYGROUP) {
            var filterResults = (results => {
                const flags = [],
                    output = [];
                results.forEach(result => {
                    if (flags.indexOf(result.group_name) < 0) {
                        output.push(result)
                        flags.push(result.group_name)
                    }
                })
                return output;
            });

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


            /*            const currentdate = (new Date())
                        var DayOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

                        var firstDayOfTheWeek = new Date((new Date).setDate((currentdate.getDate() - currentdate.getDay()) + 1));
                        var lastDayOfTheWeek = new Date((new Date).setDate((currentdate.getDate() + 5)));

                        var day = currentdate.getDay()
                        var loop = 6
                        if (day != 0) {
                            loop = day - 1;
                        }

                        //Days This Week
                        for (var i = 0; i <= loop; i++) {
                            var start = GetDate(new Date((new Date).setDate(currentdate.getDate() - i)).setHours(0, 0, 0));
                            var end = GetDate(new Date((new Date).setDate(currentdate.getDate() - i)).setHours(23, 59, 59));

                            var newDay = new Date(start).getDay();

                            if (newDay == currentdate.getDay()) {
                                GetDateFilteredPost('Today', start, end, POSTS);
                            } else {
                                GetDateFilteredPost(DayOfTheWeek[newDay], start, end, POSTS);
                            }
                        }


                        //Days Last Week
                        var firstDayOfLastWeek = new Date((new Date).setDate(lastDayOfTheWeek.getDate() - 13)).setHours(0, 0, 0);
                        var lastDayOfLastWeek = new Date((new Date).setDate(lastDayOfTheWeek.getDate() - 7)).setHours(23, 59, 59);
                        GetDateFilteredPost('Last Week', GetDate(firstDayOfLastWeek), GetDate(lastDayOfLastWeek), POSTS);

                        //Days Rest of Year
                        var d = new Date(currentdate.getFullYear(), 0, 1).setHours(0, 0, 0);
                        GetDateFilteredPost('This Year', GetDate(d), GetDate(firstDayOfLastWeek), POSTS);


                        //Remaining By Year			
                        for (var i = currentdate.getFullYear() - 1; i >= 2020; i--) {

                            GetDateFilteredPost(i, (new Date(i, 0, 1, 0, 0, 0)), (new Date(i, 11, 31, 23, 59, 59)), POSTS);


                        }*/

            var date = new Date();
            var currentMonth = date.getMonth();
            var currentYear = date.getFullYear();
        
     		var month = ["January","February","March","April","May","June","July",
             "August","September","October","November","December"];
			

            for (var i = 0; i < 120; i++) {
                if (currentMonth == -1) {
                    currentMonth = 11;
                    date.setFullYear(parseInt(currentYear) - 1);
                    currentYear = date.getFullYear();
					if(currentYear < 2019){break;}
					
					
                }
				GetDateFilteredPost(currentYear+ " " + month[currentMonth], (new Date(currentYear, currentMonth, 1, 0, 0, 0)), (new Date(currentYear, currentMonth, 31, 23, 59, 59)), POSTS);

                currentMonth--;
				
            }
		}

        $('#JumpLinks').empty();
        $("#sideList").children().clone().appendTo("#JumpLinks");

        HideOverlay();

    }
}

function OrderPostsByDate(source, start, end) {
    var Items = source.filter(function (item) {
        return Date.parse(item.discovered) >= start && Date.parse(item.discovered) <= end;
    });

    return Items;

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

function GetDateFilteredPost(selectioName, start, end, data) {


    const items = data.filter(function (item) {
        return Date.parse(item.discovered) >= Date.parse(start) && Date.parse(item.discovered) <= Date.parse(end);
    });

    if (items.length > 0) {
        const selection = $("<div></div>").append("<h1 id=\"" + selectioName + "\">" + selectioName + "<span class=\"count\">(" + items.length + ")</span></h1>");

        $('#sideList').append("<li><a href=\"#" + selectioName + "\" title=\"" + selectioName + "\">" + selectioName + " <small>(" + items.length + ")</small></a></li>");
        $('#JumpLinks').append("<li><a href=\"#" + selectioName + "\" title=\"" + selectioName + "\">" + selectioName + " <small>(" + items.length + ")</small></a></li>");
        FilteredLoop(items, selection)
        $('#ticker').append(selection)
    }

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
