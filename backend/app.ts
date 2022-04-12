const fs = require("fs");
import express from 'express';
import cookieParse from 'cookie-parser';
import bodyParser from 'body-parser';
import PDFDocument from 'pdfkit';
// import partnerOnboard from '';

// import {error as errorMiddleware} from './middlewares/index';
import {partnerEmailTemplate,transportConnection} from './config/index';
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParse());

//making route
const partner = require('./routes/partner');

app.use('/partner',partner);
app.get('/testpdf',async function (req, res) {
    console.log("Test PDF");
        // Create a document
    const doc = new PDFDocument();
      
    // Saving the pdf file in root directory.
    doc.pipe(fs.createWriteStream('example.pdf'));
      
    // Adding functionality
    doc
      
      .fontSize(27)
      .text('This the article for GeeksforGeeks', 100, 100);
      
    // Adding an image in the pdf.
      
      doc.image('D:\\Acute\\Project\\email-app\\backend\\group-logo.png', {
        fit: [300, 300],
        align: 'center',
        valign: 'center'
      });
      
      doc
      .fontSize(15)
      .text('Generating PDF with the help of pdfkit', 100, 100);
      
            
    // Apply some transforms and render an SVG path with the 
    // 'even-odd' fill rule
    doc
      .scale(0.6)
      .translate(470, -380)
      .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
      .fill('red', 'even-odd')
      .restore();
      
    // Add some text with annotations
    doc
      .addPage()
      .fillColor('blue')
      .text('The link for GeeksforGeeks website', 100, 100)
      .link(100, 100, 160, 27, 'https://www.geeksforgeeks.org/');
      
    // Finalize PDF file
    doc.end();
    res.end("success")

});
app.get('/test',async function (req, res) {
  var start = `<html><body><table border = "1" cellspacing="0" cellpadding="12">`;
  var header = `<tr><th>Name</th><th>Age</th>`;
  var close = `</table></body></html>`;
  var content = "";
  var obj = [{name:"sanjay",age:"22"},{name:"aakash",age:"22"}];
  for(var i=0; i<obj.length; i++){
    content = content+"<tr><td>"+obj[i].name+"</td><td>"+obj[i].age+"</td>";    
  };
  content = start+header+content+close;
  res.send(content);
})

module.exports = app;