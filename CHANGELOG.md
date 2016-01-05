## Unversioned
### Changed
- \#2651 - Improve ui scale error messages

## 0.14.1 - 2015-12-17
### Added
- \#2772 - URI fields should be links
- \#2775 - Syntax highlighting for JSON fragments in configuration
- \#2809 - Health filter in sidebar
- \#2824 - Add UI option for Docker forcePullImage
- \#2721 - Provide log download links for easier task debugging

### Changed
- \#2764 - Make health status bar wider

### Fixed
- \#2755 - Memory leak in Marathon UI
- \#2845 - Misleading error feedback in app creation modal on port conflict
- \#2812 - Cannot change configuration of Marathon app after deployment
- \#2821 - Tooltip content update issue

## 0.14.0 - 2015-12-07
### Added
- Prefill ID field with group structure in app creation modal
- Show an animated loading bar on app deployment status
- A detailed breakdown of the health status of each instance is shown on the
  app detail page.
- Show all labels inside a dropdown menu revealed on click
- Show application count on application status filters
- \#2657 - Tooltip for health bar in App Collection View
- \#2659 - Show the full ID path under the base ID
- \#2664 - Adapt Filter Behavior to new Global Search
- \#2704 - Change format of groupId under app name
- \#2705 - Link groupId in search results to individual groups
- \#2729 - Expose IP-per-container app definition in App Details page
- \#2727 - Integrate IP-Per-Container ipAddresses into task detail view
- \#2714 - Global ellipsis in breadcrumbs
- \#2785 - Prompt support for number input type
- \#2771 - Open task links in a new tab

### Changed
- Adjust the task list column order
- Use colored labels instead of dots for task health
- \#2646 - Consolidate Actions Menu in App Details View
- \#2660 - Adapt Search box in App Collection View
- \#2662 - Change Header When Applying Filter in App Collection View
- \#2663 - Adapt filter count, reflect current result set
- \#2702 - Show proper info on app creation auth error
- \#2529 - The Health checks close button (x) is misleading
- \#2566 - Port mappings do make sense when container is in net=host mode
- \#2047 - Tasks/Instances column rewording
- \#2715 - Deployment loading bar should have new style

### Fixed
- \#2720 - Disabled button has wrong colour
- \#2647 - Application cmd override causes application to restart repeatedly

## 0.13.6 - 2015-11-25
### Fixed
- \#2719 - Show correct button label when creating inside group

### Changed
- \#2684 - Running instances are confusing

## 0.13.5 - 2015-11-24
### Fixed
- \#2699 - App list health bar update/render issue

## 0.13.4 - 2015-11-18
### Fixed
- \#2687 - Show error dialog on kill task error
- \#2626 - Status icons are rendered blotted
- \#2627 - Tasks health column shows different health status
- \#2634 - UI does not update/show the status correctly
- \#1780 - When app is locked by deployment, deleting tasks via the UI does
nothing
- \#2615 - Keep input focus position when updating the Filter bar

## 0.13.3 - 2015-11-10
### Changed
- Introduced a maximum width for labels in the app list.

### Fixed
- \#2593 - Very long labels expand horizontal scrollbar in app list

## 0.13.2 - 2015-11-09
### Fixed
- \#2565 - Change app icon title from "Basic" to "Application"
- \#2568 - UI: App state incorrectly shown
- \#2574 - Label Filter: Filter Label Box is not cleared
- \#2585 - Sorting by CPU causes row column to expand
- \#2586 - Sorting by Status shifts heading text

## 0.13.1 - 2015-11-04
It was necessary to increase the version number in order to resolve some issues
with our release infrastructure. No other changes were made since 0.13.0.

## 0.13.0 - 2015-11-04
### Added
- A filter sidebar is introduced with the ability to combine filters
  or clear them.
  * Filter by application status
  * Filter by labels
- The application list now handles groups
- Groups are shown at the top of the application list
- App names are now shown in the app page and app list instead of app IDs
- The complete appId is available in the configuration tab
- Application labels are shown by the application name in the application list
- Endpoints are shown in the tasks detail page
- A group route is introduced to display the contents of a group in the
  application list
- \#2031 - Make keyboard shortcuts discoverable
- \#2434 - Create keyboard shortcut for focusing on the search field
- \#2500 - Add a link to API-Doc in the UI

### Changed
This version introduces major changes to the layout. In particular, the
application list has been redesigned.

- The memory column shows the total amount of memory used by an application
  with a human readable unit
- The application status is displayed with a colored icon
- The instances and health columns have been combined into one
  called "Running Instances"
- The control buttons on the application page are shown on the left and are
  redesigned
- Breadcrumbs show the groups structure
- Breadcrumbs will be folded to "..." when there isn't room to render them
  in full

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
