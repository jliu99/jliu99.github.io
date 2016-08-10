document.getElementById("query").onkeypress = function (e) {
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13') {
        // Enter pressed
        search();
    }
}

function search() {
    var term = document.getElementById("query").value;
    alert(term);
    if (term != null || term != "" || term.replace(" ", "") != "") {
        term = term.toLowerCase();
        term = term.replace(" ", "+");
        window.location.href = "http://jliu99.github.io/search.html?query=" + term;
    }
}