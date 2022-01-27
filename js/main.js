const u = '../pdfs/testpdf.pdf';

let pdfDoc = null; // the doc
let pageNumber = 1; // the page number
let pageRender = false; // we run our page render method to set to true
let pagePending = null; // fetching multiple pages


const scale = 1.5; // the size
const canvas = document.querySelector('#pdf-render');
ctx = canvas.getContext('2d');

// Page render

const renderPage = num => {
    
    pageRender = true;

    // get page

    pdfDoc.getPage(num).then(page => {

    // canvas size 
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
        canvasContext: ctx,
        viewport
    };

    page.render(renderCtx).promise.then(() => {
        pageRender = false;

        if (pagePending !== null) {
        renderPage(pagePending);
        pagePending = null;
        }
    });

    // current page
    document.querySelector('#page-num').innerHTML = num;
    });
};

// Check for pages rendering
const queueRenderPage = function(num) {
  if (pageRender) {
    pagePending = num;
  } 
  else {
    renderPage(num);
  }
};

// Show Prev Page
const showPrevPage = function(){
  if (pageNumber <= 1) {
    return;
  }
  pageNumber--;
  queueRenderPage(pageNumber);
};

// Show Next Page
const showNextPage = function(){
  if (pageNumber >= pdfDoc.numPages) {
    return;
  }
  pageNumber++;
  queueRenderPage(pageNumber);
};

// get document
pdfjsLib.getDocument(u).promise.then(pdfDoc_ => {

    pdfDoc = pdfDoc_;

    document.querySelector('#page-count').innerHTML = pdfDoc.numPages;

    renderPage(pageNumber);
  })

  .catch(err => {

    // error
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);

    // remove the top bar
    document.querySelector('.top-bar').style.display = 'none';
  });


// buttons
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);