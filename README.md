# react-patterns
Паттерны React: описание и примеры

## Зачем нужны паттерны?
Задача паттернов – избегать копирования кода и правильно переиспользовать части поведения компонентов.

Одинаковые компоненты могут иметь разное содержание: список персонажей, кораблей, планет.
Компоненты будут отличаться данными с сервера, но процесс получения и обработки данных (паттерн создания) у них одинаковый:
- запрос данных с сервера при создании;
- отрисовка этих данных;
- обработка ошибок с error indicator.

 Чтобы избежать копипасты и не плодить одинаковые компоненты, можно сделать один универсальный компонент, который будет просто получать разные данные и одинаково работать с ними.


## Использование функций
Функции погут инкапсулировать получение данных по сети и передавать их через пропсы.

itemList может стать универсальным компонентом, который работает с разными данными,  не только со списком персонажей. Важно! Универсальным станет только ItemList, т.е. списки слева, но не PersonDetails.

Если представить, что itemList спользуется для запроса списка планет или кораблей, то вот их сходства и различия:

**swapiService**
У всех присутствует.
**RenderItems**
Логика не изменяется.

**componentDidMount**
В зависимости от того, какую сущность надо отобразить, выполяется разный запрос (метод) swapiService. Единственное, что меняется у компонентов – функция для запроса данных:
- getAllPeople()
- getAllStarships()
- getAllPlanets()

Обновляют состояние setState они одинаково. Логичный шаг – вынести получение данных наружу из компонента.

**Что делать:**
1. SwapiService удаляется из компонента itemList. Функцию запроса данных можно вынести наружу. Вместо того, чтобы создавать экземпляр класса внутри компонента, этот компонент получит функцию getData из свойств.

getData тоже будет возвращать промис. Компонент будет получать данные из этой функции, устанавливать их в качестве своего state. 
Все peopleList заменяются на общее itemList, потому что компонент будет заниматься не только персонажами, а всем, чем угодно.

Было:
```js
// item-list.js

  state = {
    peopleList: null
  };

  swapiService = new SwapiService();

  componentDidMount() {
    this.swapiService.getAllPeople()
      .then((peopleList) => {
        this.setState({
          peopleList
        });
    });
  }
```

Стало:
```js
  state = {
    itemList: null
  };

  componentDidMount() {
    const { getData } = this.props;
    
    getData()
      .then((itemList) => {
        this.setState({
          itemList
        });
    });
  }
```


2. Сделать методы SwapiService стрелочными функциями, чтобы this не терялся:
```js
//swapi-service.js

getResourse = async (url) => {

getAllPeople = async () => {
getPerson = async(id) => {

getAllPlanets = async () => {
getPlanet = async (id) => {

getAllStarships = async () => {
getStarship = async (id) => {

_extractId = (item) => {

_transformPlanet = (planet) => {
_transformStarship = (starship) => {
_transformPerson = (person) => {
```

3. Изменить способ вызова универсального компонента.
Важно! Универсальным стал только ItemList, т.е. списки слева, но не PersonDetails.

Было
```js
// app.js
<div className="row mb2">
  <div className="col-md-6">
    <ItemList onItemSelected={this.onPersonSelected} />
  </div>
  <div className="col-md-6">
    <PersonDetails personId={this.state.selectedPerson} />
  </div>
</div>
```

Стало
```js
<div className="row mb2">
  <div className="col-md-6">
    <ItemList // тут изменения
      onItemSelected={this.onPersonSelected}
      getData={this.swapiService.getAllPlanets} 
    />
  </div>
  <div className="col-md-6">
    <PersonDetails personId={this.state.selectedPerson} />
  </div>
</div>

<div className="row mb2">
  <div className="col-md-6">
    <ItemList // тут изменения
      onItemSelected={this.onPersonSelected}
      getData={this.swapiService.getAllStarShips} 
    />
  </div>
  <div className="col-md-6">
    <PersonDetails personId={this.state.selectedPerson} />
  </div>
</div>
```

## Render-функции
Паттерн, в котором в компонент в качестве пропса передаётся функция, которая занимается рендерингом всего компонента или его части. Такая функция возвращает строку, react-элемент или разметку jsx.
Это чем-то похоже на функцию .filter, которая решает, что оставить (в данном случае, что отобразить).

Допустим, надо сделать так, чтобы в списке персонажей рядом с именем отображались также пол и возраст, а в списке планет – диаметр, для кораблей – модель. Т.е. должна быть какая-то дополнительная информация.

До сих пор все элементы списков отображались одинаково. Внутри компонента item-list есть функция renderItems. Она печатает только свойство name и это свойство есть у всех сущностей.

```js
// item-list.js
renderItems(arr) {
  return arr.map(({id, name}) => {
    return (
      <li 
        className="list-group-item"
        key={id}
        onClick={() => this.props.onItemSelected(id)}
      >
        {name} // здесь
      </li>
    );
  });
}
```

Теперь требования изменились и в зависимости от типа сущностей надо отображать разную информацию. 
Один из способов решить эту задачу – использвать render-функцию и передавать её через пропсы.

Функция renderItem() (внутри компонента item-list) получает на вход item и возвращает то, что надо будет отрисовать.
Такие же измненения надо внести в компонент people-page, потому что там тот же самый код.
```js
// app.js
<div className="row mb2">
  <div className="col-md-6">
    <ItemList 
      onItemSelected={this.onPersonSelected}
      getData={this.swapiService.getAllStarships}
      renderItem={(item) => item.name} // здесь
    />
  </div>
  <div className="col-md-6">
    <PersonDetails personId={this.state.selectedPerson} />
  </div>
</div>
```

Теперь надо перейти в компонент item-list и использовать эту рендер-функцию: заменить прошлый блок {name} на результат вызова рендер-функции. Name больше не используется, его не надо дестриктуризировать, а вместо person в массиве содержится любой элемент, поэтому он заменятся на item.
```js
item-list.js

renderItems(arr) {
  // было return arr.map((person) => {
  return arr.map((item) => {
    const { id } = item;
    const label = this.props.renderItem(item);

    return (
      <li 
        className="list-group-item"
        key={id}
        onClick={() => this.props.onItemSelected(id)}
      >
        {label} // здесь
      </li>
    );
  });
}
```

Теперь для каждого компонента ItemList можно определять, что он будет выводить с помощью рендер-функции. Так можно сделать в app.js и в people-page.js:
```js
<ItemList
//onItemSelected={this.onPersonSelected}
//getData={this.swapiService.getAllPeople}
  renderItem={(item) => `${item.name} (${item.gender}, ${item.birthYear})`}/>

// сразу деструктуризировать:
  renderItem={({name, gender, birthYear}) => `${name} (${gender}, ${birthYear})`}/>
```

Пока что возвращается только текст для отображения в li. Можно пойти дальше и вернуть JSX-разметку. В примере ниже будет создаваться кнопка:
```jsx
renderItem={(item) => (<span> {item.name} <button>!</button> </span>)}
```

```js
```
