//BCRM OCI Adapter
//Example to connect to Oracle Cloud Infrastructure using OCI REST API
//PURELY EDUCATIONAL
//DO NOT USE IN MISSION-CRITICAL ENVIRONMENTS!!!!!
//test payload for language
/*
var tbody = {
    "documents": [
        {
            "key": "PII",
            "text": "This is a phone number (777)-1234-567 and this is an email address alex@siebelhub.com and this is a company name Oracle Corp.",
            "languageCode": "en"
        },
        {
            "key": "Red Bull",
            "text": "Red Bull Racing Honda, the four-time Formula-1 World Champion team, has chosen Oracle Cloud Infrastructure (OCI) as their infrastructure partner.",
            "languageCode": "en"
        },
        {
            "key": "OCI",
            "text": "OCI recently added new services to existing compliance program including SOC, HIPAA, and ISO to enable our customers to solve their use cases. We also released new white papers and guidance documents related to Object Storage, the Australian Prudential Regulation Authority (APRA), and the Central Bank of Brazil. These resources help regulated customers better understand how OCI supports their regional and industry-specific compliance requirements. Not only are we expanding our number of compliance offerings and regulatory alignments, we continue to add regions and services at a faster clip.",
            "languageCode": "en"
        }
    ]
};
*/
//test payload for vision/image
//https://vision.aiservice.eu-frankfurt-1.oci.oraclecloud.com/20220125/actions/analyzeDocument
/*
var ibody = {
    "features": [
        {
            "featureType": "TEXT_DETECTION"
        },
        {
            "featureType":"DOCUMENT_CLASSIFICATION"
        },
                {
            "featureType": "TABLE_DETECTION"
        },
    ],
    "document": {
        "source": "INLINE",
        "data": BCRM64
    },
    //"compartmentId": "ocid1.compartment.oc1..aaaaaaaxxxxx"
};
*/
//test payload for document understanding API
/*
{
    "processorConfig": {
        "processorType": "GENERAL",
        "features": [
            {
                "featureType": "TEXT_EXTRACTION"
            }
        ]
    },
    "inputLocation": {
        "sourceType": "OBJECT_STORAGE_LOCATIONS",
        "objectLocations": [
            {
                "bucketName": "example",
                "namespaceName": "idexample",
                "objectName": "document.txt"
            }
        ]
    },
    "outputLocation": {
        "bucketName": "example",
        "namespaceName": "idexample",
        "prefix": ""
    },
    "compartmentId": "{{compartment_ocid}}"
}
*/
/* Test payload for GenAI Text Summarization
{
    "input": "[{\"Key Contact Last Name\":\"Bensley\",\"Key Contact First Name\":\"Thaddeus\",\"Primary Sales Rep Login\":\"TSMYTHE\",\"Parent Opportunity Name\":\"\",\"Account Location\":\"Minneapolis\",\"Region\":\"\",\"Deal Type\":\"\",\"Personal Street Address\":\"1130 W Warner Rd P O Box 22321  M S 1231-H\",\"Territory\":\"\",\"Organization\":\"PCS Technologies (HT ENU)\",\"Personal Street Address 2\":\"\",\"Channel\":\"\",\"Partner Status\":\"\",\"Personal City\":\"Tempe\",\"Personal Postal Code\":\"23456\",\"Source\":\"\",\"Loans Sum\":\"\",\"Currency Code\":\"USD\",\"Personal State\":\"AZ\",\"Personal Country\":\"USA\",\"Source Type\":\"\",\"Commitment Sum\":\"\",\"Key Contact Home Phone #\":\"\",\"Key Contact Work Phone #\":\"6025553592\",\"Sales Method\":\"Standard Sales Process\",\"Deposits Sum\":\"\",\"Quality\":\"\",\"Referral Source\":\"\",\"Primary Revenue Expected Value\":\"416500\",\"Primary Revenue Close Date\":\"12/07/2007\",\"Primary Revenue Type\":\"\",\"Primary Revenue Upside Amount\":\"0\",\"Primary Revenue Class\":\"\",\"Start Date\":\"\",\"Closure Summary\":\"\",\"Primary Revenue Downside Amount\":\"0\",\"Cost\":\"0\",\"Revenue Currency Code\":\"USD\",\"Revenue Exchange Date\":\"12/07/2007\",\"Committed\":\"N\",\"Primary Revenue Margin Amount\":\"595000\",\"Created\":\"01/07/2007 16:25:12\",\"Created By Name\":\"TSMYTHE\",\"Reason Won Lost\":\"\",\"Assignment Excluded\":\"N\",\"Minimum Contribution Amount\":\"\",\"Exchange Date\":\"12/07/2007\",\"ROI\":\"\",\"Maximum Contribution Amount\":\"\",\"Period\":\"\",\"Strategic\":\"\",\"Hurdle Rate\":\"\",\"Rebate Amount\":\"\",\"Opportunity Close Date\":\"12/07/2007\",\"Check Amount\":\"\",\"Decision Level\":\"\",\"Champion\":\"\",\"Invoice Number\":\"\",\"Check Issue Date\":\"\",\"Deal Horizon\":\"\",\"Specification Exists\":\"\",\"Check Request Date\":\"\",\"Check Number\":\"\",\"Existing Cust\":\"\",\"Payment Type\":\"\",\"Check Sent To\":\"\",\"Copayment Flag\":\"\",\"Name\":\"Honeywell Automation Master SLA Renewal\",\"Account\":\"Honeywell Automation and Control Systems\",\"Primary Revenue Amount\":\"595000\",\"Sales Rep\":\"SADMIN\",\"Partner\":\"\",\"Primary Revenue Win Probability\":\"70\",\"Sales Stage\":\"05 - Building Vision\",\"Description\":\"oap\",\"Secure Flag\":\"N\",\"Id\":\"6SIA-4OL3T\"}]",
    "compartmentId": "{{compartment_ocid}}",
    "servingMode": {
        "servingType": "ON_DEMAND",
        "modelId": "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceya3yvtzkwd7y4lq6cl3mb22obgesqh2k4k7t2ruzix55ia"
    },
    "extractiveness": "HIGH",
    "format": "PARAGRAPH",
    "isEcho": false,
    "length": "LONG",
    "temperature": 1,
    "additionalCommand":"Generate a complete, professional executive report. Be precise and accurate. Provide a list of at least three next action steps based on probability and sales stage without asking."
}
*/
/* Test payload for GenAI Text Generation
{
    "compartmentId": "{{compartment_ocid}}",
    "servingMode": {
        "servingType": "ON_DEMAND",
        "modelId": "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceyafhwal37hxwylnpbcncidimbwteff4xha77n5xz4m7p6a"
    },
    "inferenceRequest": {
        "runtimeType":"COHERE",
        "prompt": "Tell me more about Siebel CRM in the style of Snoop Dogg.",
        "temperature": 1,
        "maxTokens":600,
        "frequencyPenalty":0,
        "isEcho":true,
        "isStream": false,
        "numGenerations":1,
        "presencePenalty":0,
        "topK":0,
        "topP":0.75
    }
}
*/
/* Example calls:

BCRMInvokeOCIAI("Language","batchDetectLanguageSentiments","level=SENTENCE",tbody);
BCRMInvokeOCIAI("Language","batchDetectLanguageTextClassification","",tbody);
BCRMInvokeOCIAI("Language","batchDetectLanguageKeyPhrases","",tbody);
BCRMInvokeOCIAI("Language","batchDetectLanguageEntities","",tbody);
BCRMInvokeOCIAI("Language","batchDetectLanguagePiiEntities","",tbody);
BCRMInvokeOCIAI("Language","batchLanguageTranslation","",tbody);
BCRMInvokeOCIAI("Vision","analyzeDocument","",ibody);
BCRMInvokeOCIAI("Vision","analyzeImage","",ibody);
BCRMInvokeOCIAI("GenerativeAI","generateText","",tgbody);
BCRMInvokeOCIAI("GenerativeAI","summarizeText","",tsbody);

genAI, GA in late '23
https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai/20231130/

https://generativeai.aiservice.us-chicago-1.oci.oraclecloud.com/20231130/actions/generateText
https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/20231130/actions/summarizeText 

body probably like so:

*/

