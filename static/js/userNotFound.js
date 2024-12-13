

const urlParams = new URLSearchParams(window.location.search);
const error = urlParams.get('error');
if (error) {
    // document.write(`<p style="color: red;">${error}</p>`);
    document.querySelector('.container').innerHTML += `<p style="color: red;">Incorrect User Name Or Password</p>`
}

