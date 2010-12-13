class Checklist
  constructor: (@data) ->
    @key = new GoogleSpreadsheet(@data.source_url).key if @data.source_url

  save: ->
    localStorage["checklist."+@key]=JSON.stringify(@data)

  render: ->
    for checklistItem in @data
      $("ul#list").append "<div class='clickable'><span class='checkMark notChecked'>&#10003;</span><span class='checklistItem'>#{checklistItem.text}</span></div>"

    $("span.checklistItem").click (event)  ->
      $(event.target).prev().toggleClass("notChecked")
      $(event.target).toggleClass("checked")

Checklist.createFromGoogleSpreadsheetData = (googleSpreadsheetData) ->
  new Checklist(parseSpreadsheetToJSON(googleSpreadsheetData)).save()

Checklist.findByKey = (key) ->
  checklist = new Checklist(JSON.parse(localStorage["checklist."+key]))
  checklist.key = key
  return checklist

class ListOfChecklists

ListOfChecklists.currentList = ->
  if localStorage.available_checklists == null or localStorage.available_checklists == ""
    ListOfChecklists.refresh(localStorage.list_of_checklists_google_spreadsheet_key)
  JSON.parse(localStorage.available_checklists)

ListOfChecklists.createFromJSON = (json) ->
  localStorage.available_checklists=JSON.stringify(json)

ListOfChecklists.createFromGoogleSpreadsheetData = (googleSpreadsheetData) ->
  ListOfChecklists.createFromJSON(parseSpreadsheetToJSON(googleSpreadsheetData))

ListOfChecklists.createFromGoogleSpreadsheetDataThenRenderThenUpdate = (googleSpreadsheetData) ->
  ListOfChecklists.createFromGoogleSpreadsheetData(googleSpreadsheetData)
  ListOfChecklists.render()
  ListOfChecklists.updateChecklists()

ListOfChecklists.updateChecklists = ->
  for checklist in ListOfChecklists.currentList()
    getJSONcallHandler(new GoogleSpreadsheet(checklist.url).jsonUrl, "Checklist.createFromGoogleSpreadsheetData")

ListOfChecklists.setKey = (key) ->
  localStorage.list_of_checklists_google_spreadsheet_key = key

ListOfChecklists.refresh = ->
  getJSONcallHandler(new GoogleSpreadsheet(localStorage.list_of_checklists_google_spreadsheet_key).jsonUrl, "ListOfChecklists.createFromGoogleSpreadsheetDataThenRenderThenUpdate")

ListOfChecklists.render = ->
  $('#main').html("<table><thead><tr><th>Name</th><th>Type</th></tr></thead><tbody></tbody></table>")
  for checklist in ListOfChecklists.currentList()
    $('tbody').append("<tr><td><a href='#/checklist/#{new GoogleSpreadsheet(checklist.url).key}'>#{checklist.name}</a></td><td>#{checklist.type}</td><td><a href='#{checklist.url}'>Edit</a></td></tr>")
