/* blacksheep CRM shoelace demo
*  requires side menu (Side Menu/Aurora) navigation in Open UI
********************************************************************
* STRICTLY EDUCATIONAL! DO NOT USE IN MISSION-CRITICAL ENVIRONMENTS!
********************************************************************
*/

//globals
var BCRM_SL_LOADED = false;
var BCRM_SL_SHOWTOASTONLOAD = true;
var BCRM_SL_ICONS = "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0/dist/assets/icons/";

//Inject shoelace
if (!BCRM_SL_LOADED) {
    if ($("link[href*='shoelace']").length == 0) {
        let slcss = $('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0/dist/themes/light.css" />');
        let sljs = $('<script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0/dist/shoelace.js"></script>');
        let bcrmslcss = $('<link rel="stylesheet" href="files/custom/bcrm-shoelace.css" />');
        $("head").append(slcss);
        $("head").append(sljs);
        $("head").append(bcrmslcss);
        BCRM_SL_LOADED = true;
    }
}

//toast á la shoelace
BCRMToast = function (message, variant = 'primary', icon = 'info-circle', duration = 3000) {
    icon = BCRM_SL_ICONS + icon + ".svg";
    const toastme = Object.assign(document.createElement('sl-alert'), {
        variant,
        closable: true,
        duration: duration,
        innerHTML: `
        <sl-icon src="${icon}" slot="icon"></sl-icon>
        ${message}
      `
    });
    document.body.append(toastme);
    return toastme.toast();
};

//main container
BCRMSLAddContainer = function () {
    if ($("#bcrm_sl_container").length == 0) {
        let c = $("<div id='bcrm_sl_container'>");
        let t = $("<div id='bcrm_sl_topnav'><div id='bcrm_sl_title'></div></div>");
        let v = $("<div id='bcrm_sl_view'>");
        let b = $("<div id='bcrm_sl_bottomnav'>");
        c.append(t);
        c.append(v);
        c.append(b);
        $("#_sweclient").before(c);
    }
};

//Navigation scraper
BCRMSLGetNavigation = function () {
    //screens
    let nav = {};
    nav.screens = {};
    let screens = nav.screens;
    let screenlist = $("ul.ui-tabs-nav")[0];
    $(screenlist).find("li").each(function (x) {
        let uid = $(this).attr("aria-labelledby");
        if (typeof (uid) !== "undefined") {
            let un = $(this).text();
            let active = $(this).attr("aria-selected");
            screens[un] = {};
            screens[un]["uid"] = uid;
            screens[un]["label"] = un;
            screens[un]["active"] = active == "true" ? true : false;
        }
    })
    return nav;
};

//Navigation Drawer (aka "the menu")
BCRMSLGetNavDrawer = function () {
    let apptitle = SiebelApp.S_App.GetAppTitle();
    let drawer = $('<sl-drawer label="' + apptitle + '" placement="start" class="bcrmsl-nav-drawer" style="--size: 25rem;"><sl-button class="dp-drawer-closebtn" slot="footer" variant="primary">Close</sl-button></sl-drawer>');
    const closebtn = drawer[0].querySelector('.dp-drawer-closebtn');
    closebtn.addEventListener('click', () => {
        $(".bcrmsl-nav-drawer")[0].open = false;
        //$("#bcrmsl_nav_drawer_btn").show();
    });
    return drawer;
};

//create the content tree for navigation drawer
BCRMSLGetNavDrawerContent = function (options) {
    let expandhome = options.expandhome;
    let nav = BCRMSLGetNavigation();
    let screens = nav.screens;
    let tree = $("<sl-tree></sl-tree>");
    let expanded = "";
    let selected = "";
    for (s in screens) {
        if (screens[s].active) {
            selected = "selected";
        }
        let item = $("<sl-tree-item id='" + screens[s].uid + "' class='bcrmsl-screen-item' " + selected + " " + expanded + ">" + screens[s].label + "</sl-tree-item>");
        item[0].addEventListener("click", e => {
            let uid = e.target.id;
            $("li[aria-labelledby='" + uid + "']").find("a").click();
        });
        selected = "";

        //scrape screen home page
        const home_applets = ["Frequently Viewed", "Recent"]; //iHelp removed
        if (screens[s].active && expandhome) {
            let am = SiebelApp.S_App.GetActiveView().GetAppletMap();
            for (a in am) {
                let pm = SiebelAppFacade.ComponentMgr.FindComponent(a).GetPM();
                var fid = pm.Get("GetFullId");
                let ae = $("#" + fid);
                let title = ae.find(".siebui-applet-buttons").find(".siebui-screen-hp-title").text();
                for (let i = 0; i < home_applets.length; i++) {
                    if (title.indexOf(home_applets[i]) > -1) {
                        if (ae.find(".siebui-screen-hp-content").find("a").length > 0) {
                            let subitem = $("<sl-tree-item id='home_" + fid + "' class='bcrmsl-home-item' expanded>" + title + "</sl-tree-item>");
                            ae.find(".siebui-screen-hp-content").find("a").each(function (x) {
                                $(this).attr("bcrmid",fid + "_" + x);
                                let title = $(this).text();
                                let uid = this.id;
                                let ssubitem = $("<sl-tree-item id='" + uid + "' bcrmid='" + (fid + "_" + x) + "' bcrmapplet='" + fid + "' class='bcrmsl-home-sub-item'>" + title + "</sl-tree-item>");
                                ssubitem[0].addEventListener("click", e => {
                                    let uid = e.target.id;
                                    let fid = $(e.target).attr("bcrmapplet");
                                    let x = $(e.target).attr("bcrmid");
                                    $(".bcrmsl-nav-drawer")[0].open = false;
                                    $("#" + fid).find("a[bcrmid='" + x + "']").click();
                                });
                                subitem.append(ssubitem);
                            });
                            item.append(subitem);
                        }
                        break;
                    }
                }
            }
            item[0].expanded = true;
        }
        tree.append(item);
    }
    return tree;
};

