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

// retrieve file and send it to server

function resetPDF(){
    currentPDF = {
        file: null,
        countPage: 0,
        currentPage: 1
    }
}
function onLoad(data) {
    resetPDF();
    const PDFfile = pdfjsLib.getDocument(data);
    PDFfile.promise.then (doc => {
        currentPDF.file = doc;
        currentPDF.countPage = doc.numPages;
        renderPage();
    });
}
function renderPage() {
    currentPDF.file.getPage(currentPDF.currentPage).then((page) => { 
        var context = viewer.getContext('2d');
        var viewport = page.getViewport();
        viewer.height = viewport.height;
		viewer.width = viewport.width;

        var renderContext = {
			canvasContext: context,
			viewport: viewport
		};

        page.render(renderContext);
    });
}




genBut.addEventListener('click', () => {
    const inputFile = fileInput.files[0];

    if (inputFile == 'application/pdf'){
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