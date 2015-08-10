## Unversioned
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

### Changed
- #124 - Expose all /v2 App attributes in UI
  * The optional settings inside the new application modal dialog are now
    grouped together
  * It is now possible to specify Docker container settings
- \#1673 - Prerequisites to deploy a webjar via TeamCity
  * In a production environment, the API will be requested by ../v2/ instead of
    ./v2/, because the UI is now served in an "/ui/"-path via Marathon.
    Also the dist-folder isn't needed in the repository anymore, the files will
    be generated on-the-fly.

### Fixed
- #548 - UI showing empty list after scaling when on page > 1
  * The task list shows the last available page
    if tasks count decreases after scaling.
- \#1872 - Kill & Scale should be available for more than one task

## 0.10.0 - 2015-07-10
### Added
- #1754 - UI: Allow administratively zeroing / resetting the taskLaunchDelay
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
- #1660 - Allow app creation with 0 instances
- #1236 - Disfunctional refresh button in app configuration

## 0.9.0 - 2015-06-17
### Changed
- Marathon UI lives now in it's own Git repository
- Update to React 0.13

### Added
- Testing via Mocha
