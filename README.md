# react-patterns
Паттерны React: описание и примеры.

Темы:
Зачем нужны паттерны?
Использование функций
Render-функции
Свойства-элементы


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

## Свойства-элементы (контейнеры)
В качестве свойств в компонент можно передавать другие react-элементы. 

Сейчас на странице отображаются 2 элемента рядом: список персонажей и их детализация. Может понадобиться в дальнейшем создавать группы компонентов в таком же формате: список кораблей и их детализация и т.д.
Чем больше копипасты – тем сложнее поддерживать код, потому что придётся делать несколько одинаковых правок сразу в нескольких местах. Для этого разметку (не имеющиеся сейчас компоненты, а именно разметку, в которую они обёрнуты), можно вынести в отдельный компонент. Это именно создание компонента из разметки: кода html и стилей без сложного функционала и логики.

Можно сделать компонент-контейнер, который будет принимать через пропсы другие компоненты и правильно их размещать. Этот контейнер должен уметь работать с любыми двумя компонентами, которые нужно разнести по двум сторонам, а не предзаданными. Соответственно, у него в пропсах будут 2 свойства: left и right.

После этого, если понадобится переиспользовать разметку, не нужно будет копировать html, а достаточно переимпользовать этот компонент.

Кроме того, можно прикрутить логику, чтобы такие элементы могли выбирать, что рендерить в зависимости от условия (загрузка, ошибка и т.д.).

Было:
```js
//people-page.js
render() {
  if (this.state.hasError) {
    return <ErrorIndicator />;
  }
    
  return (
    <div className="row mb2">
      <div className="col-md-6">
        <ItemList
          onItemSelected={this.onPersonSelected}
          getData={this.swapiService.getAllPeople}
          renderItem={({name, gender, birthYear}) => `${name} (${gender}, ${birthYear})`}/>
      </div>
      <div className="col-md-6">
        <PersonDetails personId={this.state.selectedPerson} />
      </div>
    </div>
  );
};
```

В файле people-page.js для удобства в отдельные константы будут вынесены itemList и personDetails, потому что сейчас эти компоненты разрастаются, в их пропсы передаётся много кода.
Вся окружающая их разметка будет вынесена в отдельный компонент Row.

Стало:
```js
// row.js
const Row = ({ left, right }) => {
  return (
    <div className="row mb2">
      <div className="col-md-6">
        {left}
      </div>
      <div className="col-md-6">
        {right}
      </div>
    </div>
  );
};


// people-page.js
render() {
  if (this.state.hasError) {
    return <ErrorIndicator />;
  }

  const itemList = (
    <ItemList
      onItemSelected={this.onPersonSelected}
      getData={this.swapiService.getAllPeople}
      renderItem={({name, gender, birthYear}) => `${name} (${gender}, ${birthYear})`}
  />);

  const personDetails = (
    <PersonDetails personId={this.state.selectedPerson} />
  );

  return (
    <Row left={itemList} right={personDetails} />
  );
};
```

Для приложения можно создать также другие элементы-контейнеры, чтобы переиспользовать блоки html и css. Например, вместо random-planet можно сделать элемент-контейнер, который будет заниматься не только планетами.


## Children + ErrorBoundry
Документация по API Children тут: https://reactjs.org/docs/react-api.html#reactchildren.

Есть 2 способа передавать свойства компонентам (равнозначны):
- передавать пары ключ-значения, похожие на атрибуты в html;
- записать что-то в тело компонента.


```js
<Component>
  Hello, {[1, 2, 4]}
</Component>
```

Сейчас в файле people-page.js компонент ItemList получает рендер функцию так:
```js
// people-page.js 
<ItemList
  onItemSelected={this.onPersonSelected}
  getData={this.swapiService.getAllPeople}
  renderItem={({name, gender, birthYear}) => `${name} (${gender}, ${birthYear})`}
/>
```

Поскольку рендер-функция отвечает за то, что будет выведено на экран, её можно передать в теле компонента. Деструктуризации больше нет, чтобы всё было более читаемо. 
```js
// people-page.js

const itemList = (
  <ItemList
    onItemSelected={this.onPersonSelected}
    getData={this.swapiService.getAllPeople}
  >
    {(i) => (
      `${i.name}, (${i.birthYear})` // вот тут
    )}
        
  </ItemList>
);
```

Теперь надо сделать так, чтобы сам компонент ItemList мог получить доступ к содержимому тела. Доступ к такой информации можно получить через this.props.children.
.children работает только в том случае, если из компонента App удалить разметку, которая «не компонент» и создаёт другие пары: корабли и планеты.

Было:
```js
renderItems(arr) {
  return arr.map((item) => {
    const { id } = item;
    const label = this.props.renderItem(item);
```

Стало:
```js
renderItems(arr) {
  return arr.map((item) => {
    const { id } = item;
    const label = this.props.children(item);
```


**ErrorBoundry**
С помощью children можно передавать дерево компонентов. Предлагается выделить в отдельный компонент ErrorBoundry. Он будет заниматься выскакивающей ошибкой. Компонент может получить один или несколько элементов в качестве children и он отрендерит их точно в таком виде, в котором получил.

Из компонента people-page переезжают в отдельный компонент ErrorBoundry:
- метод жизненного цикла componentDidCatch
- hasError из стейта.

В компоненте ErrorBoundry поступаем так же, как обычно при обработке ошибок. Этот компонент будет решать, что ему возвращать: компонент-ошибку или props.children.
В такой компонент можно обернуть любой другой компонент и ErrorBoundry автоматом будет отлавливать все ошибки, которые происходят в его children.

