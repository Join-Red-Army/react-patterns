import React from 'react';
import ItemList from '../item-list';
import { withData } from '../hoc-helpers';
import SwapiService from '../../services/swapi-service';

const swapiService = new SwapiService();
const { getAllPeople, getAllStarships, getAllPlanets } = swapiService;


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

// рендер-функции для персонажей и кораблей
const renderName = ({ name }) => <span>{name}</span>;
const renderModelAndName = ({ model, name }) => <span>{name} ({model})</span>

// композиция функций высшего порядка
const PersonList = withData(
  withChildFunction(ItemList, renderName),
  getAllPeople);

const PlanetList = withData(
  withChildFunction(ItemList, renderName), 
  getAllPlanets);

const StarshipList = withData(
  withChildFunction(ItemList, renderModelAndName),
  getAllStarships);

export { PersonList, PlanetList, StarshipList };