function observeInput(value) {
    if ((value === "home")||(value === "Home")) {
      window.location = "./index.html";
    }
    if (value === "Pizza Squad") {
      window.location = "./guest-list.html";
    }
    if ((value === "Find pizza")||(value === "find pizza")||(value === "Find Pizza")) {
      var win = window.open("https://www.google.com/maps/search/pizza/", "_blank");
      if (win) {
        //Browser has allowed it to be opened
        win.focus();
      } else {
        //Browser has blocked it
        alert('Please allow popups for this website');
      }
    }
}