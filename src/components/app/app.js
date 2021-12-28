import React, { Component } from 'react';

import Header from '../header';
import RandomPlanet from '../random-planet';
import ItemList from '../item-list';
import ItemDetails, { Record } from '../item-details';
import ErrorIndicator from '../error-indicator';
import SwapiService from '../../services/swapi-service';
import Row from '../row';
import './app.css';
import { 
  PersonDetails, StarshipDetails, PlanetDetails,
  PersonList, StarshipList, PlanetList } from '../sw-components';

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

    return (
    <div className='app'>
      <Header />

      <PersonDetails   itemId={11} />
      <PlanetDetails   itemId={5} />
      <StarshipDetails itemId={9} />

      <PersonList>
        { ({name}) => <span>{name}</span> }</PersonList>
      
      <StarshipList>
        { ({name}) => <span>{name}</span> }</StarshipList>
      
      <PlanetList>
        { ({name}) => <span>{name}</span> }</PlanetList>
 
    </div>
  )};
};
