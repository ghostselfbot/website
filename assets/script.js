function aboutReadMore() {
    var moreText = document.getElementById("about-more");
    var btnText = document.getElementById("about-read-more");

    if (moreText.style.display === "none") {
        moreText.style.display = "inline";
        btnText.innerHTML = "Read less";
    } else {
        moreText.style.display = "none";
        btnText.innerHTML = "Read more";
    }
}