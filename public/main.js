// for upload
const fileInput = document.getElementById("fileInput");
const uploadBut = document.getElementById("uploadBut");
const textRes = document.getElementById("textRes");

// for rendering pdf
const input = document.getElementById('fileInput');
const openFile = document.getElementById('fileInput');
const currentPage = document.getElementById('page-num');
const viewer = document.querySelector('.canvasBox');
let currentPDF = {}

// loading PDF

// TODO: 
// Get images?

let pdfFont = "";
let pdfSent = "";
let textLeft = 0;
let textTop = 0;
let textSize = 0;

const listofFD = [];


function resetPDF(){
    currentPDF = {
        file: null,
        countPage: 0,
        currentPage: 1
    }
}

function onLoad(data) {
    // resets pdf
    resetPDF();

    const PDFfile = pdfjsLib.getDocument(data);
    PDFfile.promise.then ((doc) => {
        currentPDF.file = doc;
        currentPDF.countPage = doc.numPages;
        renderPage();
    });
}

function renderPage() {
	currentPDF.file.getPage(currentPDF.currentPage).then((page) => {
        //console.log(page.getOperatorList());
        
        
        var ctx = document.createElement('canvas').getContext('2d', { alpha: false });
        var pageContainer = document.createElement('div');

        page.getTextContent().then(function (textContent) {
            
            textContent.items.forEach(function (textItem) {

                var tx = pdfjsLib.Util.transform(pdfjsLib.Util.transform(viewport.transform, textItem.transform), [1, 0, 0, -1, 0, 0]);
                var style = textContent.styles[textItem.fontName];
                var fontSize = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]));
        
                if (style.ascent){ 
                    tx[5] -= fontSize * style.ascent;
                } 
                else if (style.descent) { 
                    tx[5] -= fontSize * (1 + style.descent);
                } 
                else {
                    tx[5] -= fontSize / 2;
                }
                
                // adjust for rendered width
                if (textItem.width > 0) {

                    ctx.font = tx[0] + 'px ' + style.fontFamily;   
                    var width = ctx.measureText(textItem.str).width;

                    if (width > 0) {
                        tx[0] = (textItem.width * viewport.scale) / width;
                    }
                }
        
                var item = document.createElement('span');
                item.textContent = textItem.str;
                item.style.fontFamily = style.fontFamily;

                item.style.fontSize = fontSize + 'px';
                item.style.transform = 'scaleX(' + tx[0] + ')';
                item.style.left = tx[4] + 'px';
                item.style.top = tx[5] + 'px';
                
                //console.log(textItem.str);

                // assign global variables
                pdfFont = style.fontFamily;
                pdfSent = textItem.str;
                textSize = fontSize;
                textLeft = tx[4];
                textTop = tx[5];

                // for list
                let textProp = {};

                textProp.pdfFont = pdfFont;
                textProp.pdfSent = pdfSent;
                textProp.textSize = textSize;
                textProp.textLeft = textLeft;
                textProp.textTop = textTop;

                //console.log(textProp);
                listofFD.push(textProp);


            });
        });

        var scale = 1;
		var context = viewer.getContext('2d');
		var viewport = page.getViewport({ scale: scale,});
		viewer.height = viewport.height;
		viewer.width = viewport.width;

		var renderContext = {
			canvasContext: context,
			viewport: viewport
		};
		page.render(renderContext);
	});
	currentPage.innerHTML = currentPDF.currentPage + ' of ' + currentPDF.countPage;
}


// buttons

// Next page button
document.getElementById('next-page').addEventListener('click', () => {
	const validPage = currentPDF.currentPage < currentPDF.countPage;
	if (validPage) {
		currentPDF.currentPage += 1;
		renderPage();
	}
});


// Previous page button
document.getElementById('prev-page').addEventListener('click', () => {
	const validPage = currentPDF.currentPage - 1 > 0;
	if (validPage) {
		currentPDF.currentPage -= 1;
		renderPage();
	}
});

// add PDF
genBut.addEventListener('click', () => {
    const inputFile = fileInput.files[0];

    if (inputFile.type !== "application/pdf"){
        alert("Please use a PDF file!")
    }
    else {
        const reader = new FileReader();
		reader.readAsDataURL(inputFile);
		reader.onload = () => {
			onLoad(reader.result);
		}
    }
});

// add plaintext
uploadBut.addEventListener("click", () => {
    const formData = new FormData();

    formData.append("pdfFile", fileInput.files[0]);

    fetch("/extract-text", {
        method: "POST",
        body: formData
    }).then(response => {
        return response.text();
    }).then(extractedText => {
        textRes.value = extractedText.trim();
    });
});


// for generating PDF
// mutable array that formdata keeps getting added onto 
genPDF.addEventListener("click", () => {
    
    //const formPDFData = new FormData();
    //formPDFData.append("pdfFile", textRes.value);
    //formPDFData.append("pdfSent", pdfSent);
    //formPDFData.append("textSize", textSize);
    //formPDFData.append("textLeft", textLeft);
    //formPDFData.append("textTop", textTop);



    // convert formPDFData to string
    console.log(listofFD.length);
    const formString = JSON.stringify(listofFD);

    // gonna have to create a loopz
    fetch("/get-PDF", {
        method: "POST",
        headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
        body: formString
    });
});