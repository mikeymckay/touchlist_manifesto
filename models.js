var Checklist, ListOfChecklists;
Checklist = function() {
  function Checklist(data) {
    this.data = data;
    if (this.data.source_url) {
      this.key = new GoogleSpreadsheet(this.data.source_url).key;
    }
  }
  Checklist.prototype.save = function() {
    return localStorage["checklist." + this.key] = JSON.stringify(this.data);
  };
  Checklist.prototype.render = function() {
    var checklistItem, _i, _len, _ref;
    _ref = this.data;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      checklistItem = _ref[_i];
      $("ul#list").append("<div class='clickable'><span class='checkMark notChecked'>&#10003;</span><span class='checklistItem'>" + checklistItem.text + "</span></div>");
    }
    return $("span.checklistItem").click(function(event) {
      $(event.target).prev().toggleClass("notChecked");
      return $(event.target).toggleClass("checked");
    });
  };
  return Checklist;
}();
Checklist.createFromGoogleSpreadsheetData = function(googleSpreadsheetData) {
  return new Checklist(parseSpreadsheetToJSON(googleSpreadsheetData)).save();
};
Checklist.findByKey = function(key) {
  var checklist;
  checklist = new Checklist(JSON.parse(localStorage["checklist." + key]));
  checklist.key = key;
  return checklist;
};
ListOfChecklists = function() {
  function ListOfChecklists() {}
  return ListOfChecklists;
}();
ListOfChecklists.currentList = function() {
  if (localStorage.available_checklists === null || localStorage.available_checklists === "") {
    ListOfChecklists.refresh(localStorage.list_of_checklists_google_spreadsheet_key);
  }
  return JSON.parse(localStorage.available_checklists);
};
ListOfChecklists.createFromJSON = function(json) {
  return localStorage.available_checklists = JSON.stringify(json);
};
ListOfChecklists.createFromGoogleSpreadsheetData = function(googleSpreadsheetData) {
  return ListOfChecklists.createFromJSON(parseSpreadsheetToJSON(googleSpreadsheetData));
};
ListOfChecklists.createFromGoogleSpreadsheetDataThenRenderThenUpdate = function(googleSpreadsheetData) {
  ListOfChecklists.createFromGoogleSpreadsheetData(googleSpreadsheetData);
  ListOfChecklists.render();
  return ListOfChecklists.updateChecklists();
};
ListOfChecklists.updateChecklists = function() {
  var checklist, _i, _len, _ref, _results;
  _ref = ListOfChecklists.currentList();
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    checklist = _ref[_i];
    _results.push(getJSONcallHandler(new GoogleSpreadsheet(checklist.url).jsonUrl, "Checklist.createFromGoogleSpreadsheetData"));
  }
  return _results;
};
ListOfChecklists.setKey = function(key) {
  return localStorage.list_of_checklists_google_spreadsheet_key = key;
};
ListOfChecklists.refresh = function() {
  return getJSONcallHandler(new GoogleSpreadsheet(localStorage.list_of_checklists_google_spreadsheet_key).jsonUrl, "ListOfChecklists.createFromGoogleSpreadsheetDataThenRenderThenUpdate");
};
ListOfChecklists.render = function() {
  var checklist, _i, _len, _ref, _results;
  $('#main').html("<table><thead><tr><th>Name</th><th>Type</th></tr></thead><tbody></tbody></table>");
  _ref = ListOfChecklists.currentList();
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    checklist = _ref[_i];
    _results.push($('tbody').append("<tr><td><a href='#/checklist/" + (new GoogleSpreadsheet(checklist.url).key) + "'>" + checklist.name + "</a></td><td>" + checklist.type + "</td><td><a href='" + checklist.url + "'>Edit</a></td></tr>"));
  }
  return _results;
};