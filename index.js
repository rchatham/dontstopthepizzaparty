function navigateForInput(value) {
  if (value.toLowerCase() === "home") {
    window.location = "/";
  }
  if (value.toLowerCase() === "blog") {
    window.location = "/blog/";
  }
  if (value === "Champagne") {
    window.location = "/guest-list.html";
  }
  if (value.toLowerCase() === "photos") {
    window.location = "/insta/";
  }
  if (value.toLowerCase() === "pizza squad") {
    var win = window.open("https://www.facebook.com/groups/dontstopthepizzaparty/", "_blank");
    if (win) {
      //Browser has allowed it to be opened
      win.focus();
    } else {
      //Browser has blocked it
      alert('Please allow popups for this website');
    }
  }
  if (value.toLowerCase() === "find pizza") {
    var win = window.open("https://www.google.com/maps/search/pizza/", "_blank");
    if (win) {
      //Browser has allowed it to be opened
      win.focus();
    } else {
      //Browser has blocked it
      alert('Please allow popups for this website');
    }
  }
  if (value.toLowerCase() === "buy pizza") {
    var win = window.open("https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=pizza", "_blank");
    if (win) {
      //Browser has allowed it to be opened
      win.focus();
    } else {
      //Browser has blocked it
      alert('Please allow popups for this website');
    }
  }
  if ((value.toLowerCase() === "play pizza")||(value.toLowerCase() === "deliver pizza")) {
    var win = window.open("http://www.adultswim.com/games/web/pizza-city", "_blank");
    if (win) {
      //Browser has allowed it to be opened
      win.focus();
    } else {
      //Browser has blocked it
      alert('Please allow popups for this website');
    }
  }
  if (value.toLowerCase() === "pizza clothing") {
    var win = window.open("https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=pizza+clothes", "_blank");
    if (win) {
      //Browser has allowed it to be opened
      win.focus();
    } else {
      //Browser has blocked it
      alert('Please allow popups for this website');
    }
  }
  if (value.toLowerCase() === "wear pizza") {
    var win = window.open("https://www.buzzfeed.com/erinchack/ways-to-wear-pizza-with-pride?utm_term=.doQNKYg2o#.ynkZEbKXO", "_blank");
    if (win) {
      //Browser has allowed it to be opened
      win.focus();
    } else {
      //Browser has blocked it
      alert('Please allow popups for this website');
    }
  }
  if (value.toLowerCase() === "pizza shock") {
    var win = window.open("http://weartv.com/news/local/man-caught-doing-drugs-behind-navarre-pizza-place", "_blank");
    if (win) {
      //Browser has allowed it to be opened
      win.focus();
    } else {
      //Browser has blocked it
      alert('Please allow popups for this website');
    }
  }
}