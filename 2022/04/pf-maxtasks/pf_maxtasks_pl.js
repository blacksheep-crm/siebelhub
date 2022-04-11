PFPostload = function () {
    if (SiebelApp.S_App.GetProfileAttr("PFChckUsrMxTskCheck") == "True" && SiebelApp.S_App.GetProfileAttr("ApplicationName") == "Siebel Universal Agent" && !consts.isDefined("CountUserSessions") && true === true) {
        //if (!consts.isDefined("CountUserSessions") && true === true) {
        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
        consts.set("CountUserSessions", "true");
        SiebelJS.Log("custompl.js: " + time + " constant CountUserSessions was not set. Check User Max Tasks (Timeout = " + SiebelApp.S_App.GetProfileAttr('PFChckUsrMxTskWait') + ")");
        setTimeout(function () {
            //https://www.siebelhub.com/main/2014/07/asynchronous-business-service-invocation-in-siebel-open-ui.html
            //https://docs.oracle.com/cd/E63029_01/books/PDF/ConfigOpenUI.pdf
            //var oSvc = SiebelApp.S_App.GetService("CountUserSessions"); only for testing. BS have to be added as Application Property
            var oSvc = SiebelApp.S_App.GetService("PF Run External Application");
            var inPS = SiebelApp.S_App.NewPropertySet();
            var config = {};
            //inPS.SetProperty("sTabs", arrTabs.toString());
            inPS.SetProperty("stopTask", "run");
            //nothing new until here, but where’s the output PS?
            if (oSvc) {
                //var config = {async: true, scope: this, selfbusy: true};
                config.async = true; //true. Siebel Open UI makes an asynchronous AJAX call.
                config.scope = this; //Set to the following value: this
                config.selfbusy = true; //true. Do not display a busy cursor.
                config.opdecode = true; //Decode operation. Set to one of the following values: true. Decode the AJAX reply.
                config.cb = function () { //Callback. Identifies the method that Siebel Open UI calls after it receives a reply from the AJAX call.
                    var outPS = arguments[2];
                    //debugger;
                    if (outPS !== null) { //if (resultSet) {
                        var resultSet = outPS.GetChildByType("ResultSet");
                        SiebelJS.Log("custompl.js nTasks:" + resultSet.GetProperty("nTasks"));
                        SiebelJS.Log("custompl.js sEnt:" + resultSet.GetProperty("sEnt"));
                        SiebelJS.Log("custompl.js sGtwy:" + resultSet.GetProperty("sGtwy"));
                        SiebelJS.Log("custompl.js sSrvr:" + resultSet.GetProperty("sSrvr"));
                        SiebelJS.Log("custompl.js sTime:" + resultSet.GetProperty("sTime"));
                        SiebelJS.Log("custompl.js sTaskID:" + resultSet.GetProperty("sTaskID"));
                        SiebelJS.Log("custompl.js sTaskIdStop:" + resultSet.GetProperty("sTaskIdStop"));
                        SiebelJS.Log("custompl.js stopTask:" + resultSet.GetProperty("stopTask"));
                        SiebelJS.Log("custompl.js chkUsrTskMax:" + resultSet.GetProperty("chkUsrTskMax"));
                        SiebelJS.Log("custompl.js chkUsrTskCheck:" + resultSet.GetProperty("chkUsrTskCheck"));
                        SiebelJS.Log("custompl.js chkUsrTskWait:" + resultSet.GetProperty("chkUsrTskWait"));
                        //SiebelJS.Log("custompl.js sCmd:" + resultSet.GetProperty("sCmd"));
                        if (resultSet.GetProperty("nTasks") > resultSet.GetProperty("chkUsrTskMax")) {
                            //SiebelApp.Utils.Alert("You can only open two sessions parallel. This Session " + resultSet.GetProperty("sTaskIdStop") + " started at " + resultSet.GetProperty("sTime") + " was closed. Please use the Logout Button");

                            if ($("#_sweview_cnt_usr_sess").dialog("instance") === undefined)
                                CreateMaxTasksSessionPopup(this);
                            var msg = "You have too many open Siebel sessions, allowed are 2. If you 'Proceed', the oldest open session will be closed and this one will remain open. If you 'Cancel' this Siebel session will be closed and your older sessions remain open.";
                            //$("#_sweview_cnt_usr_sess").html(HtmlDecode(_SWEgetCMessage('CHK_USR_SESS'))).dialog("open");
                            $("#_sweview_cnt_usr_sess").html(HtmlDecode(msg)).dialog("open");
                        }
                    }
                }
                config.errcb = function () { //Error callback. Identifies the method that Siebel Open UI calls after it receives a reply from the AJAX call if this AJAX call fails.
                    //Code occurs here for the method that Siebel Open UI runs if the AJAX
                    SiebelJS.Log("Error by calling 'CheckUserSessions'");
                };
                //wait a minute, what’s this?
                oSvc.InvokeMethod("CheckUserSessions", inPS, config); //but how?
            }
        }, 5000); //LOV.PF_CHECK_USER_MAX_TASKS (WaitTime), 5000
    }

};