В примере ниже в ErrorBoundry можно обернуть компонент Row целиком и/или PersonDetails и удалить из этих компонентов их собственные обработчики ошибок. Компонент-обёртка ErrorBoundry будет отлавливать всё.
```js
// error-boundry.js
class ErrorBoundry extends Component {
  state = {
    hasError: false
  };

  componentDidCatch() {
    this.setState({
      hasError: true
    });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorIndicator />
    }

    return this.props.children;
  };
};


// people-page.js
  render() {

    const itemList = (
      <ItemList
        onItemSelected={this.onPersonSelected}
        getData={this.swapiService.getAllPeople}
      >
        {(i) => (
          `${i.name}, (${i.birthYear})`
        )}
        
      </ItemList>
    );

    const personDetails = (
      <ErrorBoundry>
        <PersonDetails personId={this.state.selectedPerson} />
      </ErrorBoundry>
    );

    return (
      <ErrorBoundry>
        <Row left={itemList} right={personDetails} />
      </ErrorBoundry>
    );
  }
```

## рефакторинг компонента person-details.js в item-details
Файл person-details.js и все person-переменные переименовываются в item-details.js и item соответственно.

Поскольку item-details должен работать с любыми данными, наружу в пропсы выносятся некоторые функции.
В State добавляется поле image, чтобы хранить «универсальное» изображение, которое туда записывается после загрузки данных:
```js
//app.js
  const { getPerson, getStarship } = this.swapiService;
    
  const personDetails = ( <ItemDetails 
    itemId={11} 
    getData={getPerson} 
    getImageUrl={}/> );
  
    const starshipDetails = ( <ItemDetails 
    itemId={5} 
    getData={getStarship} 
    getImageUrl={}/> );


//item-details.js
  state = {
    item: null,
    loading: false,
    image: null
  }

  getData(itemId)
    .then((item) => {
      this.setState({ item, loading: false, image: getImageUrl(item) });
    });
```

В Swapi-Service добавляются функции для получения изображений персонажей, кораблей и планет. Эти функции будут передаваться в item-details как пропсы для получения того или иного изображения:
```js
//swapi-service.js
  _imageBase = 'https://starwars-visualguide.com/assets/img';

  getPersonImage = ({id}) => {
    return `${this._imageBase}/characters/${id}.jpg`
  };

  getStarshipImage = ({id}) => {
    return `${this._imageBase}/starships/${id}.jpg`
  };

  getPlanetImage = ({id}) => {
    return `${this._imageBase}/planets/${id}.jpg`
  };
```

## Работа с props.children API
Сейчас компонент item-details хорошо работает только с персонажами, потому что у кораблей нет полей «возраст», «цвет глаз» и т.д., а Gener, Birth Year и Eye Color захардкожены. Эти значения надо вынести наружу и сделать так, чтобы компонент можно было конфигурировать.

Решить задачу можно несколькими способами.
Например, передавать в пропсы объект с конфигурацией типа fields = {[ {field: 'gender', label:' Gender'} ]}. Такой код – не в духе React (Юра говорит), потому что не соблюдается принцип компонентности.

Надо знать наименование полей объекта и сам объект с данными. Это можно реализовать с функцией Record, которая будет создавать li-элементы. Её параметры: item – сам элемент, field – поле, которое надо достать из объекта и  label – запись на ui.

Было (захардкожено и заточено под конкретные данные):
```js
<ul className="list-group list-group-flush">

  <li className="list-group-item">
    <span className="term">Gender</span>  // здесь
    <span>{gender}</span>  // здесь
  </li>

  <li className="list-group-item">
    <span className="term">Birth Year</span>  // здесь
    <span>{birthYear}</span>  // здесь
  </li>

</ul>
```

Стало (пока добавить в этот файл функцию record):
```js
// item-details.js
const Record = ({item, field, label}) => {
  return (
    <li className="list-group-item">
    <span className="term">{label}</span>
    <span>{ item[field] }</span>
  </li>
  );
};

export { Record };


// app.js
import ItemDetails, { Record } from '../item-details';

    const personDetails = ( 
      <ItemDetails 
        itemId={11} 
        getData={getPerson} 
        getImageUrl={getPersonImage}
          >
          <Record field='gender' label='Gender' />
          <Record field='eyeColor' label='Eye Color' />
      </ItemDetails> );
```

Это не всё «стало», продолжение ниже.

**API Children**
Чтобы Record заработал, ему надо знать item, из которого он будет доставать все эти данные. Т.е. сейчас можно достать детей (функции Record) и вывести их на экран их содержимое через {  this.props.children }, но нужно как-то обратиться к родительскому объекту, чтобы получить доступ к его полям. Так, например, item и item[field] пока не доступны.

Для работы с детьми есть специальный API Children, документация по нему тут.
Дело в том, что children может быть строкой, элементом, числом, чем угодно. Функция React.children.map сделает так, чтобы не надо было задумываться, какого именно типа child сейчас попался, он пройдётся по каждому child и обработает все специальные случаи типа null или undefined. Можно заменять и обрабатывать child-элементы как угодно, можно возвращать вместо них null и тем самым скрывать, можно оборачивать… не обязательно возвращать их в том виде, как они поступают.

В данном случае, в каждый child надо передать item.
```js
// item.details, class ItemDetails на том месте, где было захардкожено

<div className="card-body">
  <h4>{name}</h4>
  <ul className="list-group list-group-flush">
    {
      React.Children.map(this.props.children, (child, idx) => {  // здесь 
        return <li>{idx}</li>;
      })
    }
  </ul>
  <ErrorButton />
</div>
```
Это не весь рефактор, сейчас пока он не работает правильно, потому что нет доступа к item, см. следующий раздел.

## Клонирование элементов
React.Children.map() позволяет проитерироваться по this.props.children и сделать что-нибудь с каждым child и вернуть что угодно. Есть одно правило: react-элементы нельзя изменять после того, как они были созданы, с ними надо работать так, будто они неизменяемые. Поэтому нельзя написать внутри map-функции child.item = item.

