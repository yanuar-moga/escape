document.getElementById("loginForm").addEventListener("submit", function(e){
  e.preventDefault();

  const role = document.getElementById("role").value;
  const user = document.getElementById("username").value.toLowerCase();
  const pass = document.getElementById("password").value;

  const siswaList = ["kelompok1","kelompok2","kelompok3","kelompok4","kelompok5","kelompok6"];

  if(role === "siswa"){
    if(siswaList.includes(user) && pass === "belajar2025"){
      sessionStorage.setItem("kelompok", user);
      window.location.href = "game.html";
    } else {
      alert("Username / Password salah!");
    }
  }

  if(role === "admin"){
    if(user === "admin" && pass === "guru123"){
      window.location.href = "admin.html";
    } else {
      alert("Login admin salah!");
    }
  }
});
