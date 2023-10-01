//EDUCATIONAL SAMPLE!!! DO NOT USE IN MISSION-CRITICAL ENVIRONMENTS!!!
//sample "postload" (rather "AppInit") file for the CSV Import demo
//register like a postload listener with Application/Common

//mutation observer to catch rogue popups
//https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver

BCRMCreatePopupObserver = function () {
    // Select the node that will be observed for mutations
    const body = $("body")[0];

    // Options for the observer (which mutations to observe)
    const config = { attributes: false, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === "childList") {
                //console.log("A child node has been added or removed.");
                const cm = SiebelAppFacade.ComponentMgr;
                const applets = ["blacksheep Import Popup Applet", "Another Applet"];
                for (let i = 0; i < applets.length; i++) {
                    var an = applets[i];
                    if (cm.FindComponent(an) !== null) {
                        //popup is open
                        setTimeout(function () {
                            BCRMEnhancePopupApplet(an);
                        }, 100);
                        break;
                    }
                }
            } else if (mutation.type === "attributes") {
                //console.log(`The ${mutation.attributeName} attribute was modified.`);
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(body, config);
};

// Later, you can stop observing
//observer.disconnect();

BCRMEnhancePopupApplet = function (an) {

    const cm = SiebelAppFacade.ComponentMgr;
    const pm = cm.FindComponent(an).GetPM();
    const pr = pm.GetRenderer();
    const fi = pm.Get("GetFullId");
    const cs = pm.Get("GetControls");
    let ae = $("#" + fi);
    let dc = ae.closest(".ui-dialog-content");

    if (pm.Get("BCRM_ENHANCED") !== "true") {
        if (an == "blacksheep Import Popup Applet") {

            let bel = pr.GetUIWrapper(cs["Browse"]).GetEl();
            let iel = pr.GetUIWrapper(cs["Import"]).GetEl();
            let filesArray = bel[0].files;
            var err_text = "";

            ae.find("#bcrm_pbar").remove();
            dc.dialog("option", { width: 500 });

            if (filesArray.length == 0) {
                iel.addClass("appletButtonDis");
            }

            bel.on("change", function (e) {
                let filesArray = this.files;
                if (filesArray.length > 0) {
                    //let iel = pr.GetUIWrapper(cs["Import"]).GetEl();
                    iel.removeClass("appletButtonDis");
                    ae.find("#bcrm_error").remove();
                }
            });

            iel.on("click", function (e) {
                pm.SetProperty("BCRM_ERROR", "false");
                let filesArray = bel[0].files;
                pm.SetProperty("BCRM_FILENAME", filesArray[0].name);
                pm.SetProperty("BCRM_FILESIZE", filesArray[0].size);
                if (ae.find("#bcrm_pbar").length == 0) {
                    let pbar = $("<div id='bcrm_pbar'>");
                    ae.find(".AppletButtons").parent().parent().before(pbar);
                    pbar.progressbar({ value: false });
                }
            });


            dc.parent().on("dialogclose", function (e, ui) {
                e.stopImmediatePropagation();
                let profile2 = SiebelApp.S_App.GetProfileAttr("blacksheep_IMPORT_2");
                profile2 = profile2.replace(/\'/g, "\"");
                profile2 = profile2.replace(/\\/g, "\\\\");
                profile2 = JSON.parse(profile2);
                let csv_count = profile2["RecordCountCSV"];
                csv_count = csv_count.replace(/,/g, '');
                let fileinfo = "\nFile: " + pm.Get("BCRM_FILENAME") + "\nSize: " + pm.Get("BCRM_FILESIZE") + " bytes"
                fileinfo += "\nRecord Count: " + csv_count;
                if (pm.Get("BCRM_ERROR") == "false") {
                    SiebelApp.Utils.Alert("Import completed successfully." + fileinfo);

                    //show status object
                    var so = BCRMGetStatusObject();
                    var sotbl = $("<div>").append(BCRMRS2HTML(so));
                    sotbl.css("overflow", "auto");
                    sotbl.dialog({
                        title: "Status Object",
                        width: 400,
                        height: 600
                    });

                }
                else {
                    SiebelApp.Utils.Alert("Import failed" + fileinfo);
                }
            });

            pm.AttachPostProxyExecuteBinding("Import", function (methodName, inputPS, outputPS) {
                if (outputPS.GetChildByType("Errors") != null) {
                    pm.SetProperty("BCRM_ERROR", "true");
                    err_text = outputPS.GetChildByType("Errors").GetChild(0).GetProperty("ErrMsg");
                    ae.find("#bcrm_pbar").remove();
                    let err = $("<span id='bcrm_error' style='background:lightcoral;'>").text(HtmlDecode(err_text) + "\nUpload another file and try again.");
                    ae.find(".AppletButtons").parent().parent().before(err);
                }
            });
        }
        pm.SetProperty("BCRM_ENHANCED", "true");
    }
}

BCRMGetStatusObject = function () {
    var so = SiebelApp.S_App.GetProfileAttr("blacksheep_IMPORT_SO");
    var ps = SiebelApp.S_App.NewPropertySet();
    ps.DecodeFromString(so);
    ps = ps.GetChild(0);
    var isvalid = true;
    var soj = [];
    var propcount = ps.GetChild(0).GetPropertyCount();
    if (propcount == 0) {
        isvalid = false;
    }
    var count = ps.GetChildCount();
    if (isvalid) {
        for (i = 0; i < count; i++) {
            var obj = {};
            var props = ps.GetChild(i).propArray;
            for (p in props) {
                if (typeof (props[p]) !== "function") {
                    obj[p] = props[p];
                }
            }
            soj.push(obj);
        }
    }
    else {
        //soj["Message"] = "No Status Object returned.";
    }
    return soj;
};

BCRMRS2HTML = function (rs) {
    //table header
    var t = $("<table>");
    var h = $("<thead><tr>");
    for (c in rs[0]) {
        if (typeof (c) !== "undefined") {
            var th = $("<th>");
            th.text(c);
            h.find("tr").append(th);
        }
    }
    //table body
    var b = $("<tbody>")
    for (r in rs) {
        var tr = $("<tr>");
        for (f in rs[r]) {
            if (typeof (f) !== "undefined") {
                var td = $("<td>");
                td.text(rs[r][f]);
                tr.append(td);
            }
        }
        b.append(tr);
    }
    t.append(h);
    t.append(b);
    return t;
}

//listener
SiebelApp.EventManager.addListner("AppInit", BCRMCreatePopupObserver, this);