SiebelApp.EventManager.addListner("postload", PFPostload, this);


CreateMaxTasksSessionPopup = function (errMsg) {
    var divErr;
    if ($("#_sweview_cnt_usr_sess").length === 0) {
        divErr = "<div id = '_sweview_cnt_usr_sess'>" + "</div>";
        if ($("#_sweview").length !== 0) {
            $("#_sweview").append(divErr);
        }
    }
    $("#_sweview_cnt_usr_sess").dialog({
        autoOpen: false,
        modal: true,
        dialogClass: "no-close-x",
        close: function () {
            $(this).dialog("destroy");
        },
        title: _SWEgetMessage("IDS_CLIENT_WARNING"),
        show: true,
        hide: true,
        height: "auto",
        width: 480,
        position: {
            my: "center",
            at: "center",
            of: window
        },
        buttons: [{
            id: "btn-continue",
            text: "Continue", //_SWEgetCMessage('CONTINUE'),
            click: function () {
                var srvcnm = null;
                var inpPS = null;
                var optPS = null;
                var outputSet = null;
                try {
                    srvcnm = SiebelApp.S_App.GetService("PF Run External Application");
                    inpPS = SiebelApp.S_App.NewPropertySet();
                    optPS = SiebelApp.S_App.NewPropertySet();
                    inpPS.SetProperty("stopTask", "stop");
                    if (srvcnm) {
                        optPS = srvcnm.InvokeMethod("CheckUserSessions", inpPS);
                        outputSet = optPS.GetChildByType("ResultSet");
                        if (outputSet) {
                            SiebelJS.Log("custompl.js stop nTasks:" + outputSet.GetProperty("nTasks"));
                            SiebelJS.Log("custompl.js stop sEnt:" + outputSet.GetProperty("sEnt"));
                            SiebelJS.Log("custompl.js stop sGtwy:" + outputSet.GetProperty("sGtwy"));
                            SiebelJS.Log("custompl.js stop sSrvr:" + outputSet.GetProperty("sSrvr"));
                            SiebelJS.Log("custompl.js stop sTime:" + outputSet.GetProperty("sTime"));
                            SiebelJS.Log("custompl.js stop sTaskID:" + outputSet.GetProperty("sTaskID"));
                            SiebelJS.Log("custompl.js stop sTaskIdStop:" + outputSet.GetProperty("sTaskIdStop"));
                            SiebelJS.Log("custompl.js stop stopTask:" + outputSet.GetProperty("stopTask"));
                            //SiebelJS.Log("custompl.js chkUsrTskMax:" + resultSet.GetProperty("chkUsrTskMax"));
                            //SiebelJS.Log("custompl.js chkUsrTskCheck:" + resultSet.GetProperty("chkUsrTskCheck"));
                            //SiebelJS.Log("custompl.js chkUsrTskWait:" + resultSet.GetProperty("chkUsrTskWait"));
                            //SiebelJS.Log("custompl.js stop sCmd:" + outputSet.GetProperty("sCmd"));
                        }
                    }
                } catch (ex) {
                    SiebelJS.Log("error in stopTask: " + ex.toString())
                }
                finally {
                    srvcnm = null;
                    inpPS = null;
                    optPS = null;
                    outputSet = null;
                }

                $(this).dialog("destroy"); //does not work when BC is changed on step off > $(this).dialog("close");
                $(this).empty();
            },
            'class': 'siebui-ctrl-btn appletButton'
        }, {
            id: "btn-cancel",
            text: _SWEgetMessage('RTCPopupCancel'),
            click: function () {
                $(this).dialog("destroy"); //does not work when BC is changed on step off > $(this).dialog("close");
                $(this).empty();
                SiebelApp.S_App.LogOff();
            },
            'class': 'siebui-ctrl-btn appletButton'
        }
        ]
    });
};