var BCRMOCIDEFAULTS = {
    "sblauth": "Basic U0FETUlOOldlbGNvbWUx",  //Basic Auth is FOR DEVELOPMENT ONLY! Use higher security outside of DEV.
    "configurationFilePath": "C:\\Siebel\\ses\\applicationcontainer_internal\\webapps\\ociconfig",
    "region": "eu-frankfurt-1",
    "version": "20221001",
    "Language": "language.aiservice",
    "Vision": "vision.aiservice",
    "DocumentUnderstanding": "document.aiservice",
    "GenerativeAI":"inference.generativeai",
    "domain": "oci.oraclecloud.com",
    "masking": {
        "EMAIL": {
            "mode": "MASK",
            "maskingCharacter": "*",
            "leaveCharactersUnmasked": 5,
            "isUnmaskedFromEnd": true
        }
    },
    //https://docs.oracle.com/en-us/iaas/api/#/en/language/20221001/datatypes/BatchLanguageTranslationDetails
    "targetLanguageCode": "de",
    "compartmentId": "ocid1.tenancy.oc1..aaaaaaaaeu4zdcwqqpulnshbjvgz444yb6iqwr6l4dzr5gl7fcctrayyh6zq",
    //for document understanding payload
    "namespace": "frh6cxhlwlhm",
    "bucket": "public",
    "prefix": "sbl_du",
    //demo to retrieve JSON from document understanding output, requires pre-authenticated request on prefix folder
    "preauthURL": "https://frh6cxhlwlhm.objectstorage.eu-frankfurt-1.oci.customer-oci.com/p/ua0pVRS9ht8LRlW4z5owYIWU_68qz66jBVO3f7d29Dib4CXYDqtMOO3NJl7wGYed/n/frh6cxhlwlhm/b/public/o/"
};

