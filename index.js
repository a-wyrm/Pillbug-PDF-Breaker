const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");

// for hummus
const HummusRecipe = require('hummus-recipe');

// app

const app = express();
app.use("/", express.static("public"));
app.use(express.static(__dirname + '/css'));


app.post("/get-PDF", (req, res) =>{
  const pdfDoc = new HummusRecipe('new', Date.now() + '.pdf');
  pdfDoc
      // 1st Page
      .createPage('letter-size')
      .text('Welcome to Hummus-Recipe', 'center', 250, {
          color: '#066099',
          fontSize: 30,
          bold: true,
          font: 'Helvatica',
          align: 'center center',
          opacity: 0.8
      })
      .endPage()
      
      // 2nd page
      .createPage('A4', 90)
      .circle(150, 150, 300)
      .endPage()
      // end and save
      .endPDF(()=>{});

      //req.body....
});

app.use(fileUpload());
app.post("/extract-text", (req, res) => {
  if (!req.files && !req.files.pdfFile) {
      res.status(400);
      res.end();
  }

  pdfParse(req.files.pdfFile).then(result => {
      res.send(result.text);
  });
});


app.listen(3000);