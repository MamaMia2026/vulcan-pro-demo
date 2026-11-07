const WHATSAPP_NUMBER = '40700000000'; // format internațional, fără „+” (exemplu)

/* Vulcan Pro – machetă demo. TOATE prețurile, duratele și datele de aici sunt EXEMPLE.
   Pe site-ul real se înlocuiesc cu tarifele atelierului. */

const TELEFON = { afisat: '0700 000 000', link: '+40700000000' }; // exemplu

// Programul – singura sursă pentru „Deschis/Închis”, tabelul de program și sloturile de programare.
// cheie = ziua săptămânii (0 = duminică … 6 = sâmbătă); null = închis
const PROGRAM = {
  1: ['08:00', '20:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '20:00'],
  4: ['08:00', '20:00'],
  5: ['08:00', '20:00'],
  6: ['08:00', '20:00'],
  0: null
};
const SLOT_MIN = 30;       // sloturile încep din 30 în 30 de minute
const ZILE_AFISATE = 7;    // câte zile apar în programare
const MARJA_AZI_MIN = 15;  // azi, un slot se poate alege doar dacă începe peste cel puțin 15 min

// SUV / van: +20% la schimb și echilibrare, +10 min la durată
const SUV_PROCENT = 20;
const SUV_MIN_EXTRA = 10;

// Prețuri pe diametru (autoturism, 4 roți, lei cu TVA) – EXEMPLE
// schimb = montaj + demontaj + echilibrare 4 roți; min = durata schimbului
// echilibrare = doar echilibrare 4 roți; minEchil = durata ei
// hotel = depozitare un sezon + schimbul de sezon inclus (anvelope fără jante)
// faraLevier = montaj cu dispozitiv fără levier (jante mari / profil jos)
const TARIFE = [
  { r: 13, schimb: 120, min: 30, echilibrare: 60,  minEchil: 20, hotel: 200, faraLevier: false, exemplu: true },
  { r: 14, schimb: 130, min: 30, echilibrare: 65,  minEchil: 20, hotel: 200, faraLevier: false, exemplu: true },
  { r: 15, schimb: 145, min: 35, echilibrare: 70,  minEchil: 20, hotel: 220, faraLevier: false, exemplu: true },
  { r: 16, schimb: 160, min: 40, echilibrare: 80,  minEchil: 25, hotel: 230, faraLevier: false, exemplu: true },
  { r: 17, schimb: 180, min: 45, echilibrare: 90,  minEchil: 25, hotel: 250, faraLevier: false, exemplu: true },
  { r: 18, schimb: 200, min: 50, echilibrare: 100, minEchil: 30, hotel: 270, faraLevier: false, exemplu: true },
  { r: 19, schimb: 230, min: 55, echilibrare: 115, minEchil: 30, hotel: 300, faraLevier: true,  exemplu: true },
  { r: 20, schimb: 260, min: 60, echilibrare: 130, minEchil: 35, hotel: 330, faraLevier: true,  exemplu: true },
  { r: 21, schimb: 300, min: 70, echilibrare: 150, minEchil: 40, hotel: 360, faraLevier: true,  exemplu: true },
  { r: 22, schimb: 340, min: 75, echilibrare: 170, minEchil: 40, hotel: 390, faraLevier: true,  exemplu: true }
];

// Serviciile din programare. coloana/minute = de unde se iau prețul și durata din TARIFE.
const SERVICII = {
  schimb:      { nume: 'Schimb anvelope',   sub: '4 roți, cu echilibrare',     coloana: 'schimb',      minute: 'min',      suv: true },
  echilibrare: { nume: 'Echilibrare',       sub: '4 roți, computerizat',       coloana: 'echilibrare', minute: 'minEchil', suv: true },
  pana:        { nume: 'Reparație pană',    sub: 'o roată, cu ciupercă',       pret: 50, min: 30,                          suv: false },
  hotel:       { nume: 'Hotel de anvelope', sub: 'schimb + depozitare sezon',  coloana: 'hotel',       minute: 'min',      suv: false }
};

// Extra-uri în programare – EXEMPLE
const EXTRA = [
  { id: 'valve',    nume: 'Valve noi ×4',          pretBuc: 15, buc: 4, min: 5 },
  { id: 'tpms',     nume: 'Resetare senzori TPMS', pret: 40,  min: 10 },
  { id: 'curatare', nume: 'Curățare jante',        pret: 40,  min: 15 },
  { id: 'azot',     nume: 'Umflare cu azot',       pret: 0,   min: 5 }
];

// Hotel de anvelope – EXEMPLE
const HOTEL = {
  cuJanteExtra: 30,  // lei / sezon în plus pentru roți complete (cu jante)
  reducereAnProcent: 10 // reducere la plata pe un an (2 sezoane) deodată
};

// Dimensiuni pentru asistentul „Ce dimensiune am?” și formularul hotelului
const ANVELOPE = {
  latimi: [155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285],
  profile: [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80],
  implicit: { latime: 205, profil: 55, r: 16 }
};
