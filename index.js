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
  
  // number of pages for pdf.
  let PageC = req.body[0].pdfNumofPages;

  let currentLine = 0;
  
  pdfDoc
    // will need to create for loop to iterate every page
    // send page amount, will need to break out of for loop
    for ( let j = 1; j <= PageC; j++){
    
        pdfDoc.createPage('legal')
        // change i to be currentline and set currentline = to i when break
        for (let i = currentLine; i < req.body.length; i++){
            // if we are at a new to a new page
            if (req.body[i].pdfPage > j){
                currentLine = i;
                break;
            }
            else{
                // we'll need to keep track of i
                pdfDoc.text(req.body[i].pdfSent, parseFloat(req.body[i].textLeft), parseFloat(req.body[i].textTop), {
                    color: '#066099',
                    fontSize: parseFloat(req.body[i].textSize),
                    bold: true,
                    font: req.body[i].pdfFont,
                    opacity: 0.8
                })
            }
        }
        pdfDoc.endPage()
    }
    pdfDoc.endPDF(()=>{});
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