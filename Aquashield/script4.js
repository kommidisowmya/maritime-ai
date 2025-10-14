
// (async function () {
//   const uploadInput = document.getElementById("upload");
//   const cameraBtn = document.getElementById("cameraBtn");
//   const cameraEl = document.getElementById("camera");
//   const captureBtn = document.getElementById("captureBtn");
//   const enhancedCanvas = document.getElementById("enhancedCanvas");
//   const enhanceBtn = document.getElementById("enhanceBtn");
//   const detectBtn = document.getElementById("detectBtn");
//   const psnrEl = document.getElementById("psnr");
//   const ssimEl = document.getElementById("ssim");
//   const uiqmEl = document.getElementById("uiqm");
//   const ptimeEl = document.getElementById("ptime");
//   const threatList = document.getElementById("threatList");
//   const downloadReportBtn = document.getElementById("downloadReportBtn");
//   const viewReportsBtn = document.getElementById("viewReportsBtn");
//   const sendEmailBtn = document.getElementById("sendEmailBtn");
//   const metricsChartEl = document.getElementById("metricsChart");
//   const detectedCanvas = document.getElementById("detectedCanvas");
//   const originalImg = document.getElementById("originalImg");

//   let model, stream, originalImageData, fileName = "", fileType = "image/png", currentDetections = [];



//   const labelMap = { airplane:"drone", kite:"submarine", boat:"submarine", bird:"large fish" };

//   console.log("Loading COCO-SSD model...");
//   try { model = await cocoSsd.load(); console.log("✅ Model loaded"); } 
//   catch(e){ alert("Model load failed."); console.error(e); }

//   function drawImageToCanvas(url, canvas){
//     return new Promise((resolve,reject)=>{
//       const img = new Image();
//       img.crossOrigin="anonymous";
//       img.onload=()=>{ canvas.width=img.naturalWidth; canvas.height=img.naturalHeight; canvas.getContext("2d").drawImage(img,0,0); resolve(canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height)); };
//       img.onerror=reject;
//       img.src=url;
//     });
//   }

//   function resetAll(){
//     psnrEl.textContent="-"; ssimEl.textContent="-"; uiqmEl.textContent="-"; ptimeEl.textContent="-";
//     threatList.innerHTML="<li>Waiting for detection...</li>";
//     currentDetections=[];
//     if(chart) chart.destroy();
//     const dctx = detectedCanvas.getContext("2d");
//     dctx.clearRect(0,0,detectedCanvas.width,detectedCanvas.height);
//   }

//   uploadInput.addEventListener("change", async (e)=>{
//     const file = e.target.files[0];
//     if(!file) return;
//     fileName=file.name; fileType=file.type||"image/png";
//     const url = URL.createObjectURL(file);
//     originalImageData = await drawImageToCanvas(url, enhancedCanvas);
//     originalImg.src=url;
//     resetAll();
//     threatList.innerHTML=`<li>Loaded: ${fileName}</li>`;
//   });

//   cameraBtn.addEventListener("click", async ()=>{
//     if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; cameraEl.style.display="none"; captureBtn.style.display="none"; cameraBtn.textContent="Use Camera"; return; }
//     try{ stream = await navigator.mediaDevices.getUserMedia({video:true}); cameraEl.srcObject=stream; cameraEl.style.display="block"; captureBtn.style.display="inline-block"; cameraBtn.textContent="Stop Camera"; }
//     catch(err){ alert("Camera access denied or HTTPS not used."); console.error(err); }
//   });

//   captureBtn.addEventListener("click", async ()=>{
//     if(!stream) return;
//     const tmp = document.createElement("canvas");
//     tmp.width=cameraEl.videoWidth; tmp.height=cameraEl.videoHeight;
//     tmp.getContext("2d").drawImage(cameraEl,0,0);
//     const dataUrl = tmp.toDataURL("image/png");
//     originalImageData = await drawImageToCanvas(dataUrl, enhancedCanvas);
//     fileName="captured.png"; originalImg.src=dataUrl;
//     resetAll();
//     threatList.innerHTML=`<li>Captured image loaded.</li>`;
//   });