BCRMInvokeOCIAI = function (service, action, query = "", payload) {
    var d = BCRMOCIDEFAULTS;
    let v = d.version;
    let r = d.region;
    if (service == "Vision") {
        v = "20220125";
    }
    if (service == "DocumentUnderstanding") {
        v = "20221109";
    }
    if (service == "GenerativeAI"){
        v = "20231130";
        r = "us-chicago-1";
    }
    //https://language.aiservice.eu-frankfurt-1.oci.oraclecloud.com/20210101/actions/batchDetectLanguageSentiments
    var url = "https://" + d[service] + "." + r + "." + d.domain + "/" + v + "/actions/" + action + "?" + query;
    if (service == "DocumentUnderstanding") {
        url = "https://" + d[service] + "." + r + "." + d.domain + "/" + v + "/" + action;
    }
    if (service == "GenerativeAI") {
        url = "https://" + d[service] + "." + r + "." + d.domain + "/" + v + "/actions/" + action;
    }
    if (action == "batchDetectLanguagePiiEntities") {
        payload.masking = d.masking;
    }
    if (action == "batchLanguageTranslation") {
        payload.targetLanguageCode = d.targetLanguageCode;
    }
    BCRMOCIAdapter(url, payload, action);
}

BCRMOCIAdapter = function (url, payload, action) {
    var d = BCRMOCIDEFAULTS;
    var myHeaders = new Headers();
    //Auth for Siebel REST API to calculate signature
    myHeaders.append("Authorization", d.sblauth);
    myHeaders.append("Content-Type", "application/json");

    var pdata = {
        "HTTPRequestMethod": "POST",
        "configurationFilePath": d.configurationFilePath,
        "HTTPRequestURL": url
    };
    pdata.HTTPRequestBody = JSON.stringify(payload);
    var raw = JSON.stringify(pdata);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    //call custom Siebel-side JBS "BCRM OCI Adapter/getAuthHeader" to retrieve request signature
    fetch(location.origin + "/siebel/v1.0/service/BCRM OCI Adapter/getAuthHeader?matchrequestformat=Y", requestOptions)
        .then(response => response.text())
        .then(result => {
            //send request to OCI
            BCRMOCIRequest(JSON.parse(result), payload, url, action);
        })
        .catch(error => console.log('error', error));
}

