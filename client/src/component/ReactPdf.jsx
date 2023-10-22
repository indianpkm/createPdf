import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import pdf from "../assets/nature.pdf";
import { PDFDocument } from "pdf-lib";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function ReactPdf() {
  const [numPages, setNumPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState([]);
  const [newPdf, setNewPdf] = useState(null); // Initialize with null
  const [image, setImage] = useState("");

  useEffect(() => {
    async function fetchPdf() {
      const loadingTask = pdfjs.getDocument(pdf);
      const pdfDocument = await loadingTask.promise;
      setNumPages(pdfDocument.numPages);
    }
    fetchPdf();
  }, []);

  function handleItemClick(pageNumber) {
    if (selectedPages.includes(pageNumber)) {
      setSelectedPages(selectedPages.filter((page) => page !== pageNumber));
    } else {
      setSelectedPages([...selectedPages, pageNumber]);
    }
  }

  function renderPages() {
    const pages = [];
    for (let i = 1; i <= numPages; i++) {
      const isSelected = selectedPages.includes(i);
      const pageStyle = {
        border: isSelected ? "2px solid blue" : "2px solid transparent",
        display: "inline-block",
        margin: "5px",
        padding: "5px",
      };

      pages.push(
        <div key={i} style={pageStyle} onClick={() => handleItemClick(i)}>
          <Page file={pdf} width={250} scale={1.5} pageNumber={i} />
          <p>Page {i}</p>
        </div>
      );
    }
    return pages;
  }

  async function createAndDownloadPdf() {
    if (selectedPages.length === 0) {
      alert("Please select at least one page.");
      return;
    }

    const pdfDoc = await PDFDocument.create();
    for (const pageNumber of selectedPages) {
      const existingPdfBytes = await fetch(pdf).then((res) =>
        res.arrayBuffer()
      );
      const externalPdfDoc = await PDFDocument.load(existingPdfBytes);
      const [copiedPage] = await pdfDoc.copyPages(externalPdfDoc, [
        pageNumber - 1,
      ]);
      pdfDoc.addPage(copiedPage);
    }

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selectedPages.pdf";
    a.click();
    URL.revokeObjectURL(url);

    setNewPdf(blob); // Update the newPdf state
  }

  const handleUpload = async () => {
    if (newPdf) {
      const formData = new FormData();
      formData.append("name", "selectedPages.pdf");
      formData.append("file", newPdf);

      try {
        const response = await fetch("http://localhost:5000/file/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        console.log(data);
        if (response.ok) {
          alert("PDF uploaded successfully!");
        } else {
          alert("PDF upload failed. Please try again.");
        }
      } catch (error) {
        console.error("Error uploading PDF:", error);
      }
    } else {
      alert("No PDF to upload. Please create a PDF first.");
    }
  };

  // const handlechange = (e) => {
  //   console.log(e.target.files);
  //   setImage(e.target.files[0]);
  // };
  // console.log(image);

  return (
    <div>
      <Document file={pdf} onLoadSuccess={() => {}}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {renderPages()}
        </div>
      </Document>
      <button onClick={createAndDownloadPdf}>
        Download Selected Pages as PDF
      </button>
      {/* <input type="file" name="file" onChange={(e) => handlechange(e)} /> */}
      <button onClick={handleUpload}>Upload</button>
      <p>Selected Pages: {selectedPages.join(", ")}</p>
    </div>
  );
}

export default ReactPdf;
