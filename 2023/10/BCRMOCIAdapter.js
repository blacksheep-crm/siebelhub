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
/* Example calls:

BCRMInvokeOCIAI("Language","batchDetectLanguageSentiments","level=SENTENCE",tbody);
BCRMInvokeOCIAI("Language","batchDetectLanguageTextClassification","",tbody);
BCRMInvokeOCIAI("Language","batchDetectLanguageKeyPhrases","",tbody);
BCRMInvokeOCIAI("Language","batchDetectLanguageEntities","",tbody);
BCRMInvokeOCIAI("Language","batchDetectLanguagePiiEntities","",tbody);
BCRMInvokeOCIAI("Language","batchLanguageTranslation","",tbody);
BCRMInvokeOCIAI("Vision","analyzeDocument","",ibody);

genAI, GA in late '23
https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai/20231130/

https://generativeai.aiservice.us-chicago-1.oci.oraclecloud.com/20231130/actions/generateText

body probably like so:

{
   "prompts": ["Red Bull Racing Honda, redbull@gmail.com the four-time Formula-1 World Champion team, has chosen Oracle Cloud Infrastructure (OCI) as their infrastructure partner."],
   "servingMode":{
       "servingType":"ON_DEMAND"
   }
}
*/

var BCRMOCIDEFAULTS = {
    "sblauth": "Basic U0FETUlOOldlbGNvbWUx",  //Basic Auth is FOR DEVELOPMENT ONLY! Use higher security outside of DEV.
    "configurationFilePath": "C:\\Siebel\\ses\\applicationcontainer_internal\\webapps\\ociconfig",
    "region": "eu-frankfurt-1",
    "version": "20221001",
    "Language": "language.aiservice",
    "Vision": "vision.aiservice",
    "DocumentUnderstanding": "document.aiservice",
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
    "compartmentId": "ocid1.tenancy.oc1..aaaaaaaaxahtpmtqn2g57uetpf4y6yvt3c3jgg2etnt5swhccr3wn2gyiiua"
};

BCRMInvokeOCIAI = function (service, action, query = "", payload) {
    var d = BCRMOCIDEFAULTS;
    let v = d.version;
    if (service == "Vision") {
        v = "20220125";
    }
    if (service == "DocumentUnderstanding") {
        v = "20221109";
    }
    //https://language.aiservice.eu-frankfurt-1.oci.oraclecloud.com/20210101/actions/batchDetectLanguageSentiments
    var url = "https://" + d[service] + "." + d.region + "." + d.domain + "/" + v + "/actions/" + action + "?" + query;
    if (service == "DocumentUnderstanding") {
        url = "https://" + d[service] + "." + d.region + "." + d.domain + "/" + v + "/" + action;
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
    "Action Attachment": ["ActivityFileName"]
}

BCRMProcessOCIData = function (data, action) {
    //Example for sentiment
    //Presume (list) applet is still active
    let pm = SiebelApp.S_App.GetActiveView().GetActiveApplet().GetPModel();
    let fi = pm.Get("GetFullId");
    let ae = $("#" + fi);
    let ph = pm.Get("GetPlaceholder");
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
        d.dialog();
    }
    if (action == "processorJobs") {
        //doc understanding complete
        //TODO: retrieve JSON objects
        //DEMO: open pre-auth url for JSON
        let pid = data.id;
        let url = "https://frvesixtecrm.objectstorage.eu-frankfurt-1.oci.customer-oci.com/p/8jrmAjk15AoL5bJN63nCkWqGe-QKNH3B56n5etXyA1ZFYM1YxhY4MnClRPF8NQVb/n/frvesixtecrm/b/output/o/";
        url += "sbl_du/" + pid + "/_/results/defaultObject.json";
        window.open(url, '_blank');
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
        ae.find(".ui-jqgrid-bdiv").before(cont);
    }
}
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
                if (btns.length == 1 && ae.find("#" + btnid).length == 0) {
                    let btn = $("<button style='font-size: 1.3em;cursor:pointer;' title='AInhance Me' id='" + btnid + "'>👽</button>");
                    btn.on("click", function () {
                        ae.find("[id^='bcrm_icons']").remove();
                        rs = pm.Get("GetRawRecordSet");
                        if (bc.indexOf("Attachment") > -1) {
                            let ar = rs[pm.Get("GetSelection")];
                            let bo = SiebelApp.S_App.GetActiveBusObj().GetName();
                            let pbc = pm.Get("GetBusComp").GetParentBusComp();
                            let par_bc = pbc.GetName();
                            let par_row_id = pbc.GetIdValue();
                            let row_id = ar["Id"];
                            BCRMGetAttachmentBase64(bo, par_bc, par_row_id, bc, row_id);
                            setTimeout(function () {
                                let ibody = BCRMOCIPrepareVisionPayload();
                                BCRMInvokeOCIAI("Vision", "analyzeDocument", "", ibody);
                                /*
                                let ibody = BCRMOCIPrepareDocumentUnderstandingPayload();
                                BCRMInvokeOCIAI("DocumentUnderstanding","processorJobs","",ibody);
                                //Doc understanding results are put in a bucket, download can be done through API or
                                //bucket pre-auth request,e.g. https://frvesixtecrm.objectstorage.eu-frankfurt-1.oci.customer-oci.com/p/8jrmAjk15AoL5bJN63nCkWqGe-QKNH3B56n5etXyA1ZFYM1YxhY4MnClRPF8NQVb/n/frvesixtecrm/b/output/o/
                                 */
                            }, 2000);
                        }
                        else {
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

BCRMOCIPrepareDocumentUnderstandingPayload = function () {
    var ibody = {
        "processorConfig": {
            "processorType": "GENERAL",
            "features": [
                {
                    "featureType": "TEXT_EXTRACTION",
                    "generateSearchablePdf": true
                }
            ]
        },
        "inputLocation": {
            "sourceType": "INLINE_DOCUMENT_CONTENT",
            "data": BCRM64
        },
        "outputLocation": {
            "bucketName": "output",
            "namespaceName": "frvesixtecrm",
            "prefix": "sbl_du"
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
        item.text = rs[i][fieldname];
        item.languageCode = "en"; //TODO: support multi-lang
        tbody.documents.push(item);
    }
    return tbody;
}

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
