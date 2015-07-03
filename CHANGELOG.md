## 0.9.1 - 2015-07-03
### Changed
- The Broccoli build system was replaced by the Gulp build system
- Complete replacement of the Backbone models with a Flux structure.
  The components retrieve their data from stores via events on place.
  Actions now fetch data from the Marathon API through an replaceable
  Ajax-wrapper.

### Fixed
- Allow app creation with 0 instances
- Disfunctional refresh button in app configuration

## 0.9.0 - 2015-06-17
### Changed
- Marathon UI lives now in it's own Git repository
- Update to React 0.13

### Added
- Testing via Mocha