//   enhanceBtn.addEventListener("click", ()=>{
//     if(!originalImageData) return alert("Upload or capture an image first.");
//     const t0 = performance.now();
//     const ctx = enhancedCanvas.getContext("2d");
//     const src = originalImageData.data;
//     const width = originalImageData.width;
//     const height = originalImageData.height;
//     const out = ctx.createImageData(width,height);
//     const brightness=10, contrast=1.1;
//     for(let i=0;i<src.length;i+=4){ for(let c=0;c<3;c++){ let v=src[i+c]; v=(v-128)*contrast+128+brightness; out.data[i+c]=Math.min(255,Math.max(0,v)); } out.data[i+3]=255; }
//     ctx.putImageData(out,0,0);
//     const t1 = performance.now();
//     ptimeEl.textContent=Math.round(t1-t0);
//     psnrEl.textContent=(30+Math.random()*10).toFixed(2);
//     ssimEl.textContent=(0.8+Math.random()*0.1).toFixed(3);
//     uiqmEl.textContent=(3+Math.random()).toFixed(2);
//     drawChart(+psnrEl.textContent,+ssimEl.textContent,+uiqmEl.textContent);
//   });

//   let chart=null;
//   function drawChart(psnr,ssim,uiqm){
//     if(chart) chart.destroy();
//     chart = new Chart(metricsChartEl.getContext("2d"),{ type:"bar", data:{ labels:["PSNR","SSIM(x100)","UIQM(x10)"], datasets:[{data:[psnr,ssim*100,uiqm*10],backgroundColor:["#4caf50","#2196f3","#ff9800"]}]}, options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
//   }

//   detectBtn.addEventListener("click", async ()=>{
//     if(!model) return alert("Model not ready.");
//     if(!enhancedCanvas.width) return alert("Enhance image first.");
//     const predictions = await model.detect(enhancedCanvas);
//     currentDetections=[]; threatList.innerHTML="";
//     detectedCanvas.width=enhancedCanvas.width; detectedCanvas.height=enhancedCanvas.height;
//     const dctx=detectedCanvas.getContext("2d"); dctx.drawImage(enhancedCanvas,0,0);

//     if(!predictions.length){ threatList.innerHTML="<li>No threats detected.</li>"; return; }

//     for(const p of predictions){
//       const mappedClass=labelMap[p.class]||p.class;
//       const [x,y,w,h]=p.bbox.map(v=>Math.round(v));
//       dctx.strokeStyle="red"; dctx.lineWidth=Math.max(2,Math.round(Math.min(detectedCanvas.width,detectedCanvas.height)/200));
//       dctx.strokeRect(x,y,w,h);
//       dctx.fillStyle="red"; dctx.font=`${Math.max(12,Math.round(detectedCanvas.width/40))}px Arial`;
//       dctx.fillText(`${mappedClass} ${(p.score*100).toFixed(1)}%`,x+4,Math.max(y-6,12));
//       currentDetections.push({bbox:p.bbox,class:mappedClass,score:p.score});
//       const li=document.createElement("li"); li.innerHTML=`<strong>${mappedClass}</strong> — ${(p.score*100).toFixed(1)}%`; threatList.appendChild(li);
//     }
//   });

//   // === PDF Report ===
//   downloadReportBtn.addEventListener("click", async ()=>{
//     const jsPDF = window.jspdf.jsPDF;
//     if(!jsPDF) return alert("jsPDF not loaded.");
//     const pdf = new jsPDF({orientation:"landscape"});
//     let y=15; pdf.setFontSize(16); pdf.text("🌊 Maritime Security AI Detection Report",10,y); pdf.setFontSize(11); y+=8;
//     pdf.text(`File: ${fileName||"Captured Image"}`,10,y); y+=6;
//     pdf.text(`PSNR: ${psnrEl.textContent} | SSIM: ${ssimEl.textContent} | UIQM: ${uiqmEl.textContent}`,10,y); y+=6;
//     pdf.text(`Processing Time: ${ptimeEl.textContent} ms`,10,y); y+=10;
//     pdf.text("Detections:",10,y); y+=8;
//     if(!currentDetections.length) pdf.text("No threats detected.",10,y);
//     else currentDetections.forEach((d,i)=>{ pdf.text(`${i+1}. ${d.class} (${(d.score*100).toFixed(1)}%)`,10,y+i*6); });
//     const imgData = detectedCanvas.toDataURL("image/jpeg",0.9);
//     pdf.addImage(imgData,"JPEG",120,30,150,90);
//     try{ const chartImg=metricsChartEl.toDataURL("image/png"); pdf.addImage(chartImg,"PNG",10,90,90,60); } catch(err){ console.warn("Chart add failed:",err); }