BCRMOCIRequest = function (data, tbody, url, action) {
    var myHeaders = new Headers();
    //fix signature: add version (not required but recommended)
    var signature = data.HDR_Authorization;
    signature = signature.replace("Signature ", "Signature version=\"1\",");

    //set headers for POST request
    myHeaders.append("Content-Length", data["HDR_content-length"]);
    myHeaders.append("x-content-sha256", data["HDR_x-content-sha256"]);
    myHeaders.append("x-date", data.HDR_Date);
    myHeaders.append("Authorization", signature);
    myHeaders.append("Accept", "application/json");
    myHeaders.append("host", data.host);
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(tbody),
        redirect: 'follow'
    };

    //send request to OCI
    fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log(JSON.parse(result));
            //process result
            BCRMProcessOCIData(JSON.parse(result), action);
        })
        .catch(error => console.log('error', error));
}

//Example use case, AInhance applets

//apply to any applet based on BC and use only fields listed
//TODO: support multiple fields, since code is currently using the first field only
BCRMOCICONFIG = {
    "Action": ["Comment", "Description"],
    "Service Request": ["Abstract"],
    "Action Attachment": ["ActivityFileName"],
    "Opportunity":["Name"],
    "Solution":["Solution"]
}

BCRMProcessOCIData = function (data, action) {
    //Example for sentiment
    //Presume (list) applet is still active
    let pm = SiebelApp.S_App.GetActiveView().GetActiveApplet().GetPModel();
    let fi = pm.Get("GetFullId");
    let ae = $("#" + fi);
    let ph = pm.Get("GetPlaceholder");
    if (action == "analyzeImage") {
        let labels = data.labels;
        let text = "";
        for (let i = 0; i < labels.length; i++){
            text += labels[i].name;
            text += " (" + labels[i].confidence + ")";
            text += "<hr>";
        }
        let d = $("<div>");
        d.html(text);
        $("#maskoverlay").hide();
        d.dialog();
    }
    if (action == "analyzeDocument") {
        let pages = data.pages;
        let pagecount = pages.length;
        let doctype = data.detectedDocumentTypes[0]["documentType"];
        let lines = pages[0].lines;
        let text = "";
        text += "Document Type: " + doctype + "<hr>";
        text += "Pages: " + pagecount + "<br>";
        text += "Start of document: " + "<hr>";
        for (let i = 0; i < 5; i++) {
            text += lines[i].text + "<br>";
        }
        let d = $("<div>");
        d.html(text);
        $("#maskoverlay").hide();
        d.dialog();
    }
    if (action == "processorJobs") {
        //doc understanding complete
        //DEMO: open pre-auth url for default JSON output
        let pid = data.id;
        let url = BCRMOCIDEFAULTS.preauthURL;
        url += BCRMOCIDEFAULTS.prefix + "/" + pid + "/_/results/defaultObject.json";
        fetch(url, { method: 'GET', redirect: 'follow' })
            .then(response => response.text())
            .then(result => {
                let data = JSON.parse(result);
                let pages = data.pages;
                let pagecount = pages.length;
                let doctype = data.detectedDocumentTypes[0]["documentType"];
                let lines = pages[0].lines;
                let text = "";
                text += "Document Type: " + doctype + "<hr>";
                text += "Pages: " + pagecount + "<br>";
                text += "Start of document: " + "<hr>";
                for (let i = 0; i < 5; i++) {
                    text += lines[i].text + "<br>";
                }
                let d = $("<div>");
                d.html(text);
                $("#maskoverlay").hide();
                d.dialog();
            })
            .catch(error => console.log('error', error));
    }
    if (action == "batchDetectLanguageSentiments") {
        let h = ae.find("tr#1").height();
        const scores = new Map();
        scores.set("Neutral", "😌");
        scores.set("Mixed", "🤔");
        scores.set("Positive", "😃");
        scores.set("Negative", "😡");
        let docs = data.documents;
        let cont = $("<div id='bcrm_icons_" + fi + "'>");
        cont.css({
            "position": "absolute",
            "z-index": "10"
        });
        for (let i = 0; i < docs.length; i++) {
            let key = docs[i].key;
            let rowid = key.split("_")[0];
            let field = key.split("_")[1];
            //let row = ae.find("tr#" + (i + 1));
            let sentiment = docs[i].documentSentiment;
            let icon = $("<div class='bcrm-score' style='font-size:20px;'><span></span></div>");
            icon.height(h);
            icon.find("span").text(scores.get(sentiment));
            icon.attr("title", sentiment);
            //let tdid = (i + 1) + "_" + ph + "_" + field;
            //row.find("td#" + tdid).prepend(icon);
            cont.append(icon);
        }
        $("#maskoverlay").hide();
        ae.find(".ui-jqgrid-bdiv").before(cont);
    }
    if (action == "summarizeText"){
        $("#maskoverlay").hide();
        let summary = data.summary;
        //summary.replaceAll(".",".\n");
        let dlg = $("<div id='bcrm_summary' style='overflow:auto;'><span style='font-family:system-ui;font-size:1.2em;white-space: break-spaces;'></span></div>");
        dlg.find("span").text(summary);
        dlg.dialog({
            width: 800,
            height: 600,
            title: "Summary generated by AI"
        });
    }
    if (action == "generateText"){
        $("#maskoverlay").hide();
        let text = data.inferenceResponse.generatedTexts[0].text;
        //summary.replaceAll(".",".\n");
        let dlg = $("<div id='bcrm_summary' style='overflow:auto;'><span style='font-family:system-ui;font-size:1.2em;white-space: break-spaces;'></span></div>");
        dlg.find("span").text(text);
        dlg.dialog({
            width: 800,
            height: 600,
            title: "Text generated by AI"
        });
    }
};

