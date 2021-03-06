var gsStringTable = [];
var protocol = window.location.protocol;
String.prototype.format = function() {
    var pattern = /\{\d+\}/g;
    var args = arguments;
    return this.replace(pattern, function(capture) { 
        return args[capture.match(/\d+/)]
    })
};

function JSONscriptRequest(fullUrl) {
    this.fullUrl = fullUrl;
    this.headLoc = document.getElementsByTagName("head").item(0);
    this.scriptId = "YJscriptId" + JSONscriptRequest.scriptCounter++
}
JSONscriptRequest.scriptCounter = 1;
JSONscriptRequest.prototype.buildScriptTag = function() {
    this.scriptObj = document.createElement("script");
    this.scriptObj.setAttribute("type", "text/javascript");
    this.scriptObj.setAttribute("src", this.fullUrl);
    this.scriptObj.setAttribute("id", this.scriptId)
};
JSONscriptRequest.prototype.removeScriptTag = function() {
    this.headLoc.removeChild(this.scriptObj)
};
JSONscriptRequest.prototype.addScriptTag = function() {
    this.headLoc.appendChild(this.scriptObj)
};

function getURLParameter(name) {
    return unescape((RegExp(name + "=" + "(.+?)(&|$)").exec(location.search) || [, null])[1])
}

function _t(id) {
    if (gsStringTable[id] != null) return gsStringTable[id];
    else switch (id) {
        case "generic_error":
            return "There was an error contacting Get Satisfaction";
            break;
        case "view_all":
            return "VIEW ALL";
            break;
        case "search_header_no_results":
            return "No Related Community Discussions";
            break;
        case "search_header_with_results":
            return "Related Community Discussions - {0} discussions";
            break;
        case "generic_results_subheader":
            return "{0} discussions";
            break;
        case "generic_replies":
            return "{0} replies";
            break;
        case "questions_header":
            return "Questions";
            break;
        case "ideas_header":
            return "Ideas";
            break;
        case "problems_header":
            return "Problems";
            break;
        case "praises_header":
            return "Praise";
            break
    }
}

function loadFailed() {
    $("#gs_search_title").html("<em>" + _t("generic_error") + "</em>");
    $("#gs_questions").html("<em>" + _t("generic_error") + "</em>");
    $("#gs_ideas").html("<em>" + _t("generic_error") + "</em>");
    $("#gs_problems").html("<em>" + _t("generic_error") + "</em>");
    $("#gs_praises").html("<em>" + _t("generic_error") + "</em>");
    $("#gs_Sidebar_Results").html("<em>" + _t("generic_error") + "</em>")
}


function getCompanyId() {
    setTimeout(function() {
        if (gscompanyid == null) loadFailed()
    }, 1E4);
    var obj = new JSONscriptRequest(protocol + "//api.getsatisfaction.com/companies/" + gscompanyname + ".json?callback=getCompanyIdCallback");
    obj.buildScriptTag();
    obj.addScriptTag()
}

function getCompanyIdCallback(j) {
    var searchresult = "";
    if (j == null) alert(_t("generic_error"));
    else gscompanyid = j.id
}



