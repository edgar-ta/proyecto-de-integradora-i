function copyOnClick(querySelector, callback = (e) => {}) {
    const usernameHeader = document.querySelector(querySelector);
    usernameHeader.addEventListener("mouseenter", () => usernameHeader.setAttribute("data-copied", "false"));
    usernameHeader.addEventListener("mousedown", (e) => {
        callback(e);
        usernameHeader.setAttribute("data-copied", "true");
    });
}
