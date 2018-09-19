Check out the drawing pad at [https://martyav.github.io/drawing-pad/](https://martyav.github.io/drawing-pad/)

# To-Do

* ~~[Add drop down menus for cap and join](https://www.w3schools.com/howto/howto_js_dropdown.asp) 
    * In progress on dev branch -- but instead of cap and join, which don't really make sense in an art context, we're just doing cap and we're calling it nib, like a pen's point~~
* ~~Make this into a github page~~
* ~~Wire up event handlers correctly~~
* ~~Figure out how all the variable switching will be happening~~
* Debug debug debug:
    * ~~LastX & lastY are behaving oddly...strokes are often drawn far to right of cursor~~
    * Solution to above: Canvas was being stretched via CSS to fit space on page; you need to set the width and height to offsetWidth & offsetHeight with Javascript to account for the change in size when styling kicks in
 * Save button
 * Brushes?
 * Gamify
     * Add drawing prompts
     * Add optional timer
