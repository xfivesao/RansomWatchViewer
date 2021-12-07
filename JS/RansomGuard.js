var RANSOMWATCH_GROUPS = "https://raw.githubusercontent.com/thetanz/ransomwatch/main/groups.json";
var RANSOMWATCH_POSTS = "https://raw.githubusercontent.com/thetanz/ransomwatch/main/posts.json";
var RANDON_BG_TIMER = 30000;

function SourcesMenu() {
    $('#SourceURLS').empty();

    $('#SourceURLS').append("<li><a target=\"_blank\" href=\"" + RANSOMWATCH_GROUPS + "\" title=\"" + "Group Links" + "\">" + "Group Links" + "</a></li>");

    $('#SourceURLS').append("<li><a target=\"_blank\" href=\"" + RANSOMWATCH_POSTS + "\" title=\"" + "Posts" + "\">" + "Posts" + "</a></li>");

}

function AddListItem($ID, $href) {

    $("#header ul").append('<li><a href="/user/messages"><span class="tab">Message Center</span></a></li>');

}

function CRTFlicker() {
    var element = document.getElementById("main");
    element.classList.toggle("crt");    
}



function GetRansomPostsData(sURL) {
    var DosTable = $('table.terminalTable > tbody');

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
            $('table.terminalTable').show();
            data = data.sort((a, b) => {

                let retval = 0;
                if (a.discovered > b.discovered)
                    retval = -1;
                if (a.discovered < b.discovered)
                    retval = 1;
                if (retval === 0)
                    retval = a.group_name < b.group_name ? -1 : 1;
                return retval;

            });

            $.each(data, function (key, val) {

                DosTable.append("<tr><td>" + val.post_title + "</td><td>" + val.group_name + "</td><td>" + val.discovered.split(' ')[0] + "</td></tr>");

            });
            HideOverlay();

        },
        error: function (jqXHR, exception) {
            AjaxError(jqXHR, exception);
            $('table.terminalTable').hide();
        }
    });

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

function GetRansomGroupsData(sURL) {


    var SideNav = $('div.SideNav > ul');

    $.ajax({
        url: sURL,
        dataType: 'json',
        beforeSend: function () {
            ShowOverlay('Loading...', 'Getting Group Data', 1);
        },
        complete: function () {

        },
        success: function (data) {
            SideNav.empty();
            $('div.SideNav').show();
            data = data.sort((a, b) => {
                let retval = 0;
                if (retval === 0)
                    retval = a.name < b.name ? -1 : 1;
                return retval;
            });


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

                    SideNav.append("<li><a target=\"_blank\" class=\"" + cl + "\" href=\"" + vals.slug + "\" title=\"" + slugtitle + "\">" + val.name + "</a></li>");


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
    $('#popupBox').show();
    $('#popupBox .message').text(message);
    $('#popupBox .title').text(title);

    if (!loading) {
        $('#popupBox .close').show();
        $('#popupBox .progress').hide();
    } else {
        $('#popupBox .close').hide();
        $('#popupBox .progress').show();
    }
    if (error) {
        $('#popupBox .box1').addClass("error");
    } else {
        $('#popupBox .box1').removeClass("error");
    }
}

function ShowAbout() {
    ShowOverlay('RansomWatch Viewer', 'Presents the data from thetanz/ransomwatch lists', 0);
}

function HideOverlay() {
    $('#popupBox .message').empty();
    $('#popupBox .title').empty();
    $('#popupBox').hide();
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
