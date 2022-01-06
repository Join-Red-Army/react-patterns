import React, { Component } from 'react';

import Header from '../header';
import RandomPlanet from '../random-planet';
import ItemList from '../item-list';
import ItemDetails, { Record } from '../item-details';
import ErrorIndicator from '../error-indicator';
import ErrorBoundry from '../error-boundry';
import SwapiService from '../../services/swapi-service';
import DummySwapiService from '../../services/dummy-swapi-service';
import Row from '../row';
import './app.css';
import { 
  PersonDetails, StarshipDetails, PlanetDetails,
  PersonList, StarshipList, PlanetList } from '../sw-components';
import { SwapiServiceProvider } from '../swapi-service-context/swapi-service-context';

export default class App extends Component {

  // swapiService = new SwapiService();

  state = {
    showRandomPlanet: true,
    swapiService: new SwapiService(), // тут
    // selectedPerson: 5
    selectedPerson: null,
    hasError: false
  };

  onServiceChange = () => {
    this.setState(({ swapiService }) => {

      const Service = swapiService instanceof SwapiService ?
        DummySwapiService : SwapiService;
      return { swapiService: new Service() };
    });
  }

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
      getStarshipImage } = this.state.swapiService;

    return (
      <ErrorBoundry>
        <SwapiServiceProvider value={this.state.swapiService}>
          
          <div className='app'>
            <Header onServiceChange={this.onServiceChange} />

            <PersonDetails   itemId={11} />
            <PlanetDetails   itemId={5} />
            <StarshipDetails itemId={9} />

            <PersonList />
            <StarshipList />
            <PlanetList />
          </div>

        </SwapiServiceProvider>
      </ErrorBoundry>
    )};
};