Вместо этого надо создать новый элемент, в котором есть новое свойство item. Для этого есть ещё один метод: React.cloneElement(). Документация тут.
Копирует и возвращает новый реакт-элемент.
Config должен содержать все новые props, key или ref. Возвращаемый элемент будет иметь все старые + новые props. Новые children заменят существующих children.

```js
React.cloneElement(element, [config], [...children])

// Почти эквивалентно этому
// <element.type {...element.props} {...props}>{children}</element.type>
```

Вот итоговая реализация:
Был создан дополнительный компонент **Record** (запись). 
Ему необходимы 3 поля: «field», «label» и «item». Первые 2 передаются через app, а item нельзя сразу передать, потому что эти данные получаются внутри компонента ItemDetails и снаружи их получить никак нельзя. Внешний код ничего не знает о том, как создаётся объект item.

Для того, чтобы всё-таки передать объект item в child-элементы ItemDetails, была осуществлена итерация по каждому child с помощью React.**Children**.map() и внутри каждый child был преобразован с помощью React.**cloneElement**(), с помощью которого элементу был передан готовый к этому времени item.

```js
// app.js
import ItemDetails, { Record } from '../item-details';
    const personDetails = (
      <ItemDetails 
        itemId={11} 
        getData={getPerson} 
        getImageUrl={getPersonImage}
      >
        <Record field='name' label='Name' />
        <Record field='gender' label='Gender' />
        <Record field='eyeColor' label='Eye Color' />
      </ItemDetails> );



// item-details.js
const Record = ({item, field, label}) => {
  return (
    <li className="list-group-item">
    <span className="term">{label}</span>
    <span>{ item[field] }</span>
  </li>
  );
};


export default class ItemDetails extends Component {
…state = {
    item: null,  // item изначально нет, его надо запросить по сети
    loading: false,
    image: null
  }

  updateItem() {
    …getData(itemId)
      .then((item) => {
        this.setState({ item, loading: false, image: getImageUrl(item) }); // тут получается item
      });
  }

  render() {
    const { name, item, loading, image } = this.state;  // item достаётся из state
    …return (
       …<ul className="list-group list-group-flush">
          {
            React.Children.map(this.props.children, (child) => {  // вот тут вся соль
              return React.cloneElement(child, {item});
            })
          }
        </ul>
```

## Компоненты высшего порядка (HOC)
Работа с itemList (списко персонажей, кораблей и т.д.).
Как у любого другого сетевого компонента, его работа состоит из нескольких фаз:
1. В componentDidMount() делаем запрос, получаем данные, обновляем state.
2. В render() проверяем, если есть данные, то их отображаем. Если данных нет – отображаем спиннер.

Чтобы создать новый сетевой компонент, не обязательно копировать весь этот код (который отправляет запрос, проверяет наличие данных, обновляет state, отображает спиннер, ошибку и т.д.). На самом деле, меняются только 2 аспекта: как делается запрос и как отображается результат на экране.

Чтобы сделать этот код лучше, существует паттерн HOC.

Цель – вынести сетевой код, отображение данных и ошибку в отдельную конструкцию и переиспользовать с другими компонентами.

В JS функция может возвращать другую функцию и/или класс.
Вместо экспорта класса, можно экспортировать функцию (её вызов), которая возвращает класс.
```js
// возврат функции
const f = (a) => {
  return (b) => {
    console.log(a + b);
  }
};
f(1)(2);


// возврат класса
const f = () => {
  return ItemList;
};

export default f();
```

В JS можно создавать безымянные функции и безымянные классы. Таким оразом будет возвращён новый класс, у которого нет имени, но есть содержимое. В примере ниже возвращается анонимный класс, который наследует Component и у него есть функция render():
```js
const f = () => {
  return class extends Component {
    render() {
      return <p>Hi</p>
    }
  };
};

export default f();
```

Поскольку внутренний анонимный класс – это компонент, значит в него можно передать componentDidMount() или любую другую функцию жизненного цикла:
```js
const f = () => {
  return class extends Component {

    componentDidMount() {
      console.log(this.props);
    }

    render() {
      return <p>Hi</p>
    }
  };
};

export default f();
```

Поскольку возврат функции (а функция возвращает анонимный класс) экспортируется под именем ItemList (переименование происходит в index.js, тут я её называю anonim), то она получает все пропсы (в т.ч. children), которые в неё передаются в App (выведутся в консоль), а именно:
```js
<AnonimItemList
  onItemSelected={this.onPersonSelected}
  getData={this.swapiService.getAllPeople}
>

  { ({name}) => <span>{name}</span> }

</ AnonimItemList >
```

Следующий шаг – сделать полноценный компонент-класс <ItemList>, в этом же файле создать функцию высшего порядка, которая будет брать на себя все рассчёты и запросы, а возвратит компонент-класс <ItemList> и «напихает» ему уже полученных пропсов.

В примере ниже создана обёртка, которая не делает ничего. Она получает пропсы, как в примере выше, и возвращает класс <ItemList/> и передаёт ему свои пропсы. Всё будет работать, как и раньше:
```js
class ItemList extends Component {
  …объявление класса
}

const f = () => {
  return class extends Component {

    render() {
      return <ItemList {...this.props} />;
    }
  };
};
export default f();


app.js
const list = <ItemList
  onItemSelected={this.onPersonSelected}
  getData={this.swapiService.getAllPeople}
>
  { ({name}) => <span>{name}</span> }
</ItemList>
```


**HOC**
Финальный шаг – вынести в обёртку всю логику из оригинального компонента:
- работа с сетью
- спиннер
- ошибка
- что отображать по клику

