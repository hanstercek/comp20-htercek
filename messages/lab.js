// Your JavaScript goes here...
function parse() {
	request = new XMLHttpRequest();

	request.open("GET", "https://messagehub.herokuapp.com/messages.json", true);

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			elements = JSON.parse(request.responseText);
			output = "";
			for (i = 0; i < elements.length; i++) {
				output += "<div class='newMessage'><p>" + elements[i]["content"] + " by <span class='author'>" + elements[i].username + "</span></p></div>";
			}
			document.getElementById("messages").innerHTML = output;
		}
	};

	request.send();
}