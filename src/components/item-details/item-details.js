import React, { Component } from 'react';
import Spinner from '../spinner';
import ErrorButton from '../error-button';
import './item-details.css';


export default class ItemDetails extends Component {
  state = {
    item: null,
    loading: false,
    image: null
  }

  componentDidMount() {
    this.updateItem();
  }

  componentDidUpdate(prevProps) {
    if (this.props.itemId !== prevProps.itemId) {
      this.updateItem();
    }
  }

  updateItem() {
    const { itemId, getData, getImageUrl } = this.props;
    if (!itemId) {
      return;
    }

    this.setState({
      loading: true
    });

    getData(itemId)
      .then((item) => {
        this.setState({ item, loading: false, image: getImageUrl(item) });
      });
  }

  render() {
    const { item, loading, image } = this.state;

    const hasData = (!loading && item);

    const selectMessage = !item ? <span>Select a item from a list</span> : null;
    const spinner = loading ? <Spinner /> : null;
    const personData = hasData ? PersonView(item, image) : null;

    return (
      <div className="item-details card">
        {selectMessage}
        {spinner}
        {personData}
      </div>
    );
  }
};


const PersonView = (item, image) => {
  const { name, gender, birthYear, eyeColor } = item;

  return (
    <React.Fragment>
      <img className="item-image"
          src={image}
          alt="character"/>

        <div className="card-body">
          <h4>{name}</h4>

          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <span className="term">Gender</span>
              <span>{gender}</span>
            </li>
            <li className="list-group-item">
              <span className="term">Birth Year</span>
              <span>{birthYear}</span>
            </li>
            <li className="list-group-item">
              <span className="term">Eye Color</span>
              <span>{eyeColor}</span>
            </li>
          </ul>
          <ErrorButton />

        </div>
    </React.Fragment>
  )
}

