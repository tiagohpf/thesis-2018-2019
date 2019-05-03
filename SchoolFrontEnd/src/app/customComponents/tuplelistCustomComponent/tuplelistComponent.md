A *tuple* is a container to group other components that represents some business object. So, **tuplelistComponent** have the ability to receive an array of objects and represent a list of business objects. **tuplelistComponent** also provides mechanisms to delete objects or create new objects.

## Usage

### Tuple
Type *tuple* is used to group attributes.

In the example bellow, we are grouping a phone number and description.  
```javascript
{
  "type": "initParameters",
  "urlResource": [
    {
      "key": "path",
      "value": "./assets/dummy-api/examples.json"
    },
    {
      "key": "headers",
      "value": {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    }
  ],
  "details": [
    {
      "type": "tuple",
      "id": "tupleListComponent",
      "text": "Contacts",
      "class": "hide-label",
      "pathToValue": "contacts___0",
      "valueList": [
        {
          "type": "textbox",
          "text": "Description",
          "id": "company",
          "placeholder": "Description",
          "class": "col-sm-7"
        },
        {
          "type": "textbox",
          "id": "phone",
          "placeholder": "Phone number",
          "class": "col-sm-3"
        }
      ]
    }
  ]
}
```

### Tuple List

To implement, for example a contact list, WebCT provides the type *tuple_list*. *tuple_list* can represent a set of *tuples* and have de ability to add and remove elements.

```javascript
{
  "type": "initParameters",
  "urlResource": [
    {
      "key": "path",
      "value": "./assets/dummy-api/examples.json"
    },
    {
      "key": "headers",
      "value": {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    }
  ],
  "details": [
    {
      "type": "tuple_list",
      "id": "tupleListComponent",
      "text": "Contacts",
      "class": "hide-label",
      "pathToValue": "contacts",
      "valueList": [
        {
          "type": "textbox",
          "id": "company",
          "placeholder": "Name",
          "_pathToValue": ["company"],
          "class": "col-sm-7"
        },
        {
          "type": "textbox",
          "id": "phone",
          "placeholder": "Phone number",
          "_pathToValue": ["phone"],
          "class": "col-sm-3"
        }
      ]
    }
  ]
}
```

Value mapping is based on component’s id so data object of each tuple must have attributes with same name of component’s id in *valuesList*:

```javascript
{
    "contacts": [
        {
            "company": "TETRATREX",
            "phone": "+1 (831) 574-3332"
        },
        {
            "company": "ZENTIA",
            "phone": "+1 (891) 589-3968"
        },
        ...
    ]
}
```


