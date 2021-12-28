import Rect from 'react';
import ItemDetails, { Record } from '../item-details';
import SwapiService from '../../services/swapi-service';

const swapiService = new SwapiService();
const {
  getPerson, getStarship, getPlanet,
  getPersonImage, getStarshipImage, getPlanetImage 
} = swapiService;

const PersonDetails = ({ itemId }) => {
  return (
    <ItemDetails itemId={itemId} getData={getPerson} getImageUrl={getPersonImage}>
      <Record field='gender' label='Gender' />
      <Record field='eyeColor' label='Eye Color' />
    </ItemDetails>
  );
};

const PlanetDetails = ({ itemId }) => {
  return (
    <ItemDetails itemId={itemId} getData={getPlanet} getImageUrl={getPlanetImage}>
      <Record field='popelation' label='Population' />
      <Record field='diameter' label='Diameter' />
    </ItemDetails>
  );
};

const StarshipDetails = ({ itemId }) => {
  return (
    <ItemDetails itemId={itemId} getData={getStarship} getImageUrl={getStarshipImage}>
      <Record field='model' label='Model' />
      <Record field='length' label='Length' />
    </ItemDetails>
  );
};

export { PersonDetails, PlanetDetails, StarshipDetails };