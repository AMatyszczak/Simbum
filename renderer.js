document.addEventListener("drop", (event) => {
  event.preventDefault();
  event.stopPropagation();

  const file = event.dataTransfer.files.item(0);
  if (file.type.includes("image/")) {
    console.log("filepath:", file.path);
    const imgElement = document.getElementById("dropped_image");
    imgElement.src = file.path;
  }
});

document.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener("dragenter", (event) => {
  console.log("File is in the Drop Space");
});

document.addEventListener("dragleave", (event) => {
  console.log("File has left the Drop Space");
});
