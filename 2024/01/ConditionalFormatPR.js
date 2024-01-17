//Regenerate using:https://duncanford.github.io/prpm-code-generator/?prpm=PR&object=DesktopList&name=ConditionalFormat&userprops=&comments=No&logging=No
/*
EDUCATIONAL SAMPLE!!!!
DO NOT USE IN PRODUCTION!!!!
(c) 2024 blacksheep IT consulting
 */
if (typeof(SiebelAppFacade.ConditionalFormatPR) === "undefined") {

    SiebelJS.Namespace("SiebelAppFacade.ConditionalFormatPR");
    define("siebel/custom/ConditionalFormatPR", ["siebel/jqgridrenderer"],
        function () {
        SiebelAppFacade.ConditionalFormatPR = (function () {

            function ConditionalFormatPR(pm) {
                SiebelAppFacade.ConditionalFormatPR.superclass.constructor.apply(this, arguments);
            }

            SiebelJS.Extend(ConditionalFormatPR, SiebelAppFacade.JQGridRenderer);

            ConditionalFormatPR.prototype.Init = function () {
                SiebelAppFacade.ConditionalFormatPR.superclass.Init.apply(this, arguments);
            }

            ConditionalFormatPR.prototype.ShowUI = function () {
                SiebelAppFacade.ConditionalFormatPR.superclass.ShowUI.apply(this, arguments);
            }

            ConditionalFormatPR.prototype.BindData = function (bRefresh) {
                SiebelAppFacade.ConditionalFormatPR.superclass.BindData.apply(this, arguments);
                this.ApplyConditionalFormat();
            }

            ConditionalFormatPR.prototype.BindEvents = function () {
                SiebelAppFacade.ConditionalFormatPR.superclass.BindEvents.apply(this, arguments);
            }

            ConditionalFormatPR.prototype.EndLife = function () {
                SiebelAppFacade.ConditionalFormatPR.superclass.EndLife.apply(this, arguments);
            }

            ConditionalFormatPR.prototype.ApplyConditionalFormat = function () {
                /* add to custom CSS file:
                tr.cx-prob-low td[id*='Primary_Revenue_Win_Probability'] {
                background: palevioletred!important;
                }
                tr.cx-prob-mid td[id*='Primary_Revenue_Win_Probability'] {
                background: palegoldenrod!important;
                }
                tr.cx-prob-high td[id*='Primary_Revenue_Win_Probability'] {
                background: palegreen!important;
                }
                 */

                let pm = this.GetPM();
                let rs = pm.Get("GetRawRecordSet");
                let grid = this.GetGrid();

                grid.find("tr.cx-prob-low").removeClass("cx-prob-low");
                grid.find("tr.cx-prob-mid").removeClass("cx-prob-mid");
                grid.find("tr.cx-prob-high").removeClass("cx-prob-high");

                //demo for Opportunity Probability
                let field = 'Primary Revenue Win Probability';
                if (rs.length > 0) {
                    if (typeof(rs[0][field]) !== "undefined") {
                        for (r in rs) {
                            let row = parseInt(r) + 1;
                            let cls = "cx-prob"
                                let prob = parseInt(rs[r][field]);
                            if (prob <= 20) {
                                cls = "cx-prob-low";
                            } else if (prob >= 21 && prob <= 70) {
                                cls = "cx-prob-mid";
                            } else if (prob >= 71 && prob <= 100) {
                                cls = "cx-prob-high";
                            }
                            grid.find("tr#" + row).addClass(cls);
                        }
                    }
                }
            }
            return ConditionalFormatPR;
        }
            ());
        return "SiebelAppFacade.ConditionalFormatPR";
    })
}
