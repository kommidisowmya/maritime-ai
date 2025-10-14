let model;

async function loadModel() {
  model = await mobilenet.load();
  console.log("Model Loaded!");
}
loadModel();


const upload = document.getElementById('upload');
const image = document.getElementById('image');
upload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    image.src = e.target.result;
  };
  reader.readAsDataURL(file);
});


const detectBtn = document.getElementById('detect');
const predictionsDiv = document.getElementById('predictions');

detectBtn.addEventListener('click', async () => {
  if (!model) {
    alert("Model is not loaded yet!");
    return;
  }
  if (!image.src) {
    alert("Please upload an image first!");
    return;
  }

  const predictions = await model.classify(image);
  predictionsDiv.innerHTML = '';
  predictions.forEach((pred) => {
    const p = document.createElement('p');
    p.innerText = `${pred.className} - ${(pred.probability * 100).toFixed(2)}%`;
    predictionsDiv.appendChild(p);
  });
});
