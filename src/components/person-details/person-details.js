import React, { Component } from 'react';
import SwapiService from '../../services/swapi-service';
import Spinner from '../spinner';
import ErrorIndicator from '../error-indicator';
import ErrorButton from '../error-button';

import './person-details.css';

export default class PersonDetails extends Component {

  swapiService = new SwapiService();

  state = {
    person: null,
    loading: false,
    // hasError: false
    // ошибки обрабатывает обёртка ErrorBoundry
  }

  componentDidMount() {
    this.updatePerson();
  }

  componentDidUpdate(prevProps) {
    if (this.props.personId !== prevProps.personId) {
      this.updatePerson();
    }
  }

  // componentDidCatch() {
  //   this.setState({ hasError: true });
  // } 
  // ошибки обрабатывает обёртка ErrorBoundry

  updatePerson() {
    const { personId } = this.props;
    if (!personId) {
      return;
    }

    this.setState({
      loading: true
    });

    this.swapiService.getPerson(personId)
      .then((person) => {
        this.setState({ person, loading: false });
      });
  }

  render() {
    const { person, loading, hasError } = this.state;
    //const { person, loading, hasError } = this.state;

    // if (hasError) {
    //   return <ErrorIndicator />
    // }
    // ошибки обрабатывает обёртка ErrorBoundry

    const hasData = (!loading && person);

    const selectMessage = !person ? <span>Select a person from a list</span> : null;
    const spinner = loading ? <Spinner /> : null;
    const personData = hasData ? PersonView(person) : null;

    return (
      <div className="person-details card">
        {selectMessage}
        {spinner}
        {personData}
      </div>
    );
  }
}

const PersonView = (props) => {
  const { id, name, gender, birthYear, eyeColor } = props;

  console.log(props)

  return (
    <React.Fragment>
      <img className="person-image"
          src={`https://starwars-visualguide.com/assets/img/characters/${id}.jpg`}
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