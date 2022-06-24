DefaultListRendererPR.prototype.BindEvents = function () {
/*provided by Siebel Hub user Jose Luis
USE AT YOUR OWN PERIL */
  
            SiebelAppFacade.DefaultListRendererPR.superclass.BindEvents.apply(this, arguments);

            var myPM = this.GetPM();

            var placeHolder = "s_" + myPM.Get("GetFullId") + "_div";

            $("#" + placeHolder).bind('mousewheel', function (e) {

                        if (e.altKey && e.originalEvent.wheelDelta / 120 > 0) { // 120 Up 1 click

                                    //SiebelJS.Log('scrolling up ! ' + e.originalEvent.wheelDelta);

                                    e.preventDefault(); // to prevent default browser scrolling

                                    e.stopImmediatePropagation(); // to prevent default browser scrolling

                                    //to prevent unnecessary pop ups using canInvoke first

                                    if (myPM.ExecuteMethod("CanInvokeMethod", "GotoPrevious")) { // GotoPreviousSet

                                                myPM.ExecuteMethod("InvokeMethod", "GotoPrevious", null, false); // GotoPreviousSet

                                    }

                        } else if (e.altKey && e.originalEvent.wheelDelta / 120 < 0) { // -120 Down 1 click

                                    //SiebelJS.Log('scrolling down ! ' + e.originalEvent.wheelDelta);

                                    e.preventDefault(); // to prevent default browser scrolling

                                    e.stopImmediatePropagation(); // to prevent default browser scrolling

                                    //to prevent unnecessary pop ups using canInvoke first

                                    if (myPM.ExecuteMethod("CanInvokeMethod", "GotoNext")) { // GotoNextSet

                                                myPM.ExecuteMethod("InvokeMethod", "GotoNext", null, false); // GotoNextSet

                                    }

                        }

            });

};
