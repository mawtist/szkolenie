const API_URL = 'https://apichat.m89.pl/api/messages';
const dzwiekPowiadomienia = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

let poprzedniaIlosc = 0;
let interwalPolling; 


const ekranLogowania = document.getElementById('ekran-logowania');
const ekranCzatu = document.getElementById('ekran-czatu');
const inputNick = document.getElementById('input-nick');
const oknoWiadomosci = document.getElementById('okno-wiadomosci');
const inputSzukaj = document.getElementById('input-szukaj');


function sprawdzLogowanie() {
    const zapisanyNick = localStorage.getItem('shoutboxNick');
    
    if (zapisanyNick) {
        ekranLogowania.classList.add('ukryte');
        ekranCzatu.classList.remove('ukryte');
        document.getElementById('wybrany-nick').innerText = zapisanyNick;
        

        pobierzWiadomosci();
        interwalPolling = setInterval(pobierzWiadomosci, 3000);
    } else {
        ekranLogowania.classList.remove('ukryte');
        ekranCzatu.classList.add('ukryte');
        clearInterval(interwalPolling); 
    }
}

document.getElementById('btn-zaloguj').addEventListener('click', () => {
    if (inputNick.value.trim() !== '') {
        localStorage.setItem('shoutboxNick', inputNick.value);
        sprawdzLogowanie();
    }
});

document.getElementById('btn-wyloguj').addEventListener('click', () => {
    localStorage.removeItem('shoutboxNick');
    sprawdzLogowanie();
});


async function pobierzWiadomosci() {
    try {
        const response = await fetch(API_URL);
        const wiadomosci = await response.json();

        if (wiadomosci.length > poprzedniaIlosc && poprzedniaIlosc !== 0) {
            dzwiekPowiadomienia.play().catch(e => console.log("Przeglądarka zablokowała dźwięk"));
        }
        poprzedniaIlosc = wiadomosci.length;

        rysujCzat(wiadomosci);

    } catch (error) {
        console.error('Błąd podczas pobierania:', error);
    }
}

function rysujCzat(daneZSerwera) {
    const filtr = inputSzukaj.value.toLowerCase();
    
    const przefiltrowane = daneZSerwera.filter(msg => {
        return msg.text.toLowerCase().includes(filtr);
    });

    oknoWiadomosci.innerHTML = '';

    przefiltrowane.forEach(msg => {
        const data = new Date(msg.timestamp);
        const ladnyCzas = data.toLocaleTimeString('pl-PL');

        const div = document.createElement('div');
        div.className = 'msg';
        div.innerHTML = `
            <span class="msg-time">[${ladnyCzas}]</span> 
            <span class="msg-author">${msg.author}:</span> 
            ${msg.text}
        `;
        oknoWiadomosci.appendChild(div);
    });

    oknoWiadomosci.scrollTop = oknoWiadomosci.scrollHeight;
}

document.getElementById('formularz-wiadomosci').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const wejscieWiadomosci = document.getElementById('input-wiadomosc');
    const wpisanyTekst = wejscieWiadomosci.value;

    const paczkaDanych = {
        author: localStorage.getItem('shoutboxNick'),
        text: wpisanyTekst
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paczkaDanych)
        });

        wejscieWiadomosci.value = '';

        pobierzWiadomosci();

    } catch (error) {
        console.error('Nie udało się wysłać:', error);
    }
});

inputSzukaj.addEventListener('input', pobierzWiadomosci);

sprawdzLogowanie();