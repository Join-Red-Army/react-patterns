import React from 'react';
import ItemList from '../item-list';
import { withData, withSwapiService } from '../hoc-helpers';


// обернёт компонент и вставит ему детей
const withChildFunction = (Wrapped, fn) => {
  return (props) => {
    return (
      <Wrapped {...props}>
        {fn}
      </Wrapped>
    );
  }
};

// рендер-функции для персонажей и кораблей пойдут в children
const renderName = ({ name }) => <span>{name}</span>;
const renderModelAndName = ({ model, name }) => <span>{name} ({model})</span>

const mapPersonMethodsToProps = (swapiService) => {
  return { getData: swapiService.getAllPeople }
};

const mapPlanetMethodsToProps = (swapiService) => {
  return { getData: swapiService.getAllPlanets}
};

const mapStarshipMethodsToProps = (swapiService) => {
  return { getData: swapiService.getAllStarships }
};

// композиция функций высшего порядка
const PersonList = withSwapiService(
    withData(
      withChildFunction(ItemList, renderName)),
    mapPersonMethodsToProps);

const PlanetList = withSwapiService(
    withData(
      withChildFunction(ItemList, renderName)), 
    mapPlanetMethodsToProps);

const StarshipList = withSwapiService(
    withData(
      withChildFunction(ItemList, renderModelAndName)),
    mapStarshipMethodsToProps);


export { PersonList, PlanetList, StarshipList };