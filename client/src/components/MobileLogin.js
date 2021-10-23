import React, { Component } from "react";
import { BiConversation } from "react-icons/bi";
import UserService from "../services/UserService";
import { deleteFromStorage } from "../util/storage";

class MobileLogin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showLogin: false,
    };
    this.onLoginIcon = this.onLoginIcon.bind(this);
  }

  onLoginIcon = () => {
    if (this.state.showLogin) {
      this.setState({
        showLogin: false,
      });
    }

    this.setState({
      showLogin: true,
    });
  };

  onLogout() {
    deleteFromStorage();
  }

  render() {
    const isAuth = UserService.isConnected();
    const { userName, firstName, profilePic } =
      UserService.getUserSessionDetails() || {};
    return (
      <div className="MobileLogin">
        {!isAuth ? (
          <div className="registerText">
            <a
              style={{ color: "#000000", textDecoration: "none" }}
              href="/Register"
            >
              SIGN UP
            </a>
            <div className="space-break" />
          </div>
        ) : null}
        {!isAuth ? (
          <div className="registerText">
            <a
              style={{ color: "#000000", textDecoration: "none" }}
              href="/Signin"
            >
              SIGN IN
            </a>
            <div className="space-break" />
          </div>
        ) : null}
        {/* {
          (!isAuth) ? (
            <div className="mobile-login-box">
              <div className="signInText cursor-pointer" onClick={this.onLoginIcon}>
                <span
                  style={{ color: '#000000' }}>SIGN IN</span>
              </div>
              {
                this.state.showLogin ? (
                  <Login isAuth={isAuth} userName={userName} firstName={firstName} modal={true} key={Date.now()} />
                  ) : null
              }
            </div>
            ) : (null)
        } */}
        {isAuth ? (
          <div className="mobile-login-box">
            <p>
              <a href="/messages">
                <BiConversation className="profile-icon" />
              </a>
              <a style={{ color: "#000000" }} href="/userpanel">
                {/* <BiUserCircle className="profile-icon" /> */}
                <img
                  alt=""
                  src={profilePic}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50px",
                  }}
                />
                Welcome, {firstName}!
              </a>
              {/* <BsCaretDownFill className="profile-icon"/> */}
            </p>
            <a style={{ color: "#000000" }} href="#" onClick={this.onLogout}>
              Logout
            </a>

            <br />
          </div>
        ) : null}
      </div>
    );
  }
}

export default MobileLogin;