//open/refresh drawer
BCRMSLOpenNavDrawer = function (options) {
    let drawer;
    let screens = BCRMSLGetNavDrawerContent(options);
    if ($(".bcrmsl-nav-drawer").length == 0) {
        drawer = BCRMSLGetNavDrawer();
        drawer.append("<div id='bcrm-nav-screens'>");
        drawer.find("#bcrm-nav-screens").append(screens);
        $("#bcrm_sl_topnav").prepend(drawer);
    }
    else {
        drawer = $(".bcrmsl-nav-drawer");
        drawer.find("#bcrm-nav-screens").empty();
        drawer.find("#bcrm-nav-screens").append(screens);
    }
    drawer[0].open = true;
};

//add button for drawer/main menu
BCRMSLAddNavDrawerButton = function () {
    let btn;
    let icon = "three-dots-vertical";
    icon = BCRM_SL_ICONS + icon + ".svg";
    if ($("#bcrmsl_nav_drawer_btn").length == 0) {
        btn = $('<div id="bcrmsl_nav_drawer_btn"><sl-icon-button class="open-drawer-btn" src="' + icon + '" label="Navigation" style="font-size:2em;"></sl-icon-button></div>');
        btn.find(".open-drawer-btn").on("click", function () {
            BCRMSLOpenNavDrawer({ expandhome: false });
        });
        $("#bcrm_sl_topnav").prepend(btn);
    }
};

//Get record set with actual display names
BCRMGetDisplayRecordSet = function (pm) {
    //get mapped record set
    var cs = pm.Get("GetControls");
    var rd = pm.Get("GetRecordSet");
    var rs = [];
    var hidden = ["Outline Number", "Has Children", "Is Expanded", "Id", "Parent Asset Id", "Hierarchy Level", "Is Leaf", "Parent Id"];
    //get record set with display names
    for (var i = 0; i < rd.length; i++) {
        var t = {};
        for (fx in rd[i]) {
            if (typeof (cs[fx]) !== "undefined") {
                t[cs[fx].GetDisplayName()] = rd[i][fx];
            }
            else if (fx != "" && typeof (fx) !== "undefined") {
                if (hidden.indexOf(fx) == -1) {
                    t[fx] = rd[i][fx];
                }
            }
        }
        rs.push(t);
    }
    return rs;
};

//applet scraper
BCRMSLGetApplet = function(pm){
    let atype = "other";
    if (pm.Get("GetListOfColumns")){
        atype = "list";
    }
    let rs = BCRMGetDisplayRecordSet(pm);
    let rss = pm.Get("GetRawRecordSet"); 
    let sel = pm.Get("GetSelection");
    let fid = pm.Get("GetFullId");
    let c = $("<div id='bcrmsl_" + fid +"' class='bcrmsl-applet'>");
    if (atype == "list"){
        for (r in rs){
            let record = rs[r];
            let cid = rss[r]["Id"];
            if (typeof(cid) !== "undefined"){
                let card = $("<sl-card id='" + cid + "' class='bcrmsl-card'></sl-card>");
                if (r == sel){
                    card.addClass("selected");
                }
                for (field in record){
                    if (field != "SelectAll"){
                        let rc = $("<div class='bcrmsl-field'>");
                        let lbl = $("<div class='bcrmsl-label'>").text(field);
                        let val = $("<div class='bcrmsl-value'>").text(record[field]);
                        rc.append(lbl);
                        rc.append(val);
                        card.append(rc);
                    }
                }
                c.append(card);
            }
        }
    }
    return c;
};

BCRMSLShowApplet = function(pm){
    let applet = BCRMSLGetApplet(pm);
    $("#bcrm_sl_view").append(applet);
};

//postload handler
BCRMShoelaceUI = function () {

    var vn = SiebelApp.S_App.GetActiveView().GetName();
    var am = SiebelApp.S_App.GetActiveView().GetAppletMap();

    BCRMSLAddContainer();

    BCRMSLAddNavDrawerButton();

    if (BCRM_SL_SHOWTOASTONLOAD) {
        BCRMToast("blacksheep CRM shoelace demo loaded.", "primary", "flower1", 5000);
        BCRM_SL_SHOWTOASTONLOAD = false;
    }

    //refresh drawer on screen home views (with scraped content from e.g. Recent Records)
    if ($(".bcrmsl-nav-drawer").length > 0) {
        if ($(".bcrmsl-nav-drawer")[0].open) {
            if (vn.indexOf("Home") == -1 || vn.indexOf("Home Page View") > -1) {
                $(".bcrmsl-nav-drawer")[0].open = false;
            }
            else {
                //reopen drawer
                $(".bcrmsl-nav-drawer")[0].open = false;
                BCRMSLOpenNavDrawer({ expandhome: true });
            }
        }
    }

    //load applet scrapings for non-home views
    if (vn.indexOf("Home") == -1) {
        $("#bcrm_sl_view").empty();
        for (a in am){
            let pm = SiebelAppFacade.ComponentMgr.FindComponent(a).GetPM();
            BCRMSLShowApplet(pm);
        }
    }

    //update title
    $("#bcrm_sl_title").text(document.title.substring(0,document.title.indexOf(":")));
};
SiebelApp.EventManager.addListner("postload", BCRMShoelaceUI, this);