BCRMOCIAddButton = function (pm) {
    const conf = BCRMOCICONFIG;
    let fi = pm.Get("GetFullId");
    let bc = pm.Get("GetBusComp").GetName();
    var rs = pm.Get("GetRawRecordSet");
    //List Applets only atm
    if (typeof (pm.Get("GetListOfColumns")) !== "undefined") {
        if (typeof (conf[bc]) !== "undefined") {
            var fieldlist = conf[bc];
            //check if first field is in recordset, good enough
            if (rs.length > 0 && typeof (rs[0][fieldlist[0]]) !== "undefined") {
                let ae = $("#" + fi);
                pm.AddMethod("InvokeMethod", function (m, i, c, r) {
                    ae.find("[id^='bcrm_icons']").remove();
                }, { sequence: false, scope: pm });
                let btns = ae.find(".siebui-btn-grp-applet");
                let btnid = "bcrm_ai_" + fi;
                let stop = false;
                if (btns.length == 1 && ae.find("#" + btnid).length == 0) {
                    let btn = $("<button style='font-size: 1.3em;cursor:pointer;' title='AInhance Me' id='" + btnid + "'>👽</button>");
                    btn.on("click", function () {
                        stop = false;
                        $("#maskoverlay").show();
                        ae.find("[id^='bcrm_icons']").remove();
                        rs = pm.Get("GetRawRecordSet");
                        if (bc.indexOf("Attachment") > -1) {
                            stop = true;
                            let ar = rs[pm.Get("GetSelection")];
                            let bo = SiebelApp.S_App.GetActiveBusObj().GetName();
                            let pbc = pm.Get("GetBusComp").GetParentBusComp();
                            let par_bc = pbc.GetName();
                            let par_row_id = pbc.GetIdValue();
                            let row_id = ar["Id"];
                            let filetype = ar["ActivityFileExt"];
                            BCRMGetAttachmentBase64(bo, par_bc, par_row_id, bc, row_id);
                            setTimeout(function () {
                                /*
                                let ibody = BCRMOCIPrepareVisionPayload();
                                BCRMInvokeOCIAI("Vision", "analyzeDocument", "", ibody);
                                */
                                if (filetype == "pdf") {
                                    let ibody = BCRMOCIPrepareDocumentUnderstandingPayload();
                                    BCRMInvokeOCIAI("DocumentUnderstanding", "processorJobs", "", ibody);
                                    //Doc understanding results are put in a bucket, download can be done through API or
                                    //bucket pre-auth request,e.g. https://frvesixtecrm.objectstorage.eu-frankfurt-1.oci.customer-oci.com/p/8jrmAjk15AoL5bJN63nCkWqGe-QKNH3B56n5etXyA1ZFYM1YxhY4MnClRPF8NQVb/n/frvesixtecrm/b/output/o/
                                }
                                if (filetype == "png"){
                                    let ibody = BCRMOCIPrepareVisionImagePayload();
                                    BCRMInvokeOCIAI("Vision", "analyzeImage", "", ibody);
                                }
                            }, 2000);
                        }
                        if (bc == "Solution"){
                            stop = true;
                            let thesoln = rs[pm.Get("GetSelection")];
                            let soln = thesoln["Solution"];
                            let prefix = "Enhance the following statement with accurate information, but avoid getting too technical: ";
                            let gtbody = BCRMOCIPrepareGenAITextGenerationPayload(prefix + soln);
                            BCRMInvokeOCIAI("GenerativeAI","generateText","",gtbody);
                        }
                        if (bc == "Opportunity"){
                            stop = true;
                            let theoppty = rs[pm.Get("GetSelection")];
                            let desc = theoppty["Description"];
                            if (desc.indexOf("ai:") == 0){
                                desc = desc.substr(3,desc.length);
                            }
                            else{
                                desc = undefined;
                            }
                            let tsbody = BCRMOCIPrepareGenAITextSummarizationPayload(JSON.stringify(theoppty),desc);
                            BCRMInvokeOCIAI("GenerativeAI","summarizeText","",tsbody);
                        }
                        if (!stop) {
                            let tbody = BCRMOCIPrepareLangPayload(rs, fieldlist[0]);
                            BCRMInvokeOCIAI("Language", "batchDetectLanguageSentiments", "level=SENTENCE", tbody);
                        }
                    });
                    btns.prepend(btn);
                }
            }
        }
    }
}

