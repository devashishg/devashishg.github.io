const arr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
const typer = document.getElementById('typeHere');
const letter = document.getElementById('letter');
const reset = document.getElementById('reset');
const result = document.getElementById('results');
const info = document.getElementById('info');
const HS = document.getElementById('best');
const cb = document.getElementById('shuffle');
let index = 0;
letter.innerHTML = arr[index];
const response = [];
let currentBestReg = Number(localStorage.getItem('HSR'));
let currentBestSuf = Number(localStorage.getItem('HSS'));
currentBestReg = Number.isNaN(currentBestReg) ? 0 : currentBestReg;
currentBestSuf = Number.isNaN(currentBestSuf) ? 0 : currentBestSuf;
if(currentBestReg > 0) {
    HS.innerHTML = `Best time ${currentBestReg}s`;
}

typer.addEventListener('input', (event) => {
    try {
        if(event.inputType.toUpperCase().match(/PASTE|DROP/g)) {
            resetAction();
            throw Error('<font color="red">Pasting/Dropping text is not fair 😞. We are resetting the game.</font   >');
        } else if (!!event.inputType.match('insert')) {
            if (event.data[event.data.length - 1].toUpperCase() === arr[index]) {
                index++;
                response.push(Date.now());
                info.innerHTML = `Last key-stroke from start: ${(response[response.length - 1] - response[0]) / 1000}s`
            }
            if (index < 26) {
                letter.innerHTML = arr[index];
            } else {
                const log = (response[25] - response[0]) / 1000;
                letter.innerHTML = `Your time: ${log}s`;
                typer.setAttribute('disabled', 'true');
                result.innerHTML = `<div class="title w-100">Final Results 🏆</div> ${getMeResults(response)}`;
                index = 0;
                info.innerHTML = '';
                if( (cb.checked && (log < currentBestSuf || currentBestSuf == 0)) ||
                    (!cb.checked && (log < currentBestReg || currentBestReg == 0))) {
                    localStorage.setItem(cb.checked ? 'HSS' : 'HSR',log);
                    currentBestSuf = cb.checked ? log : currentBestSuf;   
                    currentBestReg = cb.checked ? currentBestReg: log;
                    HS.innerHTML = cb.checked ? `Shuffled Best time ${log}s` :`Best time ${log}s`;
                }
            }
        }

    } catch (error) {
        info.innerHTML = error.message;
    }
});

typer.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        resetAction();
    }
});

cb.addEventListener('change', resetAction);
reset.addEventListener('click', resetAction);


function resetAction() {
    index = 0;
    if (cb.checked) {
        shuffle(arr);
        HS.innerHTML = currentBestSuf>0 ? `Shuffled Best time ${currentBestSuf}s` : '';
    } else {
        arr.sort();
        HS.innerHTML = currentBestReg>0 ? `Best time ${currentBestReg}s` : '';
    }
    typer.value = '';
    letter.innerHTML = arr[index];
    typer.removeAttribute('disabled');
    result.innerHTML = '';
    response.length = [];
    info.innerHTML = '';
}


function getMeResults(response) {
    const start = response[0];
    let result = '';
        response.forEach((element, ind) => {
            result += `<div class="element"><div class="key">${arr[ind]}</div> <div class="time"> ${(element - start === 0) ? 'Start' : (element - start) / 1000}s </div></div>`
        });
    response.length = 0;
    return result;
}

function shuffle(array) {
    var currIndex = array.length, rnd;
    while (0 !== currIndex) {
        rnd = Math.floor(Math.random() * currIndex);
        currIndex--;
        [array[currIndex], array[rnd]] = [
            array[rnd], array[currIndex]];
    }
}
