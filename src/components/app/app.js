import React, { Component } from 'react';
import './app.css';

import Header from '../header';
import RandomPlanet from '../random-planet';
import ErrorBoundry from '../error-boundry';
import SwapiService from '../../services/swapi-service';
import DummySwapiService from '../../services/dummy-swapi-service';
import { SwapiServiceProvider } from '../swapi-service-context/swapi-service-context';
import { PeoplePage, StarshipsPage, PlanetsPage } from '../pages';


export default class App extends Component {

  state = {
    swapiService: new SwapiService()
  };

  onServiceChange = () => {
    this.setState(({ swapiService }) => {

      const Service = swapiService instanceof SwapiService ?
        DummySwapiService : SwapiService;
      return { swapiService: new Service() };
    });
  }

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

    return (
      <ErrorBoundry>
        <SwapiServiceProvider value={this.state.swapiService}>
          
          <div className='app'>
            <Header onServiceChange={this.onServiceChange} />

            <RandomPlanet />

            <PeoplePage />
            <StarshipsPage />
            <PlanetsPage />

          </div>

        </SwapiServiceProvider>
      </ErrorBoundry>
    )};
};
