## Unversioned
### Added
- \#2031 - Make keyboard shortcuts discoverable
- \#2434 - Create keyboard shortcut for focusing on the search field

### Fixed
- \#2421 - Error: Invalid calling object (Win 8 IE10, Win 7 IE11)
- \#2422 - Handle apps error response attribute on HTTP 422
- \#2459 - Framework Id not visible in the UI

## 0.12.0 - 2015-10-02
### Added
- \#2244 - Ability to scale an application forcefully if there is a deployment
  running
- \#1055 - Add app labels to UI
  * Ability of modifing the app labels in the application modal form.
- \#2283 - Expose the application labels field in the configuration tab
- \#2284 - Expose the application dependencies field in the configuration tab
- \#2263 - UI doesn't expose roles
- \#2194 - Handle Auth Errors in UI
- \#2309 - Accepted resource roles schould be setable in the application form
- \#2127 - Add optional field for "user" in app definition
- \#2135 - Reflect application list filters in the URL
- \#2131 - Create a health checks panel in the application
  creation/edit modal dialog
- \#2298 - Implement consistent behaviour on 409 (Conflict) to force deployments

### Changed
- \#2105 - Refactor the application create/edit modal data handling
  * Separate the data-layer from the view-layer
  * Add form to model transformers
  * Add model to form transformers
  * Add proper per-field validation
  * Add support for server-side validation errors on individual fields
- \#2248 - Docker: port mappings do not make sense when host network is used
- \#2223 - Display life time duration as other durations in UI

### Fixed
- \#2157 - Row is off-centre if upper row is empty in lists
- \#2266 - Link "Mesos details" is broken
- \#1985 - Docker container settings dialog needs better error handling
- \#2262 - Better error handling on application configuration change/creation
- \#2270 - Overlapping text in Deployment view
- \#2216 - Do not show (x) in keyword search input until user begins typing

## 0.11.2 - 2015-10-12
### Fixed
- \#2338 - Parameters in the Docker container settings are not taken into
  account
- \#2398 - Blank docker image is created in app modal
- \#2402 - Runtime privilege checkbox does not work

## 0.11.1 - 2015-09-28
### Fixed
- \#2252 - Wrong task number in Debug Tab

## 0.11.0 - 2015-09-02
### Added
- \#1204 - Please add a search bar to the applications overview to filter the
  list of applications
- \#1137 - Add tooltip on hover to progress bars
  * A tooltip that displays the individual health statuses is now shown when
    the mouse is over the progress bars in the apps overview page.
- \#1864 - Add a link to the app detail page from the deployments tab
- \#1756 - Create a "Not found page"
- \#878 - Jump to Mesos sandbox from UI
  * You can go directly to the Mesos tasks sandbox from the tasks detail page.
- \#968 - Expose a way to identify "fragile" marathon apps in the web UI
  * If there is a lastTaskFailure this information will be shown in a tab
    called "Last task failure" on the app page.
- \#1937 - Display version string also in local time
- \#1058 - Add sorting to the health column in the app list
- \#1993 - Show Marathon UI version in about modal
  * The Marathon UI version will be shown on mouse hovering
    above the API version field. Second way is pressing "g v" on the keyboard.
- \#808 - Make app configuration fields editable
  * A selected application version can now be edited
    by pressing on the "Edit these settings"-button.
- \#124 - Expose environment variables in app modal dialog
- \#2010 - Show task life time and states in debug tab
- \#2012 - Show summary about the most recent configuration change
- \#2133 - Display health checks settings in the application configuration tab

### Changed
- \#124 - Expose all /v2 App attributes in UI
  * The optional settings inside the new application modal dialog are now
    grouped together
  * It is now possible to specify Docker container settings
- \#1673 - Prerequisites to deploy a webjar via TeamCity
  * In a production environment, the API will be requested by ../v2/ instead of
    ./v2/, because the UI is now served in an "/ui/"-path via Marathon.
    Also the dist-folder isn't needed in the repository anymore, the files will
    be generated on-the-fly.
- \#1251 - Show total resource usage in app list
- \#2039 - Updated app config edit button styles
- \#2071 - Replace native alert, prompt and confirm with custom modals
- \#2116 - Adjust refresh button style

### Fixed
- \#548 - UI showing empty list after scaling when on page > 1
  * The task list shows the last available page
    if tasks count decreases after scaling.
- \#1872 - Kill & Scale should be available for more than one task
- \#1960 - Task detail error message doesn't show up on non existent task
- \#1989 - HealthBar isn't working correctly on non existing health data
- \#2014 - Avoid concurrent http requests on same endpoint
- \#1996 - Duplicable fields in app creation modal can send null values
- \#2030 - Shortcut for app creation no longer works
- \#2062 - Resetting app delay can block all network requests in Firefox
- \#2123 - Health check information isn't shown on task in task list
           and task detail

## 0.10.0 - 2015-07-10
### Added
- \#1754 - UI: Allow administratively zeroing / resetting the taskLaunchDelay
  * The App list now displays two additional possible statuses: "Delayed" and
    "Waiting". The "Delayed" status also displays a tooltip showing
    the remaining time until the next launch attempt.
  * The App page now allows the user to reset the task launch delay for a
    "Delayed" app, thus forcing a new immediate launch attempt.

### Changed
- The Backbone router was replaced by the react-router in order to remove the
  jQuery and Backbone dependency completely.
  Routes have changed to include a leading slash, e.g.:
  ```#apps``` is now reachable under ```#/apps```.
  Modal dialogs are now part of the URL via query strings,
  e.g. ```#/apps?modal=about```, so the underlying page is not lost on refresh.

### Removed
- The static name field in the about/info modal got removed. It's reflected by
  the framework name field.

## 0.9.1 - 2015-07-03
### Changed
- The Broccoli build system was replaced by the Gulp build system
- Complete replacement of the Backbone models with a Flux structure.
  The components retrieve their data from stores via events on place.
  Actions now fetch data from the Marathon API through an replaceable
  Ajax-wrapper.

### Fixed
- \#1660 - Allow app creation with 0 instances
- \#1236 - Disfunctional refresh button in app configuration

## 0.9.0 - 2015-06-17
### Changed
- Marathon UI lives now in it's own Git repository
- Update to React 0.13

### Added
- Testing via Mocha
