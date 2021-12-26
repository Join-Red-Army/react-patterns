import React, { Component } from 'react';

import Header from '../header';
import RandomPlanet from '../random-planet';
import ItemList from '../item-list';
import ItemDetails from '../item-details';
import ErrorButton from '../error-button';
import './app.css';
import ErrorIndicator from '../error-indicator';
import PeoplePage from '../people-page/people-page';
import SwapiService from '../../services/swapi-service';
import Row from '../row';

export default class App extends Component {

  swapiService = new SwapiService();

  state = {
    showRandomPlanet: true,
    // selectedPerson: 5
    selectedPerson: null,
    hasError: false
  };

  toggleRandomPlanet = () => {
    this.setState((state) => {
      return {
        showRandomPlanet: !state.showRandomPlanet
      }
    });
  };

  onPersonSelected = (id) => {
    this.setState({
      selectedPerson: id
    });
  };

  componentDidCatch() {
    console.log('componentDidCatch()');
    this.setState({ hasError: true });
  }


  render() {

    if (this.state.hasError) {
      return <ErrorIndicator />
    }

    const planet = this.state.showRandomPlanet ? <RandomPlanet/> : null;

    const { 
      getPerson, 
      getStarship,
      getPersonImage,
      getStarshipImage } = this.swapiService;

    const personDetails = ( <ItemDetails 
      itemId={11} 
      getData={getPerson} 
      getImageUrl={getPersonImage}/> );

    const starshipDetails = ( <ItemDetails 
      itemId={5} 
      getData={getStarship} 
      getImageUrl={getStarshipImage}/> );

    return (
    <div className='app'>
      <Header />

      <Row
        left={personDetails}
        right={starshipDetails} 
      />
 
    </div>
  )};
};