function searchScript(term) {
    if (gscompanyid == null) {
        setTimeout(function() {
            searchScript(term)
        }, 10);
        return
    }
    var obj = new JSONscriptRequest(protocol + "//api.getsatisfaction.com/companies/" + gscompanyid + "/topics.json?q=" + term + "&callback=searchResults&limit=5");
    obj.buildScriptTag();
    obj.addScriptTag()
}
function searchResults(j) {
    var searchresult = "";
    if (j == null) alert(_t("generic_error"));
    else {
        for (var i = j.data.length - 1; i >= 0; i--) {
            createddate = j.data[i].last_active_at;
            var dateparts = /^(2...)\/(..)\/(..) (..\:..\:..) \+.../i.exec(createddate);
            searchresult += '<div class="kb_topic gs-search-result gs-' + j.data[i].style + '">' + '<div class="kb_topic_name">' + '<a class="kb_topic_a" href="' + j.data[i].at_sfn + '">' + j.data[i].subject + "</a>" + "</div>" + '<div class="kb_topic_desc">' + 'Asked by <a class="creator_name" href="' +
                j.data[i].author.at_sfn + '">' + j.data[i].author.name + "</a>" + '<span class="divider"></span>' + '<a href="' + j.data[i].at_sfn + '">' + _t("generic_replies").format(j.data[i].reply_count) + "</a>" + "</div><br></div>"
        }
        document.getElementById("gs_search_results").innerHTML = searchresult;
        if (j.total == 0) document.getElementById("gs_search_title").innerHTML = "<h3>" + _t("search_header_no_results") + "</h3>";
        else document.getElementById("gs_search_title").innerHTML = "<h5>" + _t("search_header_with_results").format(j.total) + ' <a href="' +
            gsurl + "/searches?query=" + getURLParameter("q") + '&x=0&y=0&style=topics">' + _t("view_all") + "</a></h5>"
    }
}


//RECENT QUESTIONS
function gsRecentQuestion() {
    if (gscompanyid == null) {
        setTimeout(function() {
            gsRecentQuestion()
        }, 10);
        return
    }
    var obj = new JSONscriptRequest(protocol + "//api.getsatisfaction.com/companies/" + gscompanyid + "/topics.json?style=question&callback=returnGS_questions&limit=5&sort=recently_active");
    obj.buildScriptTag();
    obj.addScriptTag()
}
function returnGS_questions(j) {
    var searchresult = "";
    if (j == null) alert(_t("generic_error"));
    else {
        searchresult += '<div class="topic"><h4>' + _t("questions_header") + "</h4>";
        searchresult += '<h5 class="gs-question">' + _t("generic_results_subheader").format(j.total) + '<a href="' + gsurl + '/questions/recent">' + _t("view_all") + "</a></h5><ul>";
        for (var i = 0; i < j.data.length; i++) {
            createddate = j.data[i].last_active_at;
            var dateparts = /^(2...)\/(..)\/(..) (..\:..\:..) \+.../i.exec(createddate);
            searchresult += '<li><a href="' + j.data[i].at_sfn +
                '">' + j.data[i].subject + "</a></li>"
        }
        searchresult += "</ul>";
        document.getElementById("gs_questions").innerHTML = searchresult
    }
}


//RECENT IDEAS
function gsRecentIdea() {
    if (gscompanyid == null) {
        setTimeout(function() {
            gsRecentIdea()
        }, 10);
        return
    }
    var obj = new JSONscriptRequest(protocol + "//api.getsatisfaction.com/companies/" + gscompanyid + "/topics.json?style=idea&callback=returnGS_ideas&limit=5&sort=recently_active");
    obj.buildScriptTag();
    obj.addScriptTag()
}
function returnGS_ideas(j) {
    var searchresult = "";
    if (j == null) alert(_t("generic_error"));
    else {
        searchresult += '<div class="topic"><h4>' + _t("ideas_header") + "</h4>";
        searchresult += '<h5 class="gs-idea">' + _t("generic_results_subheader").format(j.total) + '<a href="' + gsurl + '/ideas/recent">' + _t("view_all") + "</a></h5><ul>";
        for (var i = j.data.length - 1; i >= 0; i--) {
            createddate = j.data[i].last_active_at;
            var dateparts = /^(2...)\/(..)\/(..) (..\:..\:..) \+.../i.exec(createddate);
            searchresult += '<li><a href="' + j.data[i].at_sfn +
                '">' + j.data[i].subject + "</a></li>"
        }
        searchresult += "</ul>";
        document.getElementById("gs_ideas").innerHTML = searchresult
    }
}


