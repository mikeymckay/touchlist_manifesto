The touchlist manifesto is inspired by Atul Gawande's book, The Checklist Manifesto, which describes the radical potential for using checklists in medicine in the same way that pilots use them to fly airplanes. He also has a [great article in the New Yorker that was a precursor](http://www.newyorker.com/reporting/2007/12/10/071210fa_fact_gawande) to the book.

![Checklist Manifesto](http://gawande.com/wp-content/uploads/2009/12/TheChecklist-bookshot-432x550.jpg)

The touchlist manifesto is a pure web application. The only server-like thing needed is a google spreadsheet. It is consists of a single file written in HTML and Javascript.

To create a checklist, create a google spreadsheet with the items you want to have appear in the spreadsheet, one per cell, in the first column. Publish the document, then paste the URL into the touchlist manifesto. It will grab the list from your spreadsheet and make a simple touchscreen friendly checklist.

When you the finish button it records how many of the items were clicked into a different google spreadsheet. This part could use some more flexibility.