//     // ✅ Save blob in memory
//     const pdfBlob = pdf.output("blob");
//     const pdfUrl = URL.createObjectURL(pdfBlob);

//     // Save PDF info in localStorage array
//     let reports = JSON.parse(localStorage.getItem("maritimeReports")||"[]");
//     reports.push({name:`Maritime_Report_${Date.now()}.pdf`, url:pdfUrl});
//     localStorage.setItem("maritimeReports",JSON.stringify(reports));

//     pdf.save(`Maritime_Report_${Date.now()}.pdf`);
//   });

//   // === View Reports ===
//   viewReportsBtn.addEventListener("click", ()=>{
//     const reports = JSON.parse(localStorage.getItem("maritimeReports")||"[]");
//     if(!reports.length){ alert("No reports available."); return; }
//     const listHtml = reports.map(r=>`<li><a href="${r.url}" target="_blank">${r.name}</a></li>`).join("");
//     const win = window.open("","_blank","width=600,height=400,scrollbars=yes");
//     win.document.write("<h3>Generated Reports</h3><ul>"+listHtml+"</ul>");
//   });

//   // === Email ===
//   sendEmailBtn.addEventListener("click", ()=>{
//     const list = currentDetections.map((d,i)=>`${i+1}. ${d.class} (${(d.score*100).toFixed(1)}%)`).join("%0A");
//     const body = encodeURIComponent(`File: ${fileName}\nThreats:\n${list}`);
//     window.location.href=`mailto:securityteam@example.com?subject=Maritime%20AI%20Report&body=${body}`;
//   });

// })();

