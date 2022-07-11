const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const bodyParser = require("body-parser");

// for hummus
const HummusRecipe = require('hummus-recipe');

// app
const app = express();
app.use(bodyParser.json());
app.use("/", express.static("public"));
app.use(express.static(__dirname + '/css'));


app.post("/get-PDF", (req, res) =>{
  const pdfDoc = new HummusRecipe('new', Date.now() + '.pdf');
  
  //console.log(req.body.length);
  //console.log(req.body[0].pdfFont);
  
  pdfDoc
    // will need to create for loop to iterate every page
    // 1st Page
    .createPage('legal')

    for (let i = 0; i < req.body.length; i++){
        pdfDoc.text(req.body[i].pdfSent, parseFloat(req.body[i].textLeft), parseFloat(req.body[i].textTop), {
            color: '#066099',
            fontSize: parseFloat(req.body[i].textSize),
            bold: true,
            font: req.body[i].pdfFont,
            opacity: 0.8
        })
    }
    
    pdfDoc.endPage()
    
    // 2nd page
    //.createPage('A4', 90)
    //.circle(150, 150, 300)
    //.endPage()
    // end and save
    .endPDF(()=>{});

    //req.body....
});

app.use(fileUpload());
app.post("/extract-text", (req, res) => {
    //console.log(req.files.pdfFile);
    if (!req.files && !req.files.pdfFile) {
        res.status(400);
        res.end();
    }
    pdfParse(req.files.pdfFile).then(result => {
        res.send(result.text);
    });
});


app.listen(3000);