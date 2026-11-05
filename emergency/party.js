/* The next party, whispered at the end of the game. Leave it null and the game
   ends as usual. Lines show in the game's text box: keep each one to 24
   characters or fewer. Add a url and the end menu gains a "THE NEXT PARTY" option.

   window.NEXT_PARTY = {
     lines: ["SAT DEC 13. 10PM.", "SECRET LOCATION, SF.", "PASSWORD: EXTRA CHEESE"],
     url: "https://www.eventbrite.com/e/..."
   };
*/
window.NEXT_PARTY = null;

/* The BOGO easter egg. Look at the pizza poster in the Techno's back-right
   corner and a buy-one-get-one ticket for the next Pizza+Techno is tucked
   behind it. The game shows the code with a Copy button and a ticket link.

   code: a REAL promo code. Create the same code on the ticket page first, or
         players get a code that does nothing. Letters, digits and - only.
   url:  the ticket page. The game adds ?discount=CODE so Eventbrite applies the
         code at checkout. Leave it null to fall back on NEXT_PARTY.url; with
         neither, the ticket says tickets drop at pizzaandtechno.com.
   Set window.BOGO = null to switch the egg off. */
window.BOGO = { code: "BOGOSLICE", url: null };
