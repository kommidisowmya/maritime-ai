let net;

async function loadModel() {
  net = await mobilenet.load();
  console.log("Model loaded successfully");
}

loadModel();

const upload = document.getElementById("upload");
const image = document.getElementById("image");
const detectBtn = document.getElementById("detect");
const predictionsDiv = document.getElementById("predictions");

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    image.src = URL.createObjectURL(file);
    predictionsDiv.innerHTML = "";
  }
});

detectBtn.addEventListener("click", async () => {
  if (!image.src) return alert("Please upload an image first!");
  predictionsDiv.innerHTML = "Analyzing...";
  
  const result = await net.classify(image);
  predictionsDiv.innerHTML = result
    .map(pred => `<p>${pred.className} - ${(pred.probability * 100).toFixed(2)}%</p>`)
    .join("");
});