State, componentDidMount, логика спиннера и данные пеерезжают из компонента в обёртку. Переменная itemList переименовывается на data.
```js
// item-list.js

// компонент, который надо вернуть
class ItemList extends Component {
  renderItems(arr) {
    return arr.map((item) => {
      const { id } = item;
      const label = this.props.children(item);
      return (
        <li 
          className="list-group-item"
          key={id}
          onClick={() => this.props.onItemSelected(id)}
        >
          {label}
        </li>
      );
    });
  }

  render() {
    const { data } = this.props;
    const items = this.renderItems(data);

    return (
      <ul className="item-list list-group">
        {items}
      </ul>
    );
  }
}


// возврат класса
const f = () => {
  return class extends Component {

    state = { data: null };
  
    componentDidMount() {
      const { getData } = this.props;

      getData()
        .then((data) => {
          this.setState({
            data
          });
      });
    }

    render() {
      const { data } = this.state;
      if (!data) return <Spinner />;
  
      return <ItemList {...this.props} data={data} />;
    };
  };
};

export default f();


// app.js
import ItemList from '../item-list';

<ItemList
  onItemSelected={this.onPersonSelected}
  getData={this.swapiService.getAllPeople}
>
  { ({name}) => <span>{name}</span> }
</ItemList>
```

Единственная зависимость, которая осталась – компонент знает, что работает с ItemList и заточен под него.
В функцию f можно передать аргумент, который будет являться совершенно любым компонентом вместо ItemList.
F переименована в withData чтобы было понятно, что она делает.
```js
const withData = (View) => {
  return class extends Component {

    state = { data: null };
  
    componentDidMount() {
      const { getData } = this.props;

      getData()
        .then((data) => {
          this.setState({
            data
          });
      });
    }

    render() {

      const { data } = this.state;
      if (!data) return <Spinner />;
  
      return <View {...this.props} data={data} />;
    };
  };
};

export default withData(ItemList);
```

Таким образом, ItemList разделён на 2 части. Одна отвечает только за отрисовку, а вторая – за логику работы с сетью. Функция нужна для того, чтобы можно было выбирать (передавать в её параметр), какой именно компонент будет заниматься отображением данных.

Следующий шаг: поскольку itemList не содержит state, из него можно сделать компонент-функцию.
Обёртка больше не получает GetData в пропсах, теперь это делается явно при экспорте.
Поскольку логика и отрисовка больше не связаны друг с другом, можно раскидать их по разным файлам.

**Итоговая реализация** (ErrorIndicator пока не прикручен):

item-list.js
```js
import React from 'react';
import SwapiService from '../../services/swapi-service';
import { withData } from '../hoc-helpers/';
import './item-list.css';


const ItemList = (props) => {

  const { data, onItemSelected, children: renderLabel } = props;

  const items = data.map((item) => {
    const {id} = item;
    const label = renderLabel(item);
    return (
      <li 
        className="list-group-item"
        key={id}
        onClick={() => onItemSelected(id)}
      >
        {label}
      </li>
    );
  });

  return (
    <ul className="item-list list-group">
      {items}
    </ul>
  );
};

const { getAllPeople } = new SwapiService();

export default withData(ItemList, getAllPeople);
```

with-data.js
```js
import React, { Component } from 'react';
import Spinner from '../spinner';
import ErrorIndicator from '../error-indicator';

const withData = (View, getData) => {
  return class extends Component {
    
    state = { data: null };

    componentDidMount() {
      getData()
        .then((data) => {
          this.setState({ data });
      });
    }

    render() {
      const { data } = this.state;

      if (!data) return <Spinner />;
  
      return <View {...this.props} data={data} />;
    };
  };
};

export default withData;
```

app.js
```js
<ItemList
  onItemSelected={this.onPersonSelected}
  getData={this.swapiService.getAllPeople}
>
  { ({name}) => <span>{name}</span> }
</ItemList>
```

## Рефакторинг, вынос больших компонентов
Если компонент гибкий с т.з. настройки, то он начинет разрастаться в объёме и его сложно читать в общем потоке кода: очень много конфигурационных параметров. Хорошее решение – вынести такие компоненты с раздутой конфигурацией в отдельные файлы и затем импортировать их.

В папке sw-components хранятся новые компоненты: item-lists.js и details.js

Последние 2 строчки в ItemList удалить, экспортировать только сам ItemList
```js
// item-list.js
// Было
const { getAllPeople } = new SwapiService();
export default withData(ItemList, getAllPeople);

// Стало
export default ItemList;
```

item-lists.js
```js
// import React from 'react';
// import ItemList from '../item-list';
// import { withData } from '../hoc-helpers';
// import SwapiService from '../../services/swapi-service';

const swapiService = new SwapiService();
const { getAllPeople, getAllStarships, getAllPlanets } = swapiService;

const PersonList = withData(ItemList, getAllPeople);
const PlanetList = withData(ItemList, getAllPlanets);
const StarshipList = withData(ItemList, getAllStarships);

// export { PersonList, PlanetList, StarshipList };
```

details.js (не используется HOC, потом упаковать)
```js
// import Rect from 'react';
// import ItemDetails, { Record } from '../item-details';
// import SwapiService from '../../services/swapi-service';

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

// export { PersonDetails, PlanetDetails, StarshipDetails };
```

Использование в App.js
```js
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
```

## Композиция компонентов высшего порядка
Композиция – применение одной функции к результату другой: f(g(x)).
Композиция HOC – это использование одних HOC внутри других HOC.

Сейчас в компоненты-листы всё ещё надо явно передавать children, в котором хранится рендер-функция. Чтобы от этого избавиться, можно использовать ещё одну функцию высшего порядка.

Функция withChildFunction умеет брать любой компонент и вставлять ему что-то в качестве children.
Wrapped – это компонент, который она будет оборачивать.
fn – функция, которую надо передать в качестве props.children во Wrapped-компонент.

Рендер-функции тоже могут быть разными.
«renderName» и «renderModelAndName» немного отличаются и выводят на экран разный текст. 
```js
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

// рендер-функции для персонажей и кораблей пойдут в children
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
```

