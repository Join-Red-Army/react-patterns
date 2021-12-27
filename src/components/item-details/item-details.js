import React, { Component } from 'react';
import Spinner from '../spinner';
import ErrorButton from '../error-button';
import './item-details.css';

const Record = ({item, field, label}) => {
  return (
    <li className="list-group-item">
    <span className="term">{label}</span>
    <span>{ field }</span>
  </li>
  );
};

export { Record };


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
    const { name, item, loading, image } = this.state;

    const hasData = (!loading && item);

    const selectMessage = !item ? <span>Select a item from a list</span> : null;
    const spinner = loading ? <Spinner /> : null;

    return (
      <div className="item-details card">
        {selectMessage}
        {spinner}
        <img className="item-image"
          src={image}
          alt="item"/>

        <div className="card-body">
          <h4>{name}</h4>
          <ul className="list-group list-group-flush">
            {
              React.Children.map(this.props.children, (child, idx) => {
                return <li>{idx}</li>;
              })
            }
          </ul>
          <ErrorButton />
        </div>
      </div>
    );
  }
};
