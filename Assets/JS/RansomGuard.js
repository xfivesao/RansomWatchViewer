//var RANSOMWATCH_GROUPS = "https://raw.githubusercontent.com/thetanz/ransomwatch/main/groups.json";
//var RANSOMWATCH_POSTS = "https://raw.githubusercontent.com/thetanz/ransomwatch/main/posts.json";
var RANSOMWATCH_GROUPS = "https://raw.githubusercontent.com/JMousqueton/ransomwatch/main/groups.json"
var RANSOMWATCH_POSTS = "https://raw.githubusercontent.com/JMousqueton/ransomwatch/main/posts.json"
var RANDON_BG_TIMER = 300000;
var ORDERBYGROUP = false;

var LINKS;


function LisPostsBy() {
    if (ORDERBYGROUP) {
        ORDERBYGROUP = false;
        $("#sortby").text("by Group")
    } else {
        ORDERBYGROUP = true;
        $("#sortby").text("by Date")
    }
    LoadData();
}

function SourcesMenu() {
    $('#SourceURLS').empty();

    $('#SourceURLS').append("<li><a target=\"_blank\" href=\"" + RANSOMWATCH_GROUPS + "\" title=\"" + "Group Links" + "\">" + "Group Links" + "</a></li>");

    $('#SourceURLS').append("<li><a target=\"_blank\" href=\"" + RANSOMWATCH_POSTS + "\" title=\"" + "Posts" + "\">" + "Posts" + "</a></li>");

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

function GetRansomPostsData(sURL) {
    var DosTable = $('#ticker');

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
            DosTable.empty();
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

			$('#sideList').empty();
			$('#JumpLinks').empty();
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

                data = data.sort((a, b) => {
                    let retval = 0;
                    retval = a.group_name < b.group_name ? -1 : 1;
                    return retval;
                });

                $.each(filterResults(data), function (groupkey, val) {
                    var found = data.filter(function (item) {
                        return item.group_name == val.group_name;
                    });
                    var GroupList = $("<div></div>").append("<h1 id=\""+ val.group_name +"\">" + val.group_name + "<span class=\"count\">(" + found.length + ")</span></h1>");
					$('#sideList').append("<li><a href=\"#" + val.group_name + "\" title=\"" + val.group_name + "\">" + val.group_name + " <small>("+found.length+")</small></a></li>");
					
					$('#JumpLinks').append("<li><a href=\"#" + val.group_name + "\" title=\"" + val.group_name + "\">" + val.group_name + " <small>("+found.length+")</small></a></li>");
					
                    $.each(data, function (postkey, post) {
                        if (post.group_name == val.group_name) {
                            GroupList.append(CreateArticle(post.post_title, post.group_name, post.discovered));
                        }
                    });
                    DosTable.append(GroupList);
                });


            } else {
				
				const currentdate = (new Date())
                let day = currentdate.getDay();;
				let year = currentdate.getFullYear();
				var thisMonthDays = currentdate.getDate() - (day + 7);
                let loop = day;
				
                if (day == 1) {
                    loop = 0
                }
                if (day == 0) {
                    loop = 7
                }
				
                var dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

                for (var i = loop; i >= 1; i--) {
                    if (i == (day)) {
                        var found = data.filter(function (item) {
                            return DaysSince(Date.parse(item.discovered)) < 1;
                        });
                        if (found.length > 0) {
                            DosTable.append(GetDateFilteredPost('Today', found));
                        }
                    } else if (i == (day - 1)) {
                        var found = data.filter(function (item) {
                            return DaysSince(Date.parse(item.discovered)) == (day - i);
                        });
                        if (found.length > 0) {
                            DosTable.append(GetDateFilteredPost('Yesterday', found));
                        }
                    } else {
                        var found = data.filter(function (item) {
                            return DaysSince(Date.parse(item.discovered)) == (day - i);
                        });

                        if (found.length > 0) {
                            DosTable.append(GetDateFilteredPost(dayOfWeek[i], found));
                        }

                    }
                }

                var lstWeekItems = data.filter(function (item) {
                    return DaysSince(Date.parse(item.discovered)) >= day && DaysSince(Date.parse(item.discovered)) < day + 7;
                });

                if (lstWeekItems.length > 0) {
                    DosTable.append(GetDateFilteredPost('Last Week', lstWeekItems));
                }
                
                 if (thisMonthDays > 0) {
                    var thisMonth = data.filter(function (item) {
                        return DaysSince(Date.parse(item.discovered)) >= (day + 7) && DaysSince(Date.parse(item.discovered)) < (day + 7 + thisMonthDays);
                    });
                    DosTable.append(GetDateFilteredPost('This Month', thisMonth));
                }

                var thisYear = data.filter(function (item) {
                    return DaysSince(Date.parse(item.discovered)) >= (day + 7 + thisMonthDays) && DaysSince(Date.parse(item.discovered)) <= DaysSince(Date.parse(new Date(year,0,1)));
                });

                if(thisYear.length>0){DosTable.append(GetDateFilteredPost('This Year', thisYear));}
				
				
				for (var i = year-1; i >= 2020; i--) 
				{
					 console.log(i);
					console.log( Date.parse(new Date(i,31,12))   +"  " +  Date.parse(new Date(i,1,1)))
					 const byYear = data.filter(function (item) 
					{
						 return Date.parse(item.discovered) <= Date.parse(new Date(i,11,31)) && Date.parse(item.discovered) >= Date.parse(new Date(i,0,1));
					 });
					
					if(byYear.length >0) {DosTable.append(GetDateFilteredPost(i, byYear));}									   
				}
            }

            HideOverlay();

        },
        error: function (jqXHR, exception) {
            AjaxError(jqXHR, exception);
            $('table.terminalTable').hide();
        }
    });

}

function GetDateFilteredPost(selectioName, items) 
{
    const selection = $("<div></div>").append("<h1 id=\""+selectioName+"\">" + selectioName + "<span class=\"count\">(" + items.length + ")</span></h1>");
	
	$('#sideList').append("<li><a href=\"#" + selectioName + "\" title=\"" + selectioName + "\">" + selectioName + " <small>("+items.length+")</small></a></li>");
	$('#JumpLinks').append("<li><a href=\"#" + selectioName + "\" title=\"" + selectioName + "\">" + selectioName + " <small>("+items.length+")</small></a></li>");
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

function LoadData() {
    GetRansomPostsData(RANSOMWATCH_POSTS);
}

function BGTimer() {
    LoadData()
    setTimeout("BGTimer()", RANDON_BG_TIMER);
}

$(document).ready(function () {
    SourcesMenu();
    BGTimer()
});
