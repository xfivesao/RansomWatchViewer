//var RANSOMWATCH_GROUPS = "https://raw.githubusercontent.com/thetanz/ransomwatch/main/groups.json";
//var RANSOMWATCH_POSTS = "https://raw.githubusercontent.com/thetanz/ransomwatch/main/posts.json";
var RANSOMWATCH_GROUPS = "https://raw.githubusercontent.com/JMousqueton/ransomwatch/main/groups.json"
var RANSOMWATCH_POSTS = "https://raw.githubusercontent.com/JMousqueton/ransomwatch/main/posts.json"
var RANDON_BG_TIMER = 300000;
var ORDERBYGROUP = false;

var LINKS;


function LisPostsBy()
{
	if(ORDERBYGROUP)
	{
		ORDERBYGROUP = false;
		$("#sortby").text("by Group")
	}		
	else
	{
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

function DaysSince(post_date)
{
	var date1 = new Date(post_date);
	var date2 = new Date();

	var Difference_In_Time = date2.setHours(0,0,0,0) - date1.setHours(0,0,0,0);
  
	return  Difference_In_Time / (1000 * 3600 * 24);

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



			if(ORDERBYGROUP)
			{
				const filterResults=(results)=>{
				const flags=[],output=[];
				results.forEach((result)=>{
					if(flags.indexOf(result.group_name)<0){
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
			
				$.each(filterResults(data), function (groupkey, val) 
				{
					var GroupList = $("<div></div>").append("<h1>"+ val.group_name +"</h1>");
					
						$.each(data, function (postkey, post) 
						{
							if(post.group_name == val.group_name)
							{
								GroupList.append(CreateArticle(post.post_title,post.group_name,post.discovered));
							}
						});	
					DosTable.append(GroupList);						
				});
				
				
			}
			else
			{

				let day = (new Date()).getDay();	
				let loop = day;				
				if(day == 1){loop=0}
				if(day == 0){loop=7}				
				var dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];		
				
				for (var i = loop; i >= 1; i--) 
				{					
					if(i == (day))
					{
						var found = data.filter(function(item) { return DaysSince(Date.parse(item.discovered)) < 1 ; });
						var Today = $("<div></div>").append("<h1>Today"+"<span class=\"count\">(" + found.length + ")</span></h1>");
						FilteredLoop(found,Today)
						DosTable.append(Today);
					}
					else if(i == (day-1))
					{
						var found = data.filter(function(item) { return DaysSince(Date.parse(item.discovered)) == (day-i) ; });
						var Yesterday = $("<div></div>").append("<h1>Yesterday"+"<span class=\"count\">(" + found.length + ")</span></h1>");
						FilteredLoop(found,Yesterday)
						DosTable.append(Yesterday);
					}
					else					
					{
						var found = data.filter(function(item) { return DaysSince(Date.parse(item.discovered)) == (day-i) ; });
						const weekday = $("<div></div>").append("<h1>"+ dayOfWeek[i] +"<span class=\"count\">(" + found.length + ")</span></h1>");
						FilteredLoop(found,weekday)
						DosTable.append(weekday);
					}
				}
				
				var lstWeekItems = data.filter(function(item) { return DaysSince(Date.parse(item.discovered)) >= day &&  DaysSince(Date.parse(item.discovered)) < day + 7 ; });				
				const latWeek = $("<div></div>").append("<h1>"+ "LastWeek" + "<span class=\"count\">(" + lstWeekItems.length + ")</span></h1>");
				FilteredLoop(lstWeekItems,latWeek)
				DosTable.append(latWeek);

				
				var olderItems = data.filter(function(item) { return DaysSince(Date.parse(item.discovered)) >= (day+7) ; });				
				const older = $("<div></div>").append("<h1>"+ "Older" + "<span class=\"count\">(" + olderItems.length + ")</span></h1>");
				FilteredLoop(olderItems,older)
				DosTable.append(older);
	
		
			}
			
            HideOverlay();

        },
        error: function (jqXHR, exception) {
            AjaxError(jqXHR, exception);
            $('table.terminalTable').hide();
        }
    });

}

function FilteredLoop(data,Today)
{
	$.each(data, function (key, val) 
	{	         
		var dateT = GetDate(val.discovered)
		var age = DaysSince(Date.parse(val.discovered));			
	 	var article = CreateArticle(val.post_title,val.group_name,dateT);			 
		Today.append(article);
	});		
}

function ShowGroupLinks(grp)
{
	
	if (links != null)
	{
    	var grp_links = links.filter(function(item) { return item.name == grp; });	
		if(grp_links != null)
			{
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
					 
					
                    $Links.append("<li><a target=\"_blank\" class=\"" + cl + "\" href=\"" + vals.slug + "\" title=\"" + slugtitle + "\">" + grp_links[0].name + "</a></li>");
					 
					 

                });
				ShowOverlay(grp_links[0].name, $Links,false,false);
				
			}
	}
	
}

function CreateArticle(title,group,date)
{
	var article = $("<div class=\"article\"></div>");
	var title = $("<span class=\"title\"></span>").append(title);
	var sub = $("<div class=\"sub\"></div>")
	var group = $("<span class=\"group\"></span>").append("<a href=\"javascript:void(0);\" onclick=\"ShowGroupLinks('"+group+"')\">"+ group + "</a>");
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

function GetDate(d)
{
	var date= new Date(d)
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
            $('#sideList').empty();
            $('#GroupURLs').empty();

            data = data.sort((a, b) => {
                let retval = 0;
               if (retval === 0)
                    retval = a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
                return retval;
            });
			
			links = data;
			
            $.each(data, function (key, val) {

                $.each(val.locations, function (keys, vals) {

                    var cl = "";
                    var slugtitle = vals.title;
                    if (slugtitle == null) {
                        slugtitle = ""
                    }
                    if (!vals.available) {
                        cl = "inactive";
                        slugtitle += " (inactive)"
                    }


                    $('#GroupURLs').append("<li><a target=\"_blank\" class=\"" + cl + "\" href=\"" + vals.slug + "\" title=\"" + slugtitle + "\">" + val.name + "</a></li>");

                    $('#sideList').append("<li><a target=\"_blank\" class=\"" + cl + "\" href=\"" + vals.slug + "\" title=\"" + slugtitle + "\">" + val.name + "</a></li>");
                });

            });

            HideOverlay();
        },
        error: function (jqXHR, exception) {
            AjaxError(jqXHR, exception);
            $('div.SideNav').hide();
        }
    });

}

function ShowOverlay(title, message, loading, error) {
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
    if (error) {
        $('#overlay .popupBox').addClass("error");
    } else {
        $('#overlayx .popupBox').removeClass("error");
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