//RECENT PROBLEMS 
function gsRecentProblem() {
    if (gscompanyid == null) {
        setTimeout(function() {
            gsRecentProblem()
        }, 10);
        return
    }
    var obj = new JSONscriptRequest(protocol + "//api.getsatisfaction.com/companies/" + gscompanyid + "/topics.json?style=problem&callback=returnGS_problems&limit=5&sort=recently_active");
    obj.buildScriptTag();
    obj.addScriptTag()
}
function returnGS_problems(j) {
    var searchresult = "";
    if (j == null) alert(_t("generic_error"));
    else {
        searchresult += '<div class="topic"><h4>' + _t("problems_header") + "</h4>";
        searchresult += '<h5 class="gs-problem">' + _t("generic_results_subheader").format(j.total) + '<a href="' + gsurl + '/problems/recent">' + _t("view_all") + "</a></h5><ul>";
        for (var i = j.data.length - 1; i >= 0; i--) {
            createddate = j.data[i].last_active_at;
            var dateparts = /^(2...)\/(..)\/(..) (..\:..\:..) \+.../i.exec(createddate);
            searchresult += '<li><a href="' + j.data[i].at_sfn +
                '">' + j.data[i].subject + "</a></li>"
        }
        searchresult += "</ul>";
        document.getElementById("gs_problems").innerHTML = searchresult
    }
}



// RECENT PRAISES
function gsRecentPraise() {
    if (gscompanyid == null) {
        setTimeout(function() {
            gsRecentPraise()
        }, 10);
        return
    }
    var obj = new JSONscriptRequest(protocol + "//api.getsatisfaction.com/companies/" + gscompanyid + "/topics.json?style=praise&callback=returnGS_praises&limit=5&sort=recently_active");
    obj.buildScriptTag();
    obj.addScriptTag()
}

function returnGS_praises(j) {
    var searchresult = "";
    if (j == null) alert(_t("generic_error"));
    else {
        searchresult += '<div class="topic"><h4>' + _t("praises_header") + "</h4>";
        searchresult += '<h5 class="gs-praise">' + _t("generic_results_subheader").format(j.total) + '<a href="' + gsurl + '/praises/recent">' + _t("view_all") + "</a></h5><ul>";
        for (var i = j.data.length - 1; i >= 0; i--) {
            createddate = j.data[i].last_active_at;
            var dateparts = /^(2...)\/(..)\/(..) (..\:..\:..) \+.../i.exec(createddate);
            searchresult += '<li><a href="' + j.data[i].at_sfn +
                '">' + j.data[i].subject + "</a></li>"
        }
        searchresult += "</ul>";
        document.getElementById("gs_praises").innerHTML = searchresult
    }
}



//SIDEBAR RESULTS
function RecentGSActivity() {
    if (gscompanyid == null) {
        setTimeout(function() {
            RecentGSActivity()
        }, 10);
        return
    }
    var obj = new JSONscriptRequest(protocol + "//api.getsatisfaction.com/companies/" + gscompanyid + "/topics.json?sort=recently_active&callback=gsSideBarResults&limit=6");
    obj.buildScriptTag();
    obj.addScriptTag()
}

function gsSideBarResults(j) {
    var searchresult = "<ul>";
    if (j == null) alert(_t("generic_error"));
    else {
        for (var i = j.data.length - 1; i >= 0; i--) {
            createddate = j.data[i].last_active_at;
            var dateparts = /^(2...)\/(..)\/(..) (..\:..\:..) \+.../i.exec(createddate);
            searchresult += '<li class="tweet_odd gs-' + j.data[i].style + '"><div class="tweet_time">' + '<span class="gs_sidebarlink"><a href="' + j.data[i].at_sfn + '">' + j.data[i].subject + "</a></span>" + "</div>" + '<span class="tweet_time">' + _t("generic_replies").format(j.data[i].reply_count) +
                "<br/></span></li>"
        }
        searchresult += "</ul>";
        document.getElementById("gs_Sidebar_Results").innerHTML = searchresult
    }
};