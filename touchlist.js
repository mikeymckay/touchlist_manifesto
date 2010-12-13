DEFAULT_LIST_OF_CHECKLISTS_GOOGLE_SPREADSHEET_KEY = "0Ago31JQPZxZrdG5qMEFPb2Zzb2ZNbWtRaDBDSUtoZ1E";

if (localStorage.list_of_checklists_google_spreadsheet_key == null){
  localStorage.list_of_checklists_google_spreadsheet_key = DEFAULT_LIST_OF_CHECKLISTS_GOOGLE_SPREADSHEET_KEY;
}

function GoogleSpreadsheet(urlOrKey){
  if (urlOrKey.match(/http(s)*:/)) {
    this.url = urlOrKey;
    try{ this.key = this.url.match(/key=(.*?)&/)[1];
    }catch(e){
      this.key = this.url.match(/list\/(.*?)\//)[1];
    }
  }
  else{
    this.key = urlOrKey;
  }
  this.jsonUrl = "http://spreadsheets.google.com/feeds/list/" + this.key + "/od6/public/basic?alt=json-in-script";
}

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

function getJSONcallHandler(url,handlerName){
  url += "&callback="+handlerName
  $('body').append("<script src='" +url+ "'/>")
};

// TODO Doesn't handle , and : if it's in the data being retrieved
function parseSpreadsheetToJSON(data){
  // I create a hybrid indexed array with a hash/dictionary whacked on the end - maybe a bad idea!
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
  return result;
}

var app = $.sammy()
  .get('#/', function(context) {
    context.redirect('#/select_checklist');
  })
  .get('#/refresh_checklists', function(context) {
    $('#menu').html("<a href='#/refresh_checklists'>Refresh Checklists</a><a href='#/configure'>Configure</a>");
    ListOfChecklists.refresh();
  })
  .get('#/select_checklist', function(context) {
    $('#menu').html("<a href='#/refresh_checklists'>Refresh Checklists</a><a href='#/configure'>Configure</a>");
    ListOfChecklists.render();
  })
  .get('#/checklist/:spreadsheet_key', function(context) {
    $('#main').html("<ul id='list'></ul>");
    $('#menu').html("<a href='#/select_checklist'>Select Checklist</a><a>Finished</a>");
    checklist = Checklist.findByKey(context.params["spreadsheet_key"]);
    checklist.render();
    $("a:contains('Finished')").click( function(){
      var result = $('span.checked').length + " out of " + $('span.checkItem').length + " checked";
      submitDataToGoogleForm("http://spreadsheets.google.com/formResponse?key=tU640m3Zj8OROfgGjfHIXHQ",[$('input#checklist_source').val(),result]);
      $('#message')
        .html("Thanks! " + result)
        .fadeOut(3000)
    });
  })
  .get('#/configure', function(context) {
    $('#menu').html("<a href='#/select_checklist'>Select Checklist</a>");
    if (localStorage.list_of_checklists_google_spreadsheet_key == null){
      localStorage.list_of_checklists_google_spreadsheet_key = DEFAULT_LIST_OF_CHECKLISTS_GOOGLE_SPREADSHEET_KEY;
    }
    $('#main').html("<form action='#/list_of_checklists_key' method='post'>List of checklists google spreadsheet key (default: "+ DEFAULT_LIST_OF_CHECKLISTS_GOOGLE_SPREADSHEET_KEY +")<input name='key' type='text' value='"+ localStorage.list_of_checklists_google_spreadsheet_key +"'></input><input type='submit' value='Update'></input></form>");
    $('#main').append("<form action='#/checklist' method='post'>Add new checklist from google spreadsheet: <input name='new_checklist' type='text'></input><input type='submit' value='Update'></input></form>");
    $('#main').append("<a href='#/clear_local_storage'>Clear Local Storage</a>");
  })
  .get('#/clear_local_storage', function(context) {
    localStorage.clear();
  })
  .post('#/list_of_checklists_key', function(context) {
    ListOfChecklists.setKey(context.params["key"]);
    context.redirect('#/refresh_checklists');
  })
  .post('#/new_checklist', function(context) {
    // TODO
    // figure out what to pass in (key,url?)
    // create Checklist
    // figure out how to add it to the list
  })
  .run('#/');
