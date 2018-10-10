Check out the drawing pad at [https://martyav.github.io/drawing-pad/](https://martyav.github.io/drawing-pad/)

# To-Do

* ~~Add drop down menus for cap and join~~
    * ~~In progress on dev branch -- but instead of cap and join, which don't really make sense in an art context, we're just doing cap and we're calling it nib, like a pen's point~~
* ~~Make this into a github page~~
* ~~Wire up event handlers correctly~~
* ~~Figure out how all the variable switching will be happening~~
* Debug debug debug:
    * ~~LastX & lastY are behaving oddly...strokes are often drawn far to right of cursor~~
    * Solution to above: Canvas was being stretched via CSS to fit space on page; you need to set the width and height to offsetWidth & offsetHeight with Javascript to account for the change in size when styling kicks in
 * Responsiveness -- the menu & canvas size are inappropriate for small screens
 * ~~Save button - WIP~~
 * ~~Undo button - WIP, related to save functionality (see [https://www.codicode.com/art/undo_and_redo_to_the_html5_canvas.aspx](https://www.codicode.com/art/undo_and_redo_to_the_html5_canvas.aspx))~~ (Maybe add multi-undo?)
 * Touch events
 * Keyboard short cuts?
 * Brushes?
 * Gamify
     * ~~Add drawing prompts~~
     * ~~Add checkboxes for category: Fun/Serious~~
     * Add optional timer
