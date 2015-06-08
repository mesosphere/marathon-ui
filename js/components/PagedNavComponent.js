/** @jsx React.DOM */

var React = require("react/addons");

var PagedNavComponent = React.createClass({
  displayName: "PagedNavComponent",

  propTypes: {
    className: React.PropTypes.string,
    currentPage: React.PropTypes.number.isRequired,
    onPageChange: React.PropTypes.func.isRequired,
    itemsPerPage: React.PropTypes.number,
    noItems: React.PropTypes.number.isRequired,
    noVisiblePages: React.PropTypes.number,
    useArrows: React.PropTypes.bool,
    useEndArrows: React.PropTypes.bool,
    useItemNumbers: React.PropTypes.bool,
    usePages: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      noVisiblePages: 6,
      itemsPerPage: 10,
      useArrows: true,
      useItemNumbers: true,
      usePages: false
    };
  },

  handlePageChange: function (pageNum) {
    var noPages = Math.ceil(this.props.noItems / this.props.itemsPerPage);
    if (pageNum >= 0 &&
        pageNum < noPages &&
        pageNum !== this.props.currentPage) {
      this.props.onPageChange(pageNum);
    } else {
      return false;
    }
  },

  render: function () {
    var noItems = this.props.noItems;
    var itemsPerPage = this.props.itemsPerPage;

    var currentPage = this.props.currentPage;
    var pageNumber = 0;
    var pagesOnEachSide = Math.floor(this.props.noVisiblePages / 2);
    var noPages = Math.ceil(noItems / this.props.itemsPerPage);

    var pageLBound = Math.max(0, currentPage - pagesOnEachSide);
    var pageUBound = Math.min(noPages, currentPage + pagesOnEachSide);

    if (currentPage < pagesOnEachSide) {
      pageUBound += pagesOnEachSide - currentPage;
    }
    if (noPages < currentPage + pagesOnEachSide) {
      pageLBound -= currentPage + pagesOnEachSide - noPages;
    }

    var leftArrowsClassSet = React.addons.classSet({
      "disabled": currentPage === 0
    });
    var rightArrowsClassSet = React.addons.classSet({
      "disabled": currentPage === noPages - 1
    });

    var itemsLBound = currentPage * itemsPerPage;
    var itemsUBound = Math.min(
      currentPage * itemsPerPage + itemsPerPage,
      noItems
    );

    /* jshint trailing:false, quotmark:false, newcap:false */
    /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
    var pagination = [];
    if (this.props.usePages) {
      for (var i = 0; i < noItems; i++) {
        // create a page per each number of items on a single page
        if (i % itemsPerPage === 0) {
          // only draw those within the bounds
          if (pageNumber >= pageLBound && pageNumber <= pageUBound) {
            pagination.push(
              <li className={pageNumber === currentPage ? "success disabled" : ""}
                  key={pageNumber + 1}>
                <button
                  onClick={this.handlePageChange.bind(this, pageNumber)}>
                  {pageNumber + 1}
                </button>
              </li>
            );
          }
          pageNumber++;
        }
      }
    }

    var itemNumbers =
      this.props.useItemNumbers ?
        <span className="item-numbers">{itemsLBound + 1}-{itemsUBound} of {noItems}</span> :
        null;

    var leftArrow =
      this.props.useArrows ?
        <li className={leftArrowsClassSet}>
          <button onClick={this.handlePageChange.bind(this, currentPage - 1)}>
            ‹
          </button>
        </li> :
        null;
    var leftEndArrow =
      this.props.useEndArrows ?
        <li className={leftArrowsClassSet}>
          <button onClick={this.handlePageChange.bind(this, 0)}>
            «
          </button>
        </li> :
        null;
    var rightArrow =
      this.props.useArrows ?
        <li className={rightArrowsClassSet}>
          <button onClick={this.handlePageChange.bind(this, currentPage + 1)}>
            ›
          </button>
        </li> :
        null;
    var rightEndArrow =
      this.props.useEndArrows ?
        <li className={rightArrowsClassSet}>
          <button
            onClick={this.handlePageChange.bind(this, noPages - 1)}>
            »
          </button>
        </li> :
        null;

    return (
      <div className={this.props.className}>
        {itemNumbers}
        <ul className="pagination pagination-sm pagination-unstyled">
          {leftEndArrow}
          {leftArrow}
          {pagination}
          {rightArrow}
          {rightEndArrow}
        </ul>
      </div>
    );
  }
});

module.exports = PagedNavComponent;
