function search() {
	var term = document.getElementById(“query”).value;
	term = term.toLowerCase();
	window.location.href = "http://jliu99.github.io/search.html?query=" + term;
}