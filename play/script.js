<script>

let soal = [];
let kunci = [];

function loadDoc(){
  const id = document.getElementById("docId").value.trim();
  if(!id){ alert("Masukkan ID Dokumen!"); return; }

  document.getElementById("loading").classList.remove("hidden");

  google.script.run
    .withSuccessHandler(renderPreview)
    .parseDoc(id);
}

function renderPreview(data){

  soal = data.soal;
  kunci = data.kunci;

  document.getElementById("loading").classList.add("hidden");

  // VALIDASI
  if(soal.length !== kunci.length){
    alert("Jumlah kunci tidak sesuai dengan jumlah soal!");
    return;
  }

  document.getElementById("previewBlock").classList.remove("hidden");

  const tbl = document.getElementById("tbl");
  tbl.innerHTML = `
    <tr>
      <th>No</th><th>Soal</th><th>A</th><th>B</th>
      <th>C</th><th>D</th><th>Kunci</th>
    </tr>
  `;

  soal.forEach((s,idx)=>{
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${idx+1}</td>
      <td>${s.teks}</td>
      <td>${s.opsi[0]}</td>
      <td>${s.opsi[1]}</td>
      <td>${s.opsi[2]}</td>
      <td>${s.opsi[3]}</td>
      <td>${kunci[idx]}</td>
    `;
    tbl.appendChild(row);
  });
}

function createForm(){
  const judul = document.getElementById("judul").value.trim();
  google.script.run
    .withSuccessHandler(showResult)
    .createForm({judul, soal, kunci});
}

function showResult(res){
  document.getElementById("resultBlock").classList.remove("hidden");
  document.getElementById("editUrl").href = res.editUrl;
  document.getElementById("editUrl").innerText = res.editUrl;
  document.getElementById("pubUrl").href = res.publishUrl;
  document.getElementById("pubUrl").innerText = res.publishUrl;
  document.getElementById("sheetUrl").href = res.sheetUrl;
  document.getElementById("sheetUrl").innerText = res.sheetUrl;
}

</script>
