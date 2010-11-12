var LIST_OF_CHECKLISTS_GOOGLE_SPREADSHEET_KEY = "0Ago31JQPZxZrdG5qMEFPb2Zzb2ZNbWtRaDBDSUtoZ1E";

function submitDataToGoogleForm(url,data){
  // iframe is only used to stop us from loading a new page on submit
  var iframe = "<iframe name='hidden_iframe' id='hidden_iframe' style='display:none;'></iframe>"
  var form = "<form id='google_form' method='post' action='"+url+"' target='hidden_iframe'>"
  // each element of data will be added to a new column
  $.each(data,function(index,value){
    form += "<input type='hidden' id='"+index+"' name='entry."+index+".single' value='" + value +"'>"
  });
  form += "</form>"
  $('body').append(iframe + form);
  $('#google_form').submit();
}

function getJSON(url,handler){
  url += "&callback="+handler.name
  $('body').append("<script src='" +url+ "'/>")
};

var checklistSpreadsheetCallback = function checklistSpreadsheetCallback(rawdata){
  parseSpreadsheetToJSON(rawdata, function(data){
    checklistKey = getKeyForSpreadsheet(data.source_url);
    localStorage["checklist."+checklistKey]=JSON.stringify(data);
  });
};


var listOfChecklistsCallback = function listOfChecklistsCallback(rawdata){
  parseSpreadsheetToJSON(rawdata, function(data){
    localStorage["available_checklists"]=JSON.stringify(data);
    renderListOfChecklist(data);
    updateChecklists(data);
  });
};

function updateChecklists(available_checklists){
  $.each(available_checklists, function(index,checklist){
    getJSON(getJSONUrlForSpreadsheetURL(checklist.url), checklistSpreadsheetCallback);
  });
}

function getKeyForSpreadsheet(url){
  try{ return url.match(/key=(.*?)&/)[1];
  }catch(e){
    return url.match(/list\/(.*?)\//)[1];
  }
}

function getJSONUrlForSpreadsheetKey(key){
  return "http://spreadsheets.google.com/feeds/list/" + key + "/od6/public/basic?alt=json-in-script";
}

function getJSONUrlForSpreadsheetURL(url){
  return getJSONUrlForSpreadsheetKey(getKeyForSpreadsheet(url));
}

// TODO Doesn't handle , and : if it's in the data being retrieved
function parseSpreadsheetToJSON(data, callback){
  var result = []
  $.each(data.feed.entry,function(i,row){
    rowData={};
    $.each(row.content.$t.split(", "),function(j,cell){
      cell = cell.split(": ");
      rowData[cell[0]]=cell[1];
    });
    result[i]=rowData;
  });
  result["source_url"]=data.feed.id.$t
  callback(result);
}

function renderListOfChecklist(listOfChecklists){
  $('#main').html("<table><thead></thead><tbody><tr><th>Name</th><th>Type</th></tr></tbody></table>");
  $('#menu').html("<a href='#/refresh_checklists/" + LIST_OF_CHECKLISTS_GOOGLE_SPREADSHEET_KEY+"'>Refresh Checklists</a>");
  $.each(listOfChecklists,function(index,checklist){
    $('table').append("<tr><td><a href='#/checklist/"+getKeyForSpreadsheet(checklist.url)+"'>" + checklist.name + "</a></td><td>" + checklist.type + "</td><td><a href='"+checklist.url+"'>Edit</a></td></tr>")
  });
}

function renderChecklist(checklistKey){
  $('#main').html("<ul id='list'></ul>");
  $('#menu').html("<a href='#/select_checklist'>Select Checklist</a><a>Finished</a>");

  var checklistData = JSON.parse(localStorage["checklist."+checklistKey]);

  $.each(checklistData,function(index,checklistItem){
    $("ul#list").append("<div class='clickable'><span class='checkMark notChecked'>&#10003;</span><span class='checklistItem'>"+ checklistItem.text +"</span></div>")
  });

  $("span.checklistItem").click(function(event){
    $(event.target).prev().toggleClass("notChecked");
    $(event.target).toggleClass("checked");
  });
}

var app = $.sammy()
  .get('#/', function(context) {
    // This loads the list of available checklists from a spreadsheet
    context.redirect('#/select_checklist');
  })
  .get('#/refresh_checklists/:spreadsheet_key', function(context) {
    getJSON(getJSONUrlForSpreadsheetKey(context.params["spreadsheet_key"]), listOfChecklistsCallback);
  })
  .get('#/select_checklist', function(context) {
    try{
      var available_checklists = JSON.parse(localStorage["available_checklists"]);
      if (available_checklists.length == 0) throw "No Checklists Loaded"
      renderListOfChecklist(available_checklists);
    } catch (e){
      context.redirect("#/refresh_checklists/" + LIST_OF_CHECKLISTS_GOOGLE_SPREADSHEET_KEY);
    }
  })
  .get('#/checklist/:spreadsheet_key', function(context) {
    renderChecklist(context.params["spreadsheet_key"]);
    $("a:contains('Finished')").click( function(){
      var result = $('span.checked').length + " out of " + $('span.checkItem').length + " checked";
      submitDataToGoogleForm("http://spreadsheets.google.com/formResponse?key=tU640m3Zj8OROfgGjfHIXHQ",[$('input#checklist_source').val(),result]);
      $('#message')
        .html("Thanks! " + result)
        .fadeOut(3000)
    });
  })
  .run('#/');
