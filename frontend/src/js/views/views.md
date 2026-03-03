# Views Interface

A class using the **Views** interface represents a possible HTML view. 

## Required methods/fields

- **constructor(boolean)** → self
    - Uses fetch to get the corresponding HTML file, and store it in a constant.
    - If the boolean parameter is true, also call setPage once it is done loading - this should only be true the first time a page is loaded. 
- **content** → `string`
    - Returns a string that is empty, but gets set in the constructor. This contains the entire body of the HTML file.
- **setPage()** → `void`
    - Sets the innerHTML of the element with the id `mainDiv` to the content in `content`, and runs any initializing JavaScript code.
- **ready** → `boolean`
    - Returns a boolean that is false if content is empty, but gets set to true once content gets filled. 
- **reset()** → `void`
    - Resets any variables that need to be reset before unloading the page to prevent errors. For most views, this will not be filled in.

## Notes
- To add new views, first create view.html in the html folder. 
    - Start by creating a valid HTML file that looks how you want it to look, then remove the head and the body tags. 
    - Ensure that any JS is in external files. 
- To set up a new view, afterwards, create your view.js file, implementing this interface, then change viewManager.js.
    - In the object views, add a value for your view.
    - In initViews, create a new instance of your specified view in each switch case, and add a new switch case for your new view.
    - In setView(view), add a condition for if view is equal to your new view, then call the setPage method.
    - Also add a condition for if currentView is equal to your new view, then call the reset method.  
    - In the class ViewStorage, add the view to it. 
- To switch between views, call setView(view), passing in the view you want to switch to. 