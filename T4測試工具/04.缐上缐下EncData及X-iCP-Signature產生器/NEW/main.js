//Page controller
function change_page(page, type) {

    var all_page = document.getElementsByClassName("function_container")


    for (var i = 0; i < all_page.length; i++) {
        all_page[i].style.display = "none";
    }

    document.getElementById("page" + page).style.display = "";

    switch (type) {
        case 0:
            document.getElementById("API_list").style.display = "none"
            break;
        case 1:
            if (document.getElementById("API_list").style.display = "none") {
                document.getElementById("API_list").style.display = ""
            }
            break;
    }
}

//Show API list
function show_list(e) {
    if (e.parentNode.getElementsByTagName("ul")[0].style.display == "") {
        e.parentNode.getElementsByTagName("ul")[0].style.display = "none";
    }
    else {
        e.parentNode.getElementsByTagName("ul")[0].style.display = "";
    }
}

//Copy example to clipboard
function copy_function(e) {
    var copy_text = e.parentNode.parentNode.getElementsByTagName("tr")[1].innerText.replace(/[\n\r]/g, '');;
    const textarea = document.createElement("textarea");

    textarea.value = copy_text;
    document.body.appendChild(textarea)
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea)
}