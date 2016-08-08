function search() {
    alert("Debugging");
	var term = document.getElementById("query").value;
	term = term.toLowerCase();
    term = term.replace(" ", "+");
	window.location.href = "http://jliu99.github.io/search.html?query=" + term;
}