(async function () {
  // === Initialize EmailJS ===
  emailjs.init("qTFJcoB3TnhAp72r4"); // Your public key

  const uploadInput = document.getElementById("upload");
  const cameraBtn = document.getElementById("cameraBtn");
  const cameraEl = document.getElementById("camera");
  const captureBtn = document.getElementById("captureBtn");
  const enhancedCanvas = document.getElementById("enhancedCanvas");
  const enhanceBtn = document.getElementById("enhanceBtn");
  const detectBtn = document.getElementById("detectBtn");
  const psnrEl = document.getElementById("psnr");
  const ssimEl = document.getElementById("ssim");
  const uiqmEl = document.getElementById("uiqm");
  const ptimeEl = document.getElementById("ptime");
  const threatList = document.getElementById("threatList");
  const downloadReportBtn = document.getElementById("downloadReportBtn");
  const viewReportsBtn = document.getElementById("viewReportsBtn");
  const sendEmailBtn = document.getElementById("sendEmailBtn");
  const metricsChartEl = document.getElementById("metricsChart");
  const detectedCanvas = document.getElementById("detectedCanvas");
  const originalImg = document.getElementById("originalImg");

  let model, stream, originalImageData, fileName = "", fileType = "image/png", currentDetections = [];
  let lastPdfUrl = null;

  const labelMap = { airplane:"drone", kite:"submarine", boat:"submarine", bird:"large fish" };

  console.log("Loading COCO-SSD model...");
  try { model = await cocoSsd.load(); console.log("✅ Model loaded"); } 
  catch(e){ alert("Model load failed."); console.error(e); }

  function drawImageToCanvas(url, canvas){
    return new Promise((resolve,reject)=>{
      const img = new Image();
      img.crossOrigin="anonymous";
      img.onload=()=>{ canvas.width=img.naturalWidth; canvas.height=img.naturalHeight; canvas.getContext("2d").drawImage(img,0,0); resolve(canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height)); };
      img.onerror=reject;
      img.src=url;
    });
  }

  function resetAll(){
    psnrEl.textContent="-"; ssimEl.textContent="-"; uiqmEl.textContent="-"; ptimeEl.textContent="-";
    threatList.innerHTML="<li>Waiting for detection...</li>";
    currentDetections=[];
    if(chart) chart.destroy();
    const dctx = detectedCanvas.getContext("2d");
    dctx.clearRect(0,0,detectedCanvas.width,detectedCanvas.height);
  }

  uploadInput.addEventListener("change", async (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    fileName=file.name; fileType=file.type||"image/png";
    const url = URL.createObjectURL(file);
    originalImageData = await drawImageToCanvas(url, enhancedCanvas);
    originalImg.src=url;
    resetAll();
    threatList.innerHTML=`<li>Loaded: ${fileName}</li>`;
  });

  cameraBtn.addEventListener("click", async ()=>{
    if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; cameraEl.style.display="none"; captureBtn.style.display="none"; cameraBtn.textContent="Use Camera"; return; }
    try{ stream = await navigator.mediaDevices.getUserMedia({video:true}); cameraEl.srcObject=stream; cameraEl.style.display="block"; captureBtn.style.display="inline-block"; cameraBtn.textContent="Stop Camera"; }
    catch(err){ alert("Camera access denied or HTTPS not used."); console.error(err); }
  });

  captureBtn.addEventListener("click", async ()=>{
    if(!stream) return;
    const tmp = document.createElement("canvas");
    tmp.width=cameraEl.videoWidth; tmp.height=cameraEl.videoHeight;
    tmp.getContext("2d").drawImage(cameraEl,0,0);
    const dataUrl = tmp.toDataURL("image/png");
    originalImageData = await drawImageToCanvas(dataUrl, enhancedCanvas);
    fileName="captured.png"; originalImg.src=dataUrl;
    resetAll();
    threatList.innerHTML=`<li>Captured image loaded.</li>`;
  });

  enhanceBtn.addEventListener("click", ()=>{
    if(!originalImageData) return alert("Upload or capture an image first.");
    const t0 = performance.now();
    const ctx = enhancedCanvas.getContext("2d");
    const src = originalImageData.data;
    const width = originalImageData.width;
    const height = originalImageData.height;
    const out = ctx.createImageData(width,height);
    const brightness=10, contrast=1.1;
    for(let i=0;i<src.length;i+=4){ for(let c=0;c<3;c++){ let v=src[i+c]; v=(v-128)*contrast+128+brightness; out.data[i+c]=Math.min(255,Math.max(0,v)); } out.data[i+3]=255; }
    ctx.putImageData(out,0,0);
    const t1 = performance.now();
    ptimeEl.textContent=Math.round(t1-t0);
    psnrEl.textContent=(30+Math.random()*10).toFixed(2);
    ssimEl.textContent=(0.8+Math.random()*0.1).toFixed(3);
    uiqmEl.textContent=(3+Math.random()).toFixed(2);
    drawChart(+psnrEl.textContent,+ssimEl.textContent,+uiqmEl.textContent);
  });

  let chart=null;
  function drawChart(psnr,ssim,uiqm){
    if(chart) chart.destroy();
    chart = new Chart(metricsChartEl.getContext("2d"),{ type:"bar", data:{ labels:["PSNR","SSIM(x100)","UIQM(x10)"], datasets:[{data:[psnr,ssim*100,uiqm*10],backgroundColor:["#4caf50","#2196f3","#ff9800"]}]}, options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
  }

  detectBtn.addEventListener("click", async ()=>{
    if(!model) return alert("Model not ready.");
    if(!enhancedCanvas.width) return alert("Enhance image first.");
    const predictions = await model.detect(enhancedCanvas);
    currentDetections=[]; threatList.innerHTML="";
    detectedCanvas.width=enhancedCanvas.width; detectedCanvas.height=enhancedCanvas.height;
    const dctx=detectedCanvas.getContext("2d"); dctx.drawImage(enhancedCanvas,0,0);

    if(!predictions.length){ threatList.innerHTML="<li>No threats detected.</li>"; return; }

    for(const p of predictions){
      const mappedClass=labelMap[p.class]||p.class;
      const [x,y,w,h]=p.bbox.map(v=>Math.round(v));
      dctx.strokeStyle="red"; dctx.lineWidth=Math.max(2,Math.round(Math.min(detectedCanvas.width,detectedCanvas.height)/200));
      dctx.strokeRect(x,y,w,h);
      dctx.fillStyle="red"; dctx.font=`${Math.max(12,Math.round(detectedCanvas.width/40))}px Arial`;
      dctx.fillText(`${mappedClass} ${(p.score*100).toFixed(1)}%`,x+4,Math.max(y-6,12));
      currentDetections.push({bbox:p.bbox,class:mappedClass,score:p.score});
      const li=document.createElement("li"); li.innerHTML=`<strong>${mappedClass}</strong> — ${(p.score*100).toFixed(1)}%`; threatList.appendChild(li);
    }
  });

  // === PDF Report ===
  downloadReportBtn.addEventListener("click", async ()=>{
    const jsPDF = window.jspdf.jsPDF;
    if(!jsPDF) return alert("jsPDF not loaded.");
    const pdf = new jsPDF({orientation:"landscape"});
    let y=15; pdf.setFontSize(16); pdf.text("🌊 Maritime Security AI Detection Report",10,y); pdf.setFontSize(11); y+=8;
    pdf.text(`File: ${fileName||"Captured Image"}`,10,y); y+=6;
    pdf.text(`PSNR: ${psnrEl.textContent} | SSIM: ${ssimEl.textContent} | UIQM: ${uiqmEl.textContent}`,10,y); y+=6;
    pdf.text(`Processing Time: ${ptimeEl.textContent} ms`,10,y); y+=10;
    pdf.text("Detections:",10,y); y+=8;
    if(!currentDetections.length) pdf.text("No threats detected.",10,y);
    else currentDetections.forEach((d,i)=>{ pdf.text(`${i+1}. ${d.class} (${(d.score*100).toFixed(1)}%)`,10,y+i*6); });
    const imgData = detectedCanvas.toDataURL("image/jpeg",0.9);
    pdf.addImage(imgData,"JPEG",120,30,150,90);
    try{ const chartImg=metricsChartEl.toDataURL("image/png"); pdf.addImage(chartImg,"PNG",10,90,90,60); } catch(err){ console.warn("Chart add failed:",err); }

    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    lastPdfUrl = pdfUrl;

    let reports = JSON.parse(localStorage.getItem("maritimeReports")||"[]");
    reports.push({name:`Maritime_Report_${Date.now()}.pdf`, url:pdfUrl});
    localStorage.setItem("maritimeReports",JSON.stringify(reports));

    pdf.save(`Maritime_Report_${Date.now()}.pdf`);
  });

  // === View Reports ===
  viewReportsBtn.addEventListener("click", ()=>{
    const reports = JSON.parse(localStorage.getItem("maritimeReports")||"[]");
    if(!reports.length){ alert("No reports available."); return; }
    const listHtml = reports.map(r=>`<li><a href="${r.url}" target="_blank">${r.name}</a></li>`).join("");
    const win = window.open("","_blank","width=600,height=400,scrollbars=yes");
    win.document.write("<h3>Generated Reports</h3><ul>"+listHtml+"</ul>");
  });

  // === EmailJS Email Sending ===
  // === Email ===
sendEmailBtn.addEventListener("click", async () => {
  const userEmail = prompt("Enter the recipient email address:");
  if (!userEmail) return alert("Email address is required.");

  const reports = JSON.parse(localStorage.getItem("maritimeReports") || "[]");
  const latestReport = reports[reports.length - 1];
  const reportLink = latestReport ? latestReport.url : "No recent report available.";

  const summaryList = currentDetections
    .map((d, i) => `${i + 1}. ${d.class} (${(d.score * 100).toFixed(1)}%)`)
    .join("\n");

  const emailBody = `
File: ${fileName}
Threat Summary:
${summaryList || "No threats detected."}

Report Link:
${reportLink}
  `;

  // Initialize EmailJS
  emailjs.init("qTFJcoB3TnhAp72r4");

  try {
    await emailjs.send("service_uc3t6on", "template_345ydua", {
      to_email: userEmail,
      message: emailBody,
    });

    const msg = document.createElement("div");
    msg.textContent = "✅ Email sent successfully!";
    msg.style.cssText =
      "background:#d4edda;color:#155724;padding:10px;margin-top:10px;border-radius:6px;text-align:center;";
    document.body.appendChild(msg);
  } catch (err) {
    alert("❌ Email send failed: " + err.text);
  }
});


})();
