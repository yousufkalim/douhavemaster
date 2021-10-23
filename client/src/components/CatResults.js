import React, { Component } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Col, Row, Spinner } from "reactstrap";
import ItemService from "../services/ItemService";
import Categories from "./Categories";
import ItemBox from "./itemBox/ItemBox";
import SubMenu from "./SubMenu";

class CatResults extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
      isInfiniteLoaded: false,
      disableInfiniteScroll: false,
      models: [],
      category: this.props.category,
      showItem: false,
      singleResult: "",
      filteredResults: "",
      lastId: "",
      zipCode: "",
      distance: "",
      searchTerm: "",
      errorMessage: "",
      showResults: true,
      selectedItem: {},
      closed: true,
      clickToShow: false,
      showOfferSubmit: false,
      showSaveItem: false,
      token: this.props.token,
    };

    this.onTextChange = this.onTextChange.bind(this);
    this.onItemFull = this.onItemFull.bind(this);
    this.changeCategory = this.changeCategory.bind(this);
    this.onOfferSubmit = this.onOfferSubmit.bind(this);
    this.onSaveItem = this.onSaveItem.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onClose = this.onClose.bind(this);
    this.getItems = this.getItems.bind(this);
    this.getItemsInfinite = this.getItems.bind(this, "", true);
    this.searchBehaviorObject = ItemService.getSearchBehaviorObject();
    this.onDistanceChange = this.onDistanceChange.bind(this);
    this.onZipChange = this.onZipChange.bind(this);
    this.fetchZipInfo = this.fetchZipInfo.bind(this);
  }

  onTextChange(event) {
    this.setState({
      searchTerm: event.target.value,
    });
  }

  onDistanceChange(event) {
    this.setState({
      distance: event.target.value,
    });
  }

  onZipChange(event) {
    this.setState({
      zipCode: event.target.value,
    });
  }
  componentDidMount() {
    const self = this;
    let category = this.props.category;
    this.setState({ category });
    this.getItems();

    // Getting search behavior
    ItemService.getSearchBehaviorObject().subscribe((searchDetails) => {
      if (searchDetails && searchDetails.zipCode) {
        self.setState(
          {
            zipCode: searchDetails.zipCode,
            distance: searchDetails.distance,
            models: [],
            lastId: "",
            isLoaded: false,
          },
          () => {
            self.getItems();
          }
        );
      }
    });
  }

  /**
   * Getting the items.
   * @param {*} category The optinal category.
   */
  getItems(category = "", isInfiniteScroll = false) {
    this.setState({ isInfiniteLoaded: !isInfiniteScroll });
    ItemService.getAllItems(
      category || this.state.category,
      this.state.lastId,
      this.state.zipCode,
      this.state.distance
    )
      .then((json) => {
        if (json) {
          // json.items = json.items
          this.setState({
            isLoaded: true,
            isInfiniteLoaded: true,
            models: json.items,
            lastId: json.lastId,
            disableInfiniteScroll: json.items.length === 0 ? true : false,
          });
        } else {
          this.setState({
            isLoaded: isInfiniteScroll,
            isInfiniteLoaded: false,
          });
        }
      })
      .catch((error) => {
        this.setState({
          errorMessage:
            error.response && error.response.data
              ? error.response.data.message
              : error.message,
        });
      });
  }
  onSearch() {
    const { searchTerm, searchResults, showResults, zipCode } = this.state;
    if (!showResults) {
      this.setState({
        showResults: true,
      });
    }

    if (searchTerm === "") {
      fetch("/items/", {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.count > 0) {
            this.setState({
              searchResults: json.items,
            });
          }
        });
    } else {
      let extended_url = zipCode !== "" ? `&locationZip=${zipCode}` : "";
      //`/search-products?term=${searchTerm}` + extended_url
      fetch(`/items/search-products?category=${searchTerm}` + extended_url, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.count > 0) {
            this.setState({ filteredResults: json.items });
            // this.setState({
            //   searchResults: json.items,
            // },()=>
          }
        });
    }
    this.fetchZipInfo();
  }

  fetchZipInfo() {
    const { zipCode, distance, zipResults } = this.state;

    if (zipCode !== "" && distance !== "") {
      fetch(
        `https://redline-redline-zipcode.p.rapidapi.com/rest/radius.json/${zipCode}/${distance}/mile`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "redline-redline-zipcode.p.rapidapi.com",
            "x-rapidapi-key":
              "47eaf9b3eemsh8821c07d555b84cp11d76cjsn3879605d5b16",
          },
        }
      )
        .then((response) => response.json())
        .then((response) => {
          this.setState({
            zipResults: response.zip_codes,
          });
        })
        .catch((err) => {});
    } else {
    }
  }
  changeCategory(cat) {
    this.setState({
      category: cat,
      showResults: false,
      disableInfiniteScroll: false,
    });
    this.getItems();
  }

  onItemFull(id) {
    this.setState({
      singleResult: id,
      showItem: true,
      closed: false,
    });
  }

  onClickToShow = () => {
    const { clickToShow, showSaveItem } = this.state;
    this.setState({
      showSaveItem: false,
    });
    if (!clickToShow) {
      this.setState({
        clickToShow: true,
      });
    } else {
      this.setState({
        clickToShow: false,
      });
    }
  };

  onOfferSubmit = (id) => {
    const { showOfferSubmit, singleResult } = this.state;
    if (singleResult !== "" && singleResult !== id) {
      this.setState({
        singleResult: id,
        showOfferSubmit: true,
      });
    } else {
      if (!showOfferSubmit) {
        this.setState({
          singleResult: id,
          showOfferSubmit: true,
        });
      } else {
        this.setState({
          showOfferSubmit: false,
          singleResult: "",
        });
      }
    }
  };

  onSaveItem = (id) => {
    const { showSaveItem, singleResult, clickToShow } = this.state;
    this.setState({
      showItem: false,
      clickToShow: false,
    });

    if (singleResult !== "" && singleResult !== id) {
      this.setState({
        singleResult: id,
        showSaveItem: true,
      });
    } else {
      if (!showSaveItem) {
        this.setState({
          singleResult: id,
          showSaveItem: true,
        });
      } else {
        this.setState({
          showSaveItem: false,
          singleResult: "",
        });
      }
    }
  };

  onCancel() {
    this.setState({
      showSaveItem: false,
    });
  }

  onClose() {
    this.setState({
      showItem: false,
    });
  }

  render() {
    let { searchTerm, zipCode, distance } = this.state;

    return (
      <div className="CatResults">
        <SubMenu changeCategory={this.changeCategory} />
        <h1 style={{ paddingTop: "120px", paddingBottom: "6px" }}>
          DO YOU HAVE
        </h1>
        <h5
          style={{
            fontWeight: "400",
            color: "#A9A9A9",
          }}
          className="results-sub-title"
        >
          WHAT PEOPLE ARE LOOKING FOR?
        </h5>
        <div className="Search">
          <input
            className="SearchBox top-input"
            type="text"
            placeholder="SEARCH WHAT PEOPLE ARE LOOKING FOR ..."
            value={searchTerm}
            onChange={this.onTextChange}
          />

          <input
            className="empty-input top-input"
            type="text"
            placeholder="SELECT DISTANCE"
            disabled
          />
          <select
            className="SearchDropDown top-input"
            name={distance}
            defaultValue=""
            onChange={this.onDistanceChange}
          >
            <option value="" disabled>
              MILES
            </option>
            <option value="909090909090909090900">Nationwide</option>
            <option value="5">Within 5 miles</option>
            <option value="10">Within 10 miles</option>
            <option value="20">Within 20 miles</option>
            <option value="60">Within 60 miles</option>
          </select>
          <span className="m-10 from-text"> FROM </span>
          <input
            className="SearchDistance top-input"
            type="text"
            placeholder="ENTER ZIP CODE"
            value={zipCode}
            onKeyPress={this.onKeyPress}
            onChange={this.onZipChange}
          />
          <button onClick={this.onSearch}>GO</button>
        </div>
        <hr
          style={{
            backgroundColor: "#000000",
            width: "85%",
            marginBottom: "0.5rem",
          }}
        />
        <hr
          style={{
            backgroundColor: "#000000",
            width: "70%",
            marginTop: "0rem",
          }}
        />
        <h1 style={{ paddingTop: "20px", fontSize: "26px" }}>
          POPULAR CATEGORIES
        </h1>

        <Categories />
        <hr
          style={{
            backgroundColor: "#000000",
            width: "85%",
            marginBottom: "0.5rem",
          }}
        />

        <div className="categoryResults">
          {!this.state.isLoaded ? (
            <Spinner
              className="block-center"
              style={{ width: "5rem", height: "5rem" }}
            />
          ) : this.state.filteredResults ? (
            <InfiniteScroll
              dataLength={this.state.filteredResults.length}
              next={this.getItemsInfinite}
              hasMore={!this.state.disableInfiniteScroll}
              // loader={<Spinner className="block-center" style={{ width: '5rem', height: '5rem' }} />}
            >
              <Row style={{ margin: "0px" }}>
                {this.state.filteredResults.length > 0 ? (
                  this.state.filteredResults.map((model) => (
                    <Col xs="6" sm="6" md="3" key={model._id}>
                      <ItemBox item={model} />
                    </Col>
                  ))
                ) : (
                  <div className="block-center m-40 w-100">
                    No results to show!
                  </div>
                )}
              </Row>
            </InfiniteScroll>
          ) : (
            <InfiniteScroll
              dataLength={this.state.models.length}
              next={this.getItemsInfinite}
              hasMore={!this.state.disableInfiniteScroll}
              // loader={<Spinner className="block-center" style={{ width: '5rem', height: '5rem' }} />}
            >
              <Row style={{ margin: "0px" }}>
                {this.state.models.length > 0 ? (
                  this.state.models.map((model) => (
                    <Col xs="6" sm="6" md="3" key={model._id}>
                      <ItemBox item={model} />
                    </Col>
                  ))
                ) : (
                  <div className="block-center m-40 w-100">
                    No results to show!
                  </div>
                )}
              </Row>
            </InfiniteScroll>
          )}
        </div>
      </div>
    );
  }
}

export default CatResults;
