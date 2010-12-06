DEFAULT_LIST_OF_CHECKLISTS_GOOGLE_SPREADSHEET_KEY = "0Ago31JQPZxZrdG5qMEFPb2Zzb2ZNbWtRaDBDSUtoZ1E";

if (localStorage["list_of_checklists_google_spreadsheet_key"] == null){
  localStorage["list_of_checklists_google_spreadsheet_key"] = DEFAULT_LIST_OF_CHECKLISTS_GOOGLE_SPREADSHEET_KEY;
}

function Checklist(data){
  this.data = data;
  if (data.source_url){
    this.key = new GoogleSpreadsheet(data.source_url).key;
  }
}

Checklist.createFromGoogleSpreadsheetData = function(googleSpreadsheetData){
  new Checklist(parseSpreadsheetToJSON(googleSpreadsheetData)).save();
}

Checklist.findByKey = function(key){
  checklist = new Checklist(JSON.parse(localStorage["checklist."+key]));
  checklist.key = key;
  return checklist;
}

Checklist.prototype.save = function(){
  localStorage["checklist."+this.key]=JSON.stringify(this.data);
}

Checklist.prototype.render = function(){
  $.each(this.data,function(index,checklistItem){
    $("ul#list").append("<div class='clickable'><span class='checkMark notChecked'>&#10003;</span><span class='checklistItem'>"+ checklistItem.text +"</span></div>")
  });

  $("span.checklistItem").click(function(event){
    $(event.target).prev().toggleClass("notChecked");
    $(event.target).toggleClass("checked");
  });
}

function ListOfChecklists(){
}

ListOfChecklists.currentList = function(){
  if (localStorage.available_checklists == null || localStorage.available_checklists == ""){
    ListOfChecklists.refresh(localStorage.list_of_checklists_google_spreadsheet_key);
  }
  return JSON.parse(localStorage.available_checklists);
}

ListOfChecklists.createFromJSON = function(json){
  localStorage.available_checklists=JSON.stringify(json);
}

ListOfChecklists.createFromGoogleSpreadsheetData = function(googleSpreadsheetData){
  ListOfChecklists.createFromJSON(parseSpreadsheetToJSON(googleSpreadsheetData));
}

ListOfChecklists.createFromGoogleSpreadsheetDataThenRenderThenUpdate = function(googleSpreadsheetData){
  ListOfChecklists.createFromGoogleSpreadsheetData(googleSpreadsheetData);
  ListOfChecklists.render();
  updateChecklists(ListOfChecklists.currentList());
}

ListOfChecklists.setKey = function(key){
  localStorage.list_of_checklists_google_spreadsheet_key = key;
}

ListOfChecklists.refresh = function(){
  getJSONcallHandler(new GoogleSpreadsheet(localStorage.list_of_checklists_google_spreadsheet_key).jsonUrl, "ListOfChecklists.createFromGoogleSpreadsheetDataThenRenderThenUpdate");
}

ListOfChecklists.render = function(){
  $('#main').html("<table><thead><tr><th>Name</th><th>Type</th></tr></thead><tbody></tbody></table>");
  $.each(ListOfChecklists.currentList(),function(index,checklist){
    $('tbody').append("<tr><td><a href='#/checklist/" + new GoogleSpreadsheet(checklist.url).key +"'>" + checklist.name + "</a></td><td>" + checklist.type + "</td><td><a href='"+checklist.url+"'>Edit</a></td></tr>")
  });
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

function updateChecklists(available_checklists){
  $.each(available_checklists, function(index,checklist){
    getJSONcallHandler(new GoogleSpreadsheet(checklist.url).jsonUrl, "Checklist.createFromGoogleSpreadsheetData");
  });
}

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
    $('#main').html("<form action='#/list_of_checklists_key' method='post'>List of checklists google spreadsheet key (default: "+ DEFAULT_LIST_OF_CHECKLISTS_GOOGLE_SPREADSHEET_KEY +")<input name='key' type='text' value='"+ localStorage.list_of_checklists_google_spreadsheet_key +"'></input><input type='submit' value='Update'></input></form>");
    $('#main').append("<form action='#/configure' method='post'>Add new checklist from google spreadsheet: <input name='new_checklist' type='text'></input><input type='submit' value='Update'></input></form>");
    $('#main').append("<a href='#/clear_local_storage'>Clear Local Storage</a>");
  })
  .get('#/clear_local_storage', function(context) {
    localStorage.clear();
  })
  .post('#/list_of_checklists_key', function(context) {
    ListOfChecklists.setKey(context.params["key"]);
    context.redirect('#/refresh_checklists');
  })
  .run('#/');