BCRMOCIPrepareVisionPayload = function () {
    var ibody = {
        "features": [
            {
                "featureType": "TEXT_DETECTION"
            },
            {
                "featureType": "DOCUMENT_CLASSIFICATION"
            },
            {
                "featureType": "TABLE_DETECTION"
            },
        ],
        "document": {
            "source": "INLINE",
            "data": BCRM64
        }
    };
    return ibody;
}

BCRMOCIPrepareVisionImagePayload = function () {
    var ibody = {
        "features": [
            {
                "featureType": "IMAGE_CLASSIFICATION"
            },
            {
                "featureType": "OBJECT_DETECTION"
            },
            {
                "featureType": "TEXT_DETECTION"
            },
        ],
        "image": {
            "source": "INLINE",
            "data": BCRM64
        }
    };
    return ibody;
}

BCRMOCIPrepareGenAITextSummarizationPayload = function(input, command){
    if (typeof(command) === "undefined"){
        command = "Generate a complete, professional executive report. Be precise and accurate. Start with a summary and then provide a numbered list of at least three next action steps based on the data without asking.";
        //"Use language in the style of percy bysshe shelley and include at least ten emojis"
        //"Write an excruciatingly long-winded poem in the style of percy bysshe shelley and include at least ten emojis"
    }
    var tsbody = {
            "input": input,
            "compartmentId": BCRMOCIDEFAULTS.compartmentId,
            "servingMode": {
                "servingType": "ON_DEMAND",
                "modelId": "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceya3yvtzkwd7y4lq6cl3mb22obgesqh2k4k7t2ruzix55ia"
            },
            "extractiveness": "AUTO",
            "format": "AUTO",
            "isEcho": true,
            "length": "LONG",
            "temperature": 1,
            "additionalCommand": command
    };
    return tsbody;
};

