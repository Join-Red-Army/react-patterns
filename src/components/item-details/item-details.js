import React, { Component } from 'react';
import Spinner from '../spinner';
import ErrorButton from '../error-button';
import './item-details.css';

const Record = ({item, field, label}) => {
  return (
    <li className="list-group-item">
    <span className="term">{label}</span>
    <span>{ item[field] }</span>
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
    const { item, loading, image } = this.state;

    if (loading) return <Spinner />;
    if  (!item) return (<span>Select a item from a list</span>);
    
    const { name } = item;

    return (
      <div className="item-details card">

        <img className="item-image"
          src={image}
          alt="item"/>

        <div className="card-body">
          <h4>{name}</h4>
          <ul className="list-group list-group-flush">
            {
              React.Children.map(this.props.children, (child) => {
                return React.cloneElement(child, {item});
              })
            }
          </ul>
          <ErrorButton />
        </div>
      </div>
    );
  }
};
