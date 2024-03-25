import { detecType, setStorage, detecIcon } from "./helpers.js";

//! HTML'den gelenler
const form = document.querySelector("form");
const list = document.querySelector("ul");
console.log(list);
//! Olay İzleyicileri
form.addEventListener("submit", handleSubmit);
list.addEventListener("click", handleClick);

//! Ortak Kullanım Alanı
var map;
var notes = JSON.parse(localStorage.getItem("notes")) || [];
var coords = [];
var layerGroup = [];

navigator.geolocation.getCurrentPosition(
  loadMap,
  console.log("Kullanıcı kabul etmedi")
);
//* Haritaya tıklanınca çalışır
function onMapClick(e) {
  form.style.display = "flex";
  coords = [e.latlng.lat, e.latlng.lng];
  //   console.log(coords);
}
//* Kullanıcının konumuna göre ekrana haritayı getirme
function loadMap(e) {
  //   console.log(e);
  // Haritanın kurulumu
  map = new L.map("map").setView([e.coords.latitude, e.coords.longitude], 10);
  L.control;
  // Haritanın nasıl gözükeceğini belirler
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 3,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  // harita da ekrana basılacak imleçleçleri tutacağımız katman
  layerGroup = L.layerGroup().addTo(map);

  // localden gelen notları harita geldiğinde ekrana renderlama
  renderNoteList(notes);

  // Haritada bir tıklnam olduğunda çalışacak fonksiyon
  map.on("click", onMapClick);
}

function renderMarker(item) {
  // markerı oluşturur
  L.marker(item.coords, { icon: detecIcon(item.status) })
    // imleçlerin olduğu katmanı ekler
    .addTo(layerGroup)
    // üzerine tıklanınca açılacak popup yapısını ekleme
    .bindPopup(`${item.desc}`);
}

//* Formun gönderilme olayında çalışır
function handleSubmit(e) {
  e.preventDefault();
  console.log(e);

  const desc = e.target[0].value;
  if (!desc) return;
  const date = e.target[1].value;
  const status = e.target[2].value;
  // notes dizisine eleman ekleme
  notes.push({ id: new Date().getTime(), desc, date, status, coords });
  console.log(notes);
  // local storage güncelleme
  setStorage(notes);
  // renderNoteList fonksiyonuna notes dizsinie gönderdik
  renderNoteList(notes);
  // formu kapatma
  form.style.display = "none";
}
//* Ekrana notları basma
function renderNoteList(item) {
  // notlar alanını temizler
  list.innerHTML = "";
  // markerları temizle
  layerGroup.clearLayers();
  // her bir not için diziyi dönüp notları aktarma
  item.forEach((item) => {
    const listElement = document.createElement("li");
    // datasına sahip olduğu id'yi ekleme
    listElement.dataset.id = item.id;
    listElement;
    listElement.innerHTML = `
        <div>
            <p>${item.desc}</p>
            <p><span>Tarih:</span>${item.date}</p>
            <p><span>Durum:</span>${detecType(item.status)}</p>

            <i class="bi bi-x" id="delete"></i>
            <i class="bi bi-airplane-fill" id="fly"></i>
        </div>
    `;
    list.insertAdjacentElement("afterbegin", listElement);
    renderMarker(item);
  });
}
function handleClick(e) {
  // güncellenecek elemanın id'sini öğrenme
  const id = e.target.parentElement.parentElement.dataset.id;

  if (e.target.id === "delete") {
    console.log(notes);
    // id'sini bildiğimiz elemanı diziden kaldırma
    notes = notes.filter((note) => note.id != id);
    // local'i güncelle
    setStorage(notes);
    // ekranı güncelleme
    renderNoteList(notes);
  }
  if (e.target.id === "fly") {
    const note = notes.find((note) => note.id == id);
    console.log(note);
    map.flyTo(note.coords);
  }
}