Использование в app.js
```js
<PersonList />
<StarshipList />
<PlanetList />
```
Теперь детали конфигурации скрыты. Использовать такие компоненты в разы легче.


## Контекст API
Context API решает проблему проброса свойств (property drill) от компонентов верхнего уровня до компонентов нижнего.
Контекст позволяет создать специальное хранилище данных и эти данные будут доступны для всех дочерних компонентов без необходимости явно передавать эти свойства.
Гугли dependency injection.

На практике вызывается функция, которая возвращает объект, в котором хранятся создаются 2 компонента: Provider и Consumer.

Кратко:
```js
import React from 'react';

// 1. создать контекст через функцию (можно сразу деструктуризировать)
const { Provider, Consumer } = React.createContext()


// 2. Обернуть в Provider компоненты-потребители
<SwapiServiceProvider value={this.swapiService}>      
  <div className='app'>
    <PersonList />
    <StarshipList />
    <PlanetList />
  </div>
</SwapiServiceProvider>


// 3. Через Consumer вытащить переданное значение
const PersonDetails = () => {
  return (
    <SwapiServiceConsumer>
      {
        (swapiService) => {
          return (
            <ItemDetails getData={swapiService.getPerson} />
          );
        }
      }  
    </SwapiServiceConsumer>
  );
};
```

**createContext**
```js
import React from 'react';

const myContext = React.createContext(defaultValue)

const { Provider, Consumer } = React.createContext()

const { Provider : SwapiProvider, Consumer : SwapiConsumer } = React.createContext()
```
Функция возвращает объект контекста. 
Этот объект можно сразу деструктуризировать на константы-компоненты Provider и Consumer.
Provider – компонент, который хранит передаваемое значение
Consumer – компонент, который будет потреблять это значение.

Аргумент default будет использован только в том случае, если у компонента нет соответствующего Provider в иерархии над ним. Если Consumer не сможет найти никакого Provider, он будет использовать значение default.


**Provider**
Передаёт значение из своего пропса компонентам-потребителям.
```js
<MyContext.Provider value={someValue}>
```

**Consumer**
Считывает значение из Provider. Внутри содержит функцию, которая принимает на вход свойство-пропс из Provider, а возвращает любые компоненты, которые используют это переданное из provider свойство.
```js
<ChildElement>
  <Consumer>
    {
      (lang) => {
        return (
          <Chat lang={lang} />
        )
      }
    }
  </Consumer>
</ChildElement>
```

## Использование Context API
С помощью контекста элементы смогут получать сервис, а не создавать каждый для себя его инстансы.
Рефакториться будут details-элементы.

Создаётся новая директория:
```
components
  swapi-service-context
    index.js
    swapi-service-context.js
```

Весь код – это создать Provider и Consumer и экспортировать их.
При создании они сразу переименовываются в swapi-поставщик и swapi-потребитель.
```js
// swapi-service-context.js
import React from 'react';

const { 
  Provider : SwapiServiceProvider,
  Consumer: SwapiServiceConsumer 
} = React.createContext();

export { SwapiServiceProvider, SwapiServiceConsumer };
```

Теперь можно пойти в компонент самого высшего уровня и использовать контекст, чтобы у всех компонентов был доступ к тому значению, которое передаём:
```js
// app.js
import { SwapiServiceProvider } from '../swapi-service-context/swapi-service-context';

return (
  <ErrorBoundry>
    <SwapiServiceProvider value={this.swapiService}>
      
      <div className='app'>
        <Header />
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
```

Теперь в details можно получить это значение.
Импорт потребителя, обернуть в него элементы, которые ждут передаваемое значение. 
Важный нюанс – потребитель передаёт значение как аргумент функции. Следовательно, он должен вернуть все оборачиваемые компоненты.

Аргумент swapiService – это именно то значение, которое было передано в Provider по иерархии выше.
```js
// .details.js.

const PersonDetails = ({ itemId }) => {
  return (
    <SwapiServiceConsumer>
      {
        (swapiService) => {
          return (
            <ItemDetails 
              itemId={itemId} 
              getData={swapiService.getPerson} 
              getImageUrl={swapiService.getPersonImage}
            >
            <Record field='gender' label='Gender' />
            <Record field='eyeColor' label='Eye Color' />
          </ItemDetails>
          );
        }
      }  
    </SwapiServiceConsumer>
  );
};
```

Можно сразу же деструктуризировать:
```js
<SwapiServiceConsumer>
  {
    // (swapiService) => {
    ({getPerson, getPersonImage}) => {
      return (
        <ItemDetails 
          itemId={itemId} 
          getData={getPerson} 
          getImageUrl={getPersonImage}
        >
        <Record field='gender' label='Gender' />
        <Record field='eyeColor' label='Eye Color' />
      </ItemDetails>
      );
    }
  }  
</SwapiServiceConsumer>
```

То же самое проделать с кораблями и планетами и swapiService можно выпиливать из details.js.

Теперь для того, чтобы изменить данные, которые запрашиваются по сети, на локальные тестовые данные, достаточно сделать так:
```js
// app.js
import DummySwapiService from '../../services/dummy-swapi-service';
swapiService = new DummySwapiService();
```

Таким же макаром можно подменять данные, если сервис будет выдавать ошибку или долго грузиться.
Сейчас этот код выглядит громоздко, но его можно улучшить с HOC.


## Использование HOC для работы с контекстом
Details.js в каталоге sw-components надо разбить на 3 отдельных файла: PersonDetails, PlanetDetails, StarshipDetails.

Задача получения контекста должна быть вынесена в компонент высшего порядка.
В каталоге hoc-components создаётся компонент WithSwapiService. Вместо всего кода, который повторялся, можно использовать эту HOC-функцию.
```js
// with-swapi-service.js
import React from 'react';
import { SwapiServiceConsumer } from '../swapi-service-context/';

const withSwapiService = (Wrapped) => {

  return (props) => {
    return (
      <SwapiServiceConsumer>
        {
          (swapiService) => {
            return (
              <Wrapped {...props} swapiService={swapiService} />
            )
          }
        }
      </SwapiServiceConsumer>
    );
  }
};

export default withSwapiService;
```

В файле person-details.js можно удалить всё, что работает с контекстом, а экспорт обернуть в withSwapiService. Также, надо вытащить переданный HOC-ом в пропсы swapiService.
```js
// person-details.js

import React from 'react';
import ItemDetails, { Record } from '../item-details';
import { withSwapiService } from '../hoc-helpers';


const PersonDetails = ({ itemId, swapiService }) => { 
  const { getPerson, getPersonImage } = swapiService;

  return (
    <ItemDetails 
      itemId={itemId} 
      getData={getPerson} 
      getImageUrl={getPersonImage}
    >
      <Record field='gender' label='Gender' />
      <Record field='eyeColor' label='Eye Color' />
  </ItemDetails>
  );

};

export default withSwapiService(PersonDetails);
```

Таким образом, HOC взял на себя функцию «выплёвывания» wrapped-компонента и передачи ему в пропсы swapiService.


## Трансформация props в компонентах HOC
Вместо того, чтобы передавать весь swapiService в PersonDetails, можно туда передать исключительно те методы, которые нужны этому компоненту: getPerson и getPersonImage.
Ещё лучше – если передать getPerson под именем getData, а getPersonImage – как getImageUrl, потому что именно с такими именами работают details-компоненты.

Правила этой передачи проще всего описать функцией map.
Эта функция должна использоваться в withSwapiService в качестве второго параметра для вычленения нужных данных.
```js
// Person-details.js

import React from 'react';
import ItemDetails, { Record } from '../item-details';
import { withSwapiService } from '../hoc-helpers';


// было
const PersonDetails = ({ itemId, swapiService }) => {
  const { getPerson, getPersonImage } = swapiService;

  return (
    <ItemDetails 
      itemId={itemId} 
      getData={getPerson} 
      getImageUrl={getPersonImage}
    >
      <Record field='gender' label='Gender' />
      <Record field='eyeColor' label='Eye Color' />
  </ItemDetails>
  );

};

const PersonDetails = ({ itemId, getData, getImageUrl }) => {

  return (
    <ItemDetails 
      itemId={itemId} 
      getData={getData} 
      getImageUrl={getImageUrl}
    >
      <Record field='gender' label='Gender' />
      <Record field='eyeColor' label='Eye Color' />
  </ItemDetails>
  );

};


const mapMethodsToProps = (swapiService) => {
  return { 
    getData: swapiService.getPerson,
    getImageUrl: swapiService.getPersonImage
  }
};

export default withSwapiService(PersonDetails, mapMethodsToProps);
```

Поскольку передаваемые пропсы теперь полностью соответствуют наименованию требуемых свойств, можно сократить их так:
```js
// Person-details.js

import React from 'react';
import ItemDetails, { Record } from '../item-details';
import { withSwapiService } from '../hoc-helpers';

const PersonDetails = (props) => {

  return (
    <ItemDetails ...props>
      <Record field='gender' label='Gender' />
      <Record field='eyeColor' label='Eye Color' />
  </ItemDetails>
  );

};


const mapMethodsToProps = (swapiService) => {
  return { 
    getData: swapiService.getPerson,
    getImageUrl: swapiService.getPersonImage
  }
};

export default withSwapiService(PersonDetails, mapMethodsToProps);
```

Переделка with-swapi-service.js под функцию map:
```js
// with-swapi-service.js

import React from 'react';
import { SwapiServiceConsumer } from '../swapi-service-context/';

const withSwapiService = (Wrapped, mapMethodsToProps) => {

  return (props) => {
    return (
      <SwapiServiceConsumer>
        {
          (swapiService) => {
            const serviceProps = mapMethodsToProps(swapiService);

            return (
              <Wrapped {...props} {...serviceProps} />
            );
          }
        }
      </SwapiServiceConsumer>
    );
  }
};

export default withSwapiService;
```


Теперь надо обновить list-компоненты. Сейчас они используют with-data.
WithData вторым аргументом получал getData как внешний аргумент. Но withSwapiService уже умеет передавать нужные функции для запроса данных, поэтому getData больше не надо передавать в явном виде.
Вместо этого можно взять getData из props.

Было:
```js
// with-data.js

import React, { Component } from 'react';
import Spinner from '../spinner';

const withData = (View, getData) => {
  return class extends Component {
    
    state = { data: null };

    componentDidMount() {
      getData()
        .then((data) => {
          this.setState({
            data
          });
      });
    }

    render() {
      const { data } = this.state;

      if (!data) return <Spinner />;
  
      return <View {...this.props} data={data} />;
    };
  };
};


export default withData;
```

Стало:
```js
// with-data.js

import React, { Component } from 'react';
import Spinner from '../spinner';

const withData = (View) => {
  return class extends Component {
    
    state = { data: null };

    componentDidMount() {
      this.props.getData()
        .then((data) => {
          this.setState({
            data
          });
      });
    }

    render() {
      const { data } = this.state;

      if (!data) return <Spinner />;
  
      return <View {...this.props} data={data} />;
    };
  };
};


export default withData;
```


