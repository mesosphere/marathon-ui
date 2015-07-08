## Unversioned
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
