const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const bodyParser = require("body-parser");

// for hummus
let muhammara  = require('muhammara');

// app
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use("/", express.static("public"));
app.use(express.static(__dirname + '/css'));


app.post("/get-PDF", (req, res) =>{

   // we'll need to see how to sort the list and print it out based on that list
  // number of pages for pdf.
  let PageC = req.body[0].pdfNumofPages;
  let currentLine = 0;

  var pdfWriter = muhammara.createWriter(
    __dirname + "/generated_pdfs/EmptyPages.pdf",
    { version: muhammara.ePDFVersion14 }
  );


  for ( let j = 1; j <= PageC; j++){

    var page = pdfWriter.createPage(0, 0, 595, 842);
    var cxt = pdfWriter.startPageContentContext(page);

    // change i to be currentline and set currentline = to i when break
    for (let i = currentLine; i < req.body.length; i++){

        var textOptions = {
            font: pdfWriter.getFontForFile(
                __dirname + "/public/fonts/sans-serif.ttf"
            ),
            size: parseFloat(req.body[i].textSize),
            colorspace: "gray",
            color: 0x00,
            underline: true,
        };
        
        
        // if we are at a new to a new page
        console.log(req.body[i].pdfPage);
        if (req.body[i].pdfPage > j){
            cxt
            .writeText(req.body[i].pdfSent, parseFloat(req.body[i].textLeft), parseFloat(req.body[i].textTop), textOptions);
            currentLine = i;
            break;
        }
        else{
            // we'll need to keep track of i
            //console.log(req.body[i].pdfSent, parseFloat(req.body[i].textLeft), parseFloat(req.body[i].textTop), textOptions);
        }
    }
    pdfWriter.writePage(page);
    pdfWriter.end();
    }
    PageC = 0;
    pdfWriter.end(()=>{});
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