Обновление списков
Было:
```js
// item-lists.js

import React from 'react';
import ItemList from '../item-list';
import SwapiService from '../../services/';

// удаляется полностью
// const swapiService = new SwapiService();
// const { getAllPeople, getAllStarships, getAllPlanets } = swapiService;


const withChildFunction = (Wrapped, fn) => {
  return (props) => {
    return (
      <Wrapped {...props}>
        {fn}
      </Wrapped>
    );
  }
};

const renderName = ({ name }) => <span>{name}</span>;
const renderModelAndName = ({ model, name }) => <span>{name} ({model})</span>

const PersonList = withData(
  withChildFunction(ItemList, renderName),
  // getAllPeople); в явном виде не надо

const PlanetList = withData(
  withChildFunction(ItemList, renderName),
  // getAllPlanets); в явном виде не надо

const StarshipList = withData(
  withChildFunction(ItemList, renderModelAndName),
  // getAllStarships); в явном виде не надо

export { PersonList, PlanetList, StarshipList };
```

Стало:
```js
item-lists.js

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
```


## Обновление контекста
Контекст не обязательно должен быть статичным, его можно обновлять «на лету». Он работает так же, как любые другие компоненты: если value обновилось, то компоненты ниже по иерархии получат обновлённое значение.
Это может пригодиться, если приложение поддерживает смену языков, темы визуального оформления и т.д.

Важно, что компоненты должны уметь правильно реагировать на изменение контекста. Обычно компоненты реагируют на изменения элементов, которые рендерятся на странице (например, новое значение строки). Надо прописать соответствующие условия в их componentDidUpdate, чтобы компоненты сравнивали предыдущие и новые функции получения (getData) данных из props. Ниже про это будет написано.

Сейчас через контекст передаётся swapiService. Если залезть в App.js, то в нём можно переписать swapi на dummySwapi. Такое переключение можно реализовать через кнопку на странице, которая будет обновлять контекст.

1. Объявить onServiceChange в app.js и передать его через пропсы в header.
2. В header.js добавить кнопку, повесить на неё onServiceChange.

Как реализовать смену значения в сервисе?
Сейчас сервис – это просто поле класса и не находится в state. Если его обновить, то React не узнает, что приложение надо перерисовать. В этой связи, swapiService надо перенести в state и обновить код, который его использует.

onServiceChange
При переключении надо знать предыдущее значение state чтобы знать, на что переключиться. Поэтому в setState передаётся функция.
```js
// Header.js
const Header = ({ onServiceChange }) => {
  return (
    ...
    <button onClick={onServiceChange} > Change Service </button>


// App.js
state = {
  showRandomPlanet: true,
  swapiService: new SwapiService()
};

onServiceChange = () => {
  this.setState(({ swapiService }) => {

    const Service = swapiService instanceof SwapiService ? DummySwapiService : SwapiService;
    return { swapiService: new Service() };
  });
}


<SwapiServiceProvider value={this.state.swapiService}>

<Header onServiceChange={this.onServiceChange} />
```

Если всё оставить в таком виде, то service действительно будет меняться, но компоненты не будут обновляться. Причина – компоненты обновляются только тогда, когда меняется их id. Поскольку нужно сохранить старый id, но вынудить компонент обновиться, надо дописать им в update это:
```js
// Item-details.js
componentDidUpdate(prevProps) {
  if (this.props.itemId !== prevProps.itemId || 
      this.props.getData !== prevProps.getData ||
      this.props.getImageUrl !== prevProps.getImageUrl) {
    this.updateItem();
  }
}
```

Код сверху будет обновлять компонент, если новая функция получения данных getData или новая функция получения изображения getImageUrl не соответствуют прежним.

Компонент высшего порядка в With-data.js сейчас работает только с методом componentDidMount. Надо дописать обновления. Весь код из didMount выносится в функцию update, которая вызывается в двух методах жизненного цикла:
```js
// With-data.js

update() {
  this.props.getData()
    .then((data) => {
      this.setState({ data })
    });
}

componentDidMount() {
  this.update();
}

componentDidUpdate(prevProps) {
  if (this.props.getData !== prevProps.getData) {
    this.update();
  }
}
```

## Рефакторинг компонентов высшего порядка
Лишние импорты и поля класса в app.js удаляются.
Директория People-page удаляется, т.к. нингде не используется.
Создаётся новая директория pages.

Ранее в App использовались Row, StarshipDetails, StarshipsList и т.д., но теперь их заменяют соответствующие компоненты pages:
```js
// People-page.js
import React, { Component } from 'react';
import { PersonDetails, PersonList } from '../sw-components';
import Row from '../row';


export default class PeoplePage extends Component {

  state = {
    selectedItem: null
  };

  onItemSelected = (selectedItem) => {
    this.setState({ selectedItem });
  };

  render() {
    const { selectedItem } = this.state;

    return (
      <Row 
        left={<PersonList onItemSelected={this.onItemSelected} />}
        right={<PersonDetails itemId={selectedItem} />}
      />
    );
  };

};


// App.js
// Было
<Row 
  left={<StarshipList />}
  right={<StarshipDetails itemId={9} />}
/>

// Стало
<PeoplePage />
<StarshipsPage />
<PlanetsPage />
```

+ правки в with-data.js

## Функция compose()
В этом уроке автор что-то намудрил. Если следовать его указаниям, то приложение ломается. Чтобы всё работало, надо переписать много компонентов, которые он оставил за кадром.
Решения использовать функцию compose() особой погоды не делает, поэтому просто запишу принцип работы, а всоё приложение переписывать не буду.


Сейчас файл с HOC-компонентами item-lists.js выглядит запутанно и непонятно. Чтобы избавиться от цепочки вложенных функций, можно создать одну функцию compose(), которая будет принимать массив функций, которые должны поочерёдно передавать результат друг другу, и также компонент, который надо пропустить через эти функции.

Функцию compose можно было бы организовать так:
1. передать несколько других функций, композицию которых надо получить;
2. передать компонент, который через эти функции должен пройти.
```js
compose(
  withSwapiService(mapMethodsToProps),
  withData,
  withChildFunction(renderModelAndName)
)(itemList);

// В общих чертах выглядеть будет так
const compose = (...functions) => (component) => {...}

// Эти функции будут в итоге работать одинаково
compose(a, b, c)(value) == a(b(c(value)));
```

