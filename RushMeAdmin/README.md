# RushMeAdmin
RushMeAdmin is the administrative portal that will allow different entities access to modify events.

## Installation Instructions
To install RushMeAdmin, first clone this repository onto your machine and use `npm install` within the directory. To then run the server use `npm run`.

### Overall Flow
Controllers go into app/controllers as a controller of the "RushMeAdminControllers" angular module. Currently for development you must also add the controller javascript to the bottom of the index.html. (See the start controller for reference)
The HTML for new pages go into the the partials folder in the views directory.
The server logic is inside of the server.js file and contains the code to serve the content and should hold any API endpoints.
