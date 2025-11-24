function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("DOC to Google Form Converter V3")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(file) {
  return HtmlService.createHtmlOutputFromFile(file).getContent();
}

//===========================
// READ GOOGLE DOC
//===========================
function parseDoc(docId) {
  const doc = DocumentApp.openById(docId);
  const raw = doc.getBody().getText().split("\n").map(x => x.trim());

  let soal = [];
  let kunci = [];

  let block = { teks: "", opsi: [], idx: null };
  let modeKunci = false;

  for (let line of raw) {

    if (line === "") continue;

    // === MODE KUNCI (bagian akhir) ===
    if (modeKunci) {
      if (/^[A-Da-d]$/.test(line)) kunci.push(line.toUpperCase());
      continue;
    }

    // === Detect start / soal baru ===
    if (/^\d+\./.test(line)) {
      if (block.teks) soal.push(block);
      block = { teks: line.replace(/^\d+\.\s*/, ""), opsi: [] };
      continue;
    }

    // === opsi A-D ===
    if (/^[A-Da-d]\./.test(line)) {
      block.opsi.push(line.replace(/^[A-Da-d]\.\s*/, ""));
      continue;
    }

    // === masuk bagian kunci ===
    if (/^Kunci/i.test(line)) {
      if (block.teks) soal.push(block);
      modeKunci = true;
      continue;
    }

    // === baris tambahan soal multi-line ===
    block.teks += " " + line;
  }

  if (block.teks) soal.push(block);

  // SCREEN CLEAN
  soal = soal.filter(s => s.opsi.length === 4);

  return { soal, kunci };
}

//==========================
// GENERATE GOOGLE FORM
//==========================
function createForm(payload) {

  const judul = payload.judul;
  const soal = payload.soal;
  const kunci = payload.kunci;

  const form = FormApp.create(judul);
  form.setIsQuiz(true);

  // IDENTITAS
  form.addTextItem().setTitle("Nama").setRequired(true);
  form.addTextItem().setTitle("Nomor Absen").setRequired(true);
  const kelas = form.addMultipleChoiceItem();
  kelas.setTitle("Kelas").setRequired(true)
    .setChoices(["9A","9B","9C","9D","9E","9F","9G","9H"].map(x => kelas.createChoice(x)));

  form.addPageBreakItem().setTitle("Bagian Soal Pilihan Ganda 1");

  let nomor = 1;
  let section = 2;

  for (let i = 0; i < soal.length; i++) {

    if (i > 0 && i % 10 === 0) {
      form.addPageBreakItem().setTitle("Bagian Soal Pilihan Ganda " + section);
      section++;
    }

    const item = form.addMultipleChoiceItem();
    item.setTitle(nomor + ". " + soal[i].teks.trim());

    const choices = soal[i].opsi.map((o, idx) => {
      return item.createChoice(String.fromCharCode(65 + idx) + ". " + o);
    });

    item.setChoices(choices);
    item.setPoints(2);

    const indexKunci = kunci[i].charCodeAt(0) - 65;
    item.setHelpText("Jawaban benar: " + choices[indexKunci].getValue());

    nomor++;
  }

  // AUTO SPREADSHEET
  const sheet = SpreadsheetApp.create(judul + " - Responses");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());

  return {
    editUrl: form.getEditUrl(),
    publishUrl: form.getPublishedUrl(),
    sheetUrl: sheet.getUrl()
  };
}
