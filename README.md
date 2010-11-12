The touchlist manifesto is inspired by Atul Gawande's book, The Checklist Manifesto, which describes the radical potential for using checklists in medicine in the same way that pilots use them to fly airplanes. He also has a [great article in the New Yorker that was a precursor](http://www.newyorker.com/reporting/2007/12/10/071210fa_fact_gawande) to the book.

<img style='float:left;width:200px' src='http://gawande.com/wp-content/uploads/2009/12/TheChecklist-bookshot-432x550.jpg'>

The touchlist manifesto is a pure web application. All of the data is initially stored on google spreadsheets and then later cached. The index spreadsheet can be found here found here:

[https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdG5qMEFPb2Zzb2ZNbWtRaDBDSUtoZ1E&hl=en&output=html](https://spreadsheets.google.com/pub?key=0Ago31JQPZxZrdG5qMEFPb2Zzb2ZNbWtRaDBDSUtoZ1E&hl=en&output=html)

It is consists of a single file written in HTML and Javascript. It uses HTML5 features like manifest files for accessing resources offline, and also localStorage to store all checklist data.

To create a checklist, create a google spreadsheet with the items you want to have appear in the spreadsheet, one per cell, in the first column. Publish the document, then paste the URL into the touchlist manifesto. It will grab the list from your spreadsheet and make a simple touchscreen friendly checklist.

When you the finish button it records how many of the items were clicked into a different google spreadsheet. This part could use some more flexibility.