BCRMOCIPrepareDocumentUnderstandingPayload = function () {
    var ibody = {
        "processorConfig": {
            "processorType": "GENERAL",
            "features": [
                {
                    "featureType": "TEXT_EXTRACTION",
                    "generateSearchablePdf": false
                },
                {
                    "featureType": "DOCUMENT_CLASSIFICATION"
                },
                {
                    "featureType": "TABLE_EXTRACTION"
                }
            ]
        },
        "inputLocation": {
            "sourceType": "INLINE_DOCUMENT_CONTENT",
            "data": BCRM64
        },
        "outputLocation": {
            "bucketName": BCRMOCIDEFAULTS.bucket,
            "namespaceName": BCRMOCIDEFAULTS.namespace,
            "prefix": BCRMOCIDEFAULTS.prefix
        },
        "compartmentId": BCRMOCIDEFAULTS.compartmentId
    };
    return ibody
}
BCRMOCIPrepareLangPayload = function (rs, fieldname) {
    var tbody = {
        "documents": []
    };
    //rs example
    //[{"Id":"1-222","field":"some text"}, ...]
    for (let i = 0; i < rs.length; i++) {
        let item = {};
        item.key = rs[i]["Id"] + "_" + fieldname;
        item.text = rs[i][fieldname] != "" ? rs[i][fieldname] : "#";  //avoid empty text
        item.languageCode = "en"; //TODO: support multi-lang
        tbody.documents.push(item);
    }
    return tbody;
};
BCRMOCIPrepareGenAITextGenerationPayload = function (prompt = "What year is it?", isStream = false){
    let tgbody = {
        "compartmentId": BCRMOCIDEFAULTS.compartmentId,
        "servingMode": {
            "servingType": "ON_DEMAND",
            "modelId": "ocid1.generativeaimodel.oc1.us-chicago-1.amaaaaaask7dceyafhwal37hxwylnpbcncidimbwteff4xha77n5xz4m7p6a"
        },
        "inferenceRequest": {
            "runtimeType":"COHERE",
            "prompt": prompt,
            "temperature": 1,
            "maxTokens":600,
            "frequencyPenalty":0,
            "isEcho":true,
            "isStream": isStream,
            "numGenerations":1,
            "presencePenalty":0,
            "topK":0,
            "topP":0.75
        }
    };
    return tgbody;
};

var BCRM64;

BCRMGetAttachmentBase64 = function (bo, par_bc, par_row_id, bc, row_id) {
    var d = BCRMOCIDEFAULTS;
    var myHeaders = new Headers();
    //Auth for Siebel REST API to calculate signature
    myHeaders.append("Authorization", d.sblauth);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    var url = location.origin + "/siebel/v1.0/data/" + bo + "/" + par_bc + "/" + par_row_id + "/" + bc + "/" + row_id + "?inlineattachment=true";
    fetch(url, requestOptions)
        .then(response => response.text())
        .then(result => {
            let data = JSON.parse(result);
            //TODO: make it work for more than Activity Attachments
            BCRM64 = data["Activity Attachment Id"];
        })
        .catch(error => console.log('error', error));
}
BCRMOCIPL = function () {
    let am = SiebelApp.S_App.GetActiveView().GetAppletMap();
    for (a in am) {
        let pm = am[a].GetPModel();
        BCRMOCIAddButton(pm);
    }
}
SiebelApp.EventManager.addListner("postload", BCRMOCIPL, this);
