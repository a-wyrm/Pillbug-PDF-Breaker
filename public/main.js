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
// Get font, images?
function resetPDF(){
    currentPDF = {
        file: null,
        countPage: 0,
        font: "0",
        currentPage: 1
    }
}

function onLoad(data) {
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
        console.log(page.getOperatorList());
        console.log(page.commonObjs);
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
document.getElementById('next-page').addEventListener('click', () => {
	const validPage = currentPDF.currentPage < currentPDF.countPage;
	if (validPage) {
		currentPDF.currentPage += 1;
		renderPage();
	}
});

document.getElementById('prev-page').addEventListener('click', () => {
	const validPage = currentPDF.currentPage - 1 > 0;
	if (validPage) {
		currentPDF.currentPage -= 1;
		renderPage();
	}
});

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

// for plaintext
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
genPDF.addEventListener("click", () => {
    
    const formPDFData = new FormData();
    formPDFData.append("pdfFile", textRes.value);
    const plainFormData = Object.fromEntries(formPDFData.entries());
	const formString = JSON.stringify(plainFormData);

    fetch("/get-PDF", {
        method: "POST",
        headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
        body: formString
    });
});