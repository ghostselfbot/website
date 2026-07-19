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

document.addEventListener("DOMContentLoaded", function () {
    var platforms = {
        windows: {
            label: "Windows",
            description: "Ghost requires Windows 10 or later.",
            href: "https://github.com/ghostselfbot/ghost/releases/latest/download/Ghost-Windows.zip",
            button: "Download for Windows"
        },
        mac: {
            label: "macOS",
            description: "Ghost requires macOS Tahoe 26 or later.",
            href: "https://github.com/ghostselfbot/ghost/releases/latest/download/Ghost-Mac.zip",
            button: "Download for macOS"
        },
        linux: {
            label: "Linux",
            description: "Run the installer below to install Ghost on Linux.",
            href: "#linux-install",
            button: "View Linux installer"
        }
    };
    var userAgent = navigator.userAgent.toLowerCase();
    var detectedPlatform = userAgent.includes("win") ? "windows" : userAgent.includes("mac") ? "mac" : "linux";
    var optionButtons = document.querySelectorAll(".os-option[data-os]");
    // var detectedOs = document.getElementById("detected-os");
    var description = document.getElementById("download-description");
    var releaseVersion = document.getElementById("release-version");
    var downloadButton = document.getElementById("detected-download");
    var intro = document.getElementById("download-intro");
    var linuxInstall = document.getElementById("linux-install");
    var sourceToggle = document.getElementById("source-toggle");
    var sourceInstall = document.getElementById("source-install");
    var linuxInstallerCommand = "curl -sSL https://www.ghostt.cc/assets/unix-install.sh | bash";
    var selectedPlatform = detectedPlatform;

    function setSourceVisibility(isVisible) {
        sourceInstall.hidden = !isVisible;
        sourceToggle.classList.toggle("is-selected", isVisible);
        sourceToggle.setAttribute("aria-expanded", String(isVisible));
    }

    function copyInstallerCommand() {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(linuxInstallerCommand);
        }

        var temporaryInput = document.createElement("textarea");
        temporaryInput.value = linuxInstallerCommand;
        temporaryInput.setAttribute("readonly", "");
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        var copied = document.execCommand("copy");
        document.body.removeChild(temporaryInput);
        return copied ? Promise.resolve() : Promise.reject();
    }

    function loadLatestRelease() {
        fetch("https://api.github.com/repos/ghostselfbot/ghost/releases/latest", {
            headers: { "Accept": "application/vnd.github+json" }
        }).then(function (response) {
            if (!response.ok) {
                throw new Error("Latest release request failed");
            }
            return response.json();
        }).then(function (release) {
            releaseVersion.textContent = release.tag_name;
        }).catch(function () {
            releaseVersion.textContent = "Latest release";
        });
    }

    function selectPlatform(platform) {
        var currentPlatform = platforms[platform];
        selectedPlatform = platform;
        // detectedOs.textContent = currentPlatform.label;
        description.textContent = currentPlatform.description;
        downloadButton.href = currentPlatform.href;
        downloadButton.textContent = platform === "linux" ? "Copy Linux installer" : currentPlatform.button;
        downloadButton.toggleAttribute("download", platform !== "linux");
        linuxInstall.hidden = platform !== "linux";
        setSourceVisibility(false);

        optionButtons.forEach(function (optionButton) {
            var isSelected = optionButton.dataset.os === platform;
            optionButton.classList.toggle("is-selected", isSelected);
            optionButton.setAttribute("aria-pressed", String(isSelected));
        });
    }

    sourceToggle.addEventListener("click", function () {
        var isExpanded = sourceToggle.getAttribute("aria-expanded") === "true";
        setSourceVisibility(!isExpanded);
    });

    downloadButton.addEventListener("click", function (event) {
        if (selectedPlatform === "linux") {
            event.preventDefault();
            copyInstallerCommand().then(function () {
                downloadButton.textContent = "Copied installer command";
                window.setTimeout(function () {
                    if (selectedPlatform === "linux") {
                        downloadButton.textContent = "Copy Linux installer";
                    }
                }, 3000);
            });
        }
    });

    intro.textContent = "We selected a download based on your device. You can switch platforms below.";
    optionButtons.forEach(function (optionButton) {
        optionButton.addEventListener("click", function () {
            selectPlatform(optionButton.dataset.os);
        });
    });

    var consoleImage = document.querySelector("#console-img-container > img");
    var desktopViewport = window.matchMedia("(min-width: 769px)");

    function updateConsoleTilt() {
        if (!consoleImage || !desktopViewport.matches) {
            return;
        }

        var scrollProgress = Math.min(window.scrollY / 600, 1);
        var tilt = 10 * (1 - scrollProgress);
        consoleImage.style.transform = "perspective(75em) rotateX(" + tilt + "deg)";
    }

    window.addEventListener("scroll", updateConsoleTilt, { passive: true });
    window.addEventListener("resize", updateConsoleTilt);
    updateConsoleTilt();

    var surveillancePreview = document.getElementById("spypet-img-container");
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    function resetSurveillancePreview() {
        surveillancePreview.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
        surveillancePreview.classList.remove("is-tilting");
    }

    if (surveillancePreview && finePointer.matches) {
        surveillancePreview.addEventListener("pointermove", function (event) {
            var bounds = surveillancePreview.getBoundingClientRect();
            var horizontalPosition = (event.clientX - bounds.left) / bounds.width - 0.5;
            var verticalPosition = (event.clientY - bounds.top) / bounds.height - 0.5;
            var rotateY = horizontalPosition * 8;
            var rotateX = verticalPosition * -8;

            surveillancePreview.classList.add("is-tilting");
            surveillancePreview.style.transform = "perspective(1000px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-4px)";
        });
        surveillancePreview.addEventListener("pointerleave", resetSurveillancePreview);
    }
    loadLatestRelease();
    selectPlatform(detectedPlatform);
});