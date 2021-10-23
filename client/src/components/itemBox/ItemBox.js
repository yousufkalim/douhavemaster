import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from "react-icons/fa";
import SaveItem from "../SaveItem";
import UserService from "../../services/UserService";
import 'react-lazy-load-image-component/src/effects/blur.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import './ItemBox.css';

/**
 * Represendint an item box
 * @author dassiorleando
 */
class ItemBox extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showSaveItem: false
    };

    this.onCancel = this.onCancel.bind(this);
    this.confirmationEmailWarning = 'Please confirm your email address with the instructions on the home page.';
  }

  onCancel() {
    this.setState({
      showSaveItem: false,
    });
  }

  onSaveItem = (id) => {
    let isAuth = UserService.isConnected();
    const { emailConfirmed } = UserService.getUserSessionDetails() || {};
    if (isAuth && !emailConfirmed) {
      alert(this.confirmationEmailWarning);
    } else {
      this.setState({ showSaveItem: true })
    }
  };

  render() {
    // The item/post to show
    const item = this.props.item;

    return (
      <>
        {/* <div className="box arrow-top">
          <Link to={{ pathname: `/item/${ item.itemId ? item.itemId : item._id }`, state: { item } }}>
            <div className="box-img">
              <LazyLoadImage
                alt='Image alt'
                effect='blur'
                src={item.itemImg.startsWith('http') ? item.itemImg : item.itemImg.substring(item.itemImg.lastIndexOf('/') - 17, item.itemImg.length)}
                wrapperClassName="item-img-wrapper" />
            </div>
          </Link>
          <div className="item-name text-uppercase">
            <Link to={{ pathname: `/item/${ item.itemId ? item.itemId : item._id }`, state: { item } }} style={{ color: "black" }}>{item.name}</Link>
          </div>

          <div className="item-budget">
            <span>BUDGET</span> 
            <span>${item.budget.toLocaleString(navigator.language, {
                          minimumFractionDigits: 0,
                        })}</span>
          </div>
          <div className='line'></div>
          <div className="box-info">
            {
              !item.itemId
              ? <span className="icon-heart">
                  <FaHeart color="#bfbfbf" onClick={() => this.onSaveItem(item._id)} />
                </span>
              : <div></div>
            }

            {
              this.state.showSaveItem && !item.itemId ? (
                <SaveItem
                  key={item._id}
                  model={item}
                  onCancel={this.onCancel}
                />
              ) : 
                  <>
                    <span className="text-uppercase"> {item.category} </span>
                    <span className="text-uppercase">{item.location}, {item.locationState}</span>
                  </>
            }
          </div>
        </div> */}
        <Link to={{ pathname: `/item/${item.itemId ? item.itemId : item._id}`, state: { item } }}>
          <div className="box-alt">
            <div className="img-box-alt">
              <LazyLoadImage
                alt='Image alt'
                src={item.itemImg.startsWith('http') ? item.itemImg : item.itemImg.substring(item.itemImg.lastIndexOf('/') - 17, item.itemImg.length)} />
            </div>
            <div className="product-name-alt">
              <p className="product-text-alt">{item.name}</p>
            </div>
            <div className="product-bud-alt">
              <p >BUDGET</p>
            </div>
            <div className="product-price-alt ">
              <p>${item.budget.toLocaleString(navigator.language, {
                minimumFractionDigits: 0,
              })}</p>
            </div>
            <div className="product-cat-alt">
              <p>{item.category}</p>
              <p>{item.location}, {item.locationState}</p>
            </div>
            <hr style={{ margin: '10px 0' }}></hr>
            <div className="product-option-alt">
              {
                !item.itemId
                  ? <span className="icon-heart" onClick={() => this.onSaveItem(item._id)}>
                    <FaHeart color="#bfbfbf" /><p>Add to Favourite</p>
                  </span>
                  : <div></div>
              }

              {
                this.state.showSaveItem && !item.itemId ? (
                  <SaveItem
                    key={item._id}
                    model={item}
                    onCancel={this.onCancel}
                  />
                ) :
                  <></>
              }
            </div>
          </div>
        </Link>

      </>
    );
  }
}

export default ItemBox;
