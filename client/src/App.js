import React, { Component } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Spinner } from "reactstrap";
import About from "./components/About";
import AdsBar from "./components/AdsBar";
import AdvancedSearch from "./components/AdvancedSearch";
import Appliances from "./components/Appliances";
import Auto from "./components/Auto";
import AutoService from "./components/AutoService";
import Beauty from "./components/Beauty";
import CategoryItems from "./components/CategoryItems";
import Cell from "./components/Cell";
import ChatView from "./components/ChatView";
import Clothing from "./components/Clothing";
import ComEquip from "./components/ComEquip";
import Contact from "./components/Contact";
import EmailConfirmed from "./components/EmailConfirmed";
import Footer from "./components/Footer";
import ForgotPassword from "./components/ForgotPassword";
import Furniture from "./components/Furniture";
import Header from "./components/Header";
import Home from "./components/Home";
import HomeService from "./components/HomeService";
import Housing from "./components/Housing";
import HowItWorks from "./components/HowItWorks";
import Instruments from "./components/Instruments";
import ItemDetails from "./components/ItemDetails";
import Messages from "./components/Messages";
import Misc from "./components/Misc";
import MobileMenu from "./components/MobileMenu";
import Moto from "./components/Moto";
import PaymentFormLoader from "./components/PaymentFormLoader";
import Register from "./components/Register";
import SearchResults from "./components/SearchResults";
import SideBar from "./components/SideBar";
import Login from "./components/Signin";
import UserPanel from "./components/UserPanel";
import Vidgame from "./components/Vidgame";
import WhatPeopleNeed from "./components/WhatPeopleNeed";
import WhatYouNeed from "./components/WhatYouNeed";
import "./PaymentFormLoader.css";
import ItemService from "./services/ItemService";
import UserService from "./services/UserService";
import Constant from "./util/Constant";
import { getFromStorage } from "./util/storage";
import Axios from "axios";
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      token: "",
      isAuth: false,
      disableInfiniteScroll: false,
      lastId: "",
      userName: "",
      firstName: "",
      userId: "",
      email: "",
      searchTerm: "",
      searchResults: [],
      showResults: false,
      distance: "",
      zipCode: "",
      zipResults: [],
      errorMessage: "",
    };

    this.onTextChange = this.onTextChange.bind(this);
    this.getUserVerify = this.getUserVerify.bind(this);

    this.onSearch = this.onSearch.bind(this);
    this.onDistanceChange = this.onDistanceChange.bind(this);
    this.onZipChange = this.onZipChange.bind(this);
    this.getItems = this.getItems.bind(this);
    this.getItemsInfinite = this.getItems.bind(this, true);
    this.searchBehaviorObject = ItemService.getSearchBehaviorObject();
  }

  onTextChange(event) {
    this.setState({
      searchTerm: event.target.value,
    });
  }

  onDistanceChange(event) {
    this.setState({
      lastId: "",
      searchResults: [],
      distance: event.target.value,
    });
  }

  onZipChange(event) {
    this.setState({
      lastId: "",
      searchResults: [],
      zipCode: event.target.value,
    });
  }

  handleSearch() {
    if (!this.state.zipCode || this.state.zipCode.length !== 5)
      return alert("Invalid zip code provided.");
    if (
      window.location.pathname !== "/" &&
      window.location.pathname !== "/WhatPeopleNeed"
    ) {
      window.location = `/WhatPeopleNeed?zipCode=${
        this.state.zipCode
      }&distance=${this.state.distance}`;
    } else {
      this.searchBehaviorObject.next({
        zipCode: this.state.zipCode,
        distance: this.state.distance,
      });
    }
  }

  /**
   * Searching on enter key pressed
   * @param {*} e
   */
  onKeyPress = (e) => {
    if (e.which === 13) this.handleSearch();
  };

  /**
   * Getting the items.
   * @param {*} category The optinal category.
   */
  getItems(isInfiniteScroll = false) {
    ItemService.getAllItems(
      "all",
      this.state.lastId,
      this.state.zipCode,
      this.state.distance
    )
      .then((json) => {
        if (json && json.count > 0) {
          json.items = json.items || [];
          this.setState({
            searchResults: this.state.searchResults.concat(json.items),
            lastId: json.lastId,
            disableInfiniteScroll: json.items.length === 0 ? true : false,
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
    this.handleSearch();
  }

  componentDidMount() {
    this.getUserVerify();
  }
  async getUserVerify() {
    const obj = getFromStorage("the_main_app");
    if (obj && obj.token) {
      const { token } = obj;
      //Verify
      if (token) {
        try {
          let response =await Axios.get(
            `${Constant.API_ENDPOINT}/user/verify/${token}`
          );
          let json = response.data;
          if (json.message === "User Verified") {
            const userSession = {
              token,
              userName: json.userName,
              firstName: json.firstName,
              userId: json.userId,
              email: json.email,
              profilePic: json.profilePic || "",
              permissions: json.permissions || [],
              emailConfirmed: json.emailConfirmed || false,
              isAuth: true,
            };
            this.setState(userSession);
            UserService.setUser(userSession);
          } else {
            UserService.deleteUserSession();
            this.setState({
              isAuth: false,
            });
          }
        } catch (error) {
          console.log("Errror-->", error);
        }
      }
    } else {
      UserService.deleteUserSession();
      this.setState({
        isAuth: false,
      });
    }
  }
  render() {
    const {
      isAuth,
      userName,
      firstName,
      userId,
      searchTerm,
      showResults,
      token,
      email,
      distance,
      zipCode,
      zipResults,
    } = this.state;

    return (
      <div className="App">
        <Header isAuth={isAuth} userName={userName} firstName={firstName} />

        <MobileMenu />
        {/* <div className="Search">
          <input
            className="SearchBox"
            type="text"
            placeholder="Search Term"
            value={searchTerm}
            onChange={this.onTextChange}
          />

          <input
            className="empty-input top-input"
            type="text"
            placeholder="Distance"
            disabled
          />
          <select
            className="SearchDropDown top-input"
            name={distance}
            defaultValue=""
            onChange={this.onDistanceChange}
          >
            <option value="" disabled>MILES</option>
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
            placeholder="ZIP CODE"
            value={zipCode}
            onKeyPress={this.onKeyPress}
            onChange={this.onZipChange}
          />
          <button onClick={this.onSearch}>GO</button>
        </div> */}
        <div
          style={{
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="mycontainer"
        >
          <SideBar style={{ height: "100%" }} />
          <AdsBar style={{ height: "100%" }} />
          {this.state.showResults ? (
            <InfiniteScroll
              dataLength={this.state.searchResults.length}
              next={this.getItemsInfinite}
              hasMore={!this.state.disableInfiniteScroll}
              // loader={
              //   <Spinner
              //     className="block-center"
              //     style={{ width: "5rem", height: "5rem" }}
              //   />
              // }
            >
              <Spinner
                className="block-center"
                style={{
                  width: "5rem",
                  height: "5rem",
                  position: "absolute",
                  top: "50%",
                  left: "55%",
                }}
              />
              <h4
                style={{
                  color: "#000",
                  position: "absolute",
                  top: "70%",
                  left: "52%",
                }}
              >
                Did You Know
              </h4>
              <SearchResults
                isAuth={isAuth}
                userId={userId}
                searchResults={this.state.searchResults}
                token={token}
                firstName={firstName}
                zipCode={zipCode}
                distance={distance}
                zipResults={zipResults}
              />
            </InfiniteScroll>
          ) : (
            <BrowserRouter>
              <Switch>
                <Route
                  exact
                  path={"/"}
                  render={(props) => (
                    <Home
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/WhatPeopleNeed"}
                  render={(props) => (
                    <WhatPeopleNeed
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/WhatYouNeed"}
                  render={(props) => (
                    <WhatYouNeed
                      {...props}
                      isAuth={isAuth}
                      email={email}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route path={"/HowItWorks"} component={HowItWorks} />
                <Route
                  path={"/PaymentFormLoader"}
                  component={PaymentFormLoader}
                />

                <Route path={"/About"} component={About} />
                <Route path={"/Contact"} component={Contact} />
                <Route path={"/Register"} component={Register} />
                <Route path={"/Signin"} component={Login} />
                <Route path={"/email-confirmed"} component={EmailConfirmed} />

                <Route
                  path={"/auto"}
                  render={(props) => (
                    <Auto
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/appliances"}
                  render={(props) => (
                    <Appliances
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/moto"}
                  render={(props) => (
                    <Moto
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/cell"}
                  render={(props) => (
                    <Cell
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/furniture"}
                  render={(props) => (
                    <Furniture
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/instruments"}
                  render={(props) => (
                    <Instruments
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/games"}
                  render={(props) => (
                    <Vidgame
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />

                <Route
                  path={"/homeservice"}
                  render={(props) => (
                    <HomeService
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/autoservice"}
                  render={(props) => (
                    <AutoService
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/clothing"}
                  render={(props) => (
                    <Clothing
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/misc"}
                  render={(props) => (
                    <Misc
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/collectibles"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="collectibles"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/antiques"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="antiques"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/vintage"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="vintage"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/offroadtrucks"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Truks/Off-Road"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/lowridestrucks"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Truks/Low-Rides"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/importtrucks"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Truks/Import"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/worktrucks"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Truks/Work"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/commutercar"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Car/Commuter"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/vintagecar"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Car/Vintage"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/importcar"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Car/Import"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/musclecar"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Car/Muscle"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/vintagemotorcycles"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Motorcycles/Vintage"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/modernmotorcycles"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Motorcycles/Modern"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/offroadmotorcycles"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Motorcycles/Off-Road"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/harleydavidsons"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Motorcycles/Harley-Davidsons"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/sportscards"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Collectibles/Cards/Sports"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/wrestlingcards"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Collectibles/Cards/Wrestling"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/pokemoncards"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Collectibles/Cards/Pokemon"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/othercards"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Collectibles/Cards/Others"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/records"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Records"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/instruments"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Instruments"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/arts"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Vehicles/Arts"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/stereos"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Electronics/Stereos"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/personalelectronics"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Electronics/Personal-Electronics"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/videogames"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Electronics/Video-Games"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/vintageconsolegames"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Electronics/Vintage-Console-Games"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/furniturehome"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Home/Furniture"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/decorehome"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Home/Decore"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/modernhome"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Home/Modern"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/otherhome"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Home/Other"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/otherfashion"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Fashion/Other"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/vintagemen"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Fashion/Men/Vintage"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/modernmen"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Fashion/Men/Modern"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/vintagewomen"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Fashion/Women/Vintage"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/modernwomen"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Fashion/Women/Modern"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/athleticwomen"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="Fashion/Women/Athletic"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/rarevehicles"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="rarevehicles"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/vintageHome"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="vintageHome"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/other"}
                  render={(props) => (
                    <CategoryItems
                      {...props}
                      category="other"
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/comequip"}
                  render={(props) => (
                    <ComEquip
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/housing"}
                  render={(props) => (
                    <Housing
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route
                  path={"/beauty"}
                  render={(props) => (
                    <Beauty
                      {...props}
                      isAuth={isAuth}
                      userName={userName}
                      firstName={firstName}
                      userId={userId}
                      token={token}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />

                <Route
                  path={"/userpanel"}
                  render={(props) => (
                    <UserPanel
                      {...props}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />
                <Route path={"/messages"} render={(props) => <Messages />} />
                <Route
                  path={"/advanced"}
                  render={(props) => (
                    <AdvancedSearch
                      {...props}
                      isAuth={isAuth}
                      userId={userId}
                      token={token}
                      firstName={firstName}
                      zipCode={zipCode}
                      distance={distance}
                    />
                  )}
                />

                <Route exact path="/item/:itemId" component={ItemDetails} />
                <Route
                  exact
                  path="/forgotPassword/:pwdResetToken"
                  component={ForgotPassword}
                />
                <Route
                  exact
                  path="/forgotPassword"
                  component={ForgotPassword}
                />

                <Route
                  path={"/chat_view/:itemId/offerings"}
                  render={(props) => <ChatView {...props} type="offerings" />}
                />

                <Route
                  path={"/chat_view/:itemId/inquired"}
                  render={(props) => <ChatView {...props} type="inquired" />}
                />
              </Switch>
            </BrowserRouter>
          )}

          <Footer />
        </div>
      </div>
    );
  }
}

export default App;