Этот код читать легче (нет): видно, во что компонент оборачивается.

Можно пройтись по массиву функций справа налево, вызвать каждую, передать её результать в следующую функцию. Но это не лучшее решение (Дима так говорит в своём курсе).

В js есть функция reduceRight (именно о ней сразу и подумал).
Для этой функции создаётся отдельный файл в HOC-helpers
```js
// compose.js

const compose = (...functions) => (component) => {
  return functions.reduceRight( 
    (prevResult, foo) => foo(prevResult), component);
};

export default compose;
```

Функция withChildFunction тоже переезжает из item-lists.js в директорию HOC-helpers и немного изменяется:
```js
// with-child-function.js

// было
const withChildFunction = (Wrapped, fn) => {
  return (props) => {
    return (
      <Wrapped {...props}>
        {fn}
      </Wrapped>
    );
  }
};

// стало:
const withChildFunction = (fn) => (Wrapped) => {
  return (props) => {
    return (
      <Wrapped {...props}>
        {fn}
      </Wrapped>
    )
  };
};

export default withChildFunction;
```

## defaultProps
Работает так же, как значения по умолчанию параметров функции, только устанавливает значения по умолчанию для свойств (пропсов) компонентов.

defaultProps можно записать как свойство созданного компонента. Эта запись происходит вне тела определения. Так надо записывать defaultProps для компонентов-функций:
```js
// как свойство компонента
ComponentName.defaultProps = {
  onItemSelected: () => {}
};
```

Для компонентов-классов defaultProps можно записывать как статическое свойство всего класса:
```js
class MyComponent extends Component {

  static defaultProps {
    props: value
  }

}
```

Теперь в случае, если в пропсы компонентов не передано значение или это значение – undefined, будет использовано дефолтное значение. В этом свойстве-объекте можно перечислить сколько угодно свойств, которые копонент потребляет из пропсов. Важно, что значение null будет обрабатываться нормально и defaultProps использоваться не будет.


Например, **itemList** рассчитывает получить функцию-обработчик onItemSelected из people-page.js.
Может возникнуть ситуация, когда надо будет просто отобразить список чего-то и никак не реагировать на клики.
Один из вариантов (не лучший) – прописать пустую функцию в деструктуризации. Если ничего не передать в props, то в обработчик присвоится пустая функция:
```js
const { onItemSelected = () => {} } = props;
```

Намного проще будет установить значение по умолчанию. Теперь если функция onItemSelected не будет передана вышестоящим компонентом, то будет использоваться значение по умолчанию.
```js
const ItemList = (props) => {
  // определение компонента
};

ItemList.defaultProps = {
  onItemSelected: () => {}
};
```

Ещё пример – компонент **randomPlanet**.
Интарвал обновления сейчас прописывается в самом компоненте – в функции-таймере. Можно сделать так, чтобы время обновления передавалось через пропсы, заодно установить defaultProps:
```js
static defaultProps = {
  updateInterval: 10000
}

componentDidMount() {
  const { updateInterval } = this.props;
  this.updatePlanet();
  this.interval = setInterval(() => this.updatePlanet(), updateInterval);
}
```

## propTypes
Поскольку JS – это язык с динамической типизацией, переменные могут менять тип хранимых данных во время жизненного цикла, а отлов ошибок, связанных с типами, откладывается до момента запуска приложения.

TS добавляет строгую типизацию, но это «громоздкая» надстройка, не очень удобно использовать.
В React есть способ указать типы для свойств компонентов. Свойства начнут проверяться перед тем, как компонент их получит и начнёт работать. Проверка propTypes срабатывает после defaultProps.

```js
static propTypes = {

  propName: (props, propName, componentName) => {
    const value = props[propName];

      if (typeof value === 'number' && !isNaN(value)) {
        return null;
      }

      return new TypeError(`${componentName}: ${propName} must be number`);
    }
  }
}
```
props           это весь объект свойств (пропсов) компонента.
propName        имя того свойства, для которого сейчас проводится валидация.
componentName   название компонента, для которого проводится валидация

Если все проверки прошли успешно, надо вернуть null.
Если нет – возвращаем (не выбрасываем) ошибку.


## prop-types библиотека
Чтобы не писать код проверки вручную, как в примере выше, есть несколько библиотек, которые реализуют правило валидации.
Документация здесь.

Библиотека с большими возможностями есть у Air bnb, называется тоже prop-types и лежит на GitHub. В ней множество разных валидаций, более сложная логика.

Установка:
```js
npm install prop-types
```

Использование:
```js
import PropTypes from 'prop-types';
import propTypes from 'prop-types';  // с функциональными компонентами


static propTypes = {
  propName: PropTypes.number
}


// если свойство необходимо передать явно
static propTypes = {
  propName: PropTypes.number.isRequired
}
```

Поскольку defaultProps срабатывает раньше, то .isRequired нужно указывать по больше части для разработчика (самодокументирование и всё такое).

Кроме простых пропсов с примитивными типами, можно описывать функции или массивы.
Например, в компоненте ItemList:
```js
// item-list.js

ItemList.propTypes = {
  onItemSelected: propTypes.func,
  data:           propTypes.arrayOf(propTypes.object).isRequired,  // какого типа массив
  children:       propTypes.func.isRequired
};


row.js

Row.propTypes = {
  left: propTypes.element,  // только react-элемент
  right: propTypes.node     // более универсальный, всё что можно отрендерить
};
```

Можно описать объект с определённой структурой.
Если есть компонент, который должен получать в качестве пропса объект, у которого есть поля user и role:
```js
MyComponent.propTypes = {

  user: PropTypes.shape({ 
    name: PropTypes.string,
    role: PropTypes.oneOf([ 'user', 'admin' ])  // одно из значений
  })

}
```
