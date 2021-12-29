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


```js
```

```js
```

```js
```


```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```


```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```