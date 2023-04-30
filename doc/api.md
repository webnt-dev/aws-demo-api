# API calls

![Architecture](./aws-demo-api.drawio.png)

## version

### Query
```
query  {
  version {
    date
    serverDateTime
    version
  }
}  
```  

### Response
```
{
  "data": {
    "version": {
      "date": "2023-04-29",
      "serverDateTime": "2023-04-30T18:05:02.260Z",
      "version": "1.0.0"
    },
  }
}
```

Query returns version informations. Query uses `NoneSource`, there is no resource queried, data are static or generated using `util`.

## testVTL1, testVTL10, testJS1, testJS10

### Query
```
query  {

  testVTL1 {
    count
    endTime
    endTimestamp
    startTime
    startTimestamp
    time
  }

  testVTL10 {
    count
    endTime
    endTimestamp
    startTime
    startTimestamp
    time
  }  

  testJS1 {
    count
    endTime
    endTimestamp
    startTime
    startTimestamp
    time
  }

  testJS10 {
    count
    endTime
    endTimestamp
    startTime
    startTimestamp
    time
  }  
}

```  

### Response
```
{
  "data": {
    "testVTL1": {
      "count": 2,
      "endTime": "2023-04-30T18:05:02.260Z",
      "endTimestamp": 1682877902260,
      "startTime": "2023-04-30T18:05:02.258Z",
      "startTimestamp": 1682877902258,
      "time": 2
    },
    "testVTL10": {
      "count": 20,
      "endTime": "2023-04-30T18:05:02.264Z",
      "endTimestamp": 1682877902264,
      "startTime": "2023-04-30T18:05:02.259Z",
      "startTimestamp": 1682877902259,
      "time": 5
    },
    "testJS1": {
      "count": 2,
      "endTime": "2023-04-30T18:05:02.260Z",
      "endTimestamp": 1682877902260,
      "startTime": "2023-04-30T18:05:02.259Z",
      "startTimestamp": 1682877902259,
      "time": 1
    },
    "testJS10": {
      "count": 20,
      "endTime": "2023-04-30T18:05:02.269Z",
      "endTimestamp": 1682877902269,
      "startTime": "2023-04-30T18:05:02.260Z",
      "startTimestamp": 1682877902260,
      "time": 9
    }
  }
}
```

Queries measurest time cost of resolvers/pipelines

* testVTL1: VTL resolver with templates
* testVTL10: VTL resolver with pipeline with 10 functions
* testJS1: JS resolver with pipeline with 1 function
* testJS10: JS resolver with pipeline with 10 functions

#### Response data

* **count**: how many request/response templates/handlers call triggered
* **endTime**: ISO representation of call end time
* **endTimestamp**: Timestamp in milliseconds of call end time 
* **start**: ISO representation of call start time
* **startTimestamp**: Timestamp in milliseconds of call start time 
* **time**: Number of milliseconds all processing took


## recipeGetById

### Query
```
query {
  r1: recipeGetById(id: "ABC") {
    cookingTime
    created
    id
    ingredients {
      amount
      name
      unit
      url
    }
    name
    preparationTime
    updated
  }

  r2: recipeGetById(id: "c21aadd5-910b-49c8-8d75-1f3303c33a03") {
    cookingTime
    created
    id
    ingredients {
      amount
      name
      unit
      url
    }
    name
    preparationTime
    updated
  }
}
```

### Response

```
{
  "data": {
    "r1": null,
    "r2": {
      "cookingTime": 150,
      "created": "2023-04-30T11:54:28.315Z",
      "id": "c21aadd5-910b-49c8-8d75-1f3303c33a03",
      "ingredients": [
        {
          "amount": 1500,
          "name": "Chicken meat & bones",
          "unit": "g",
          "url": "https://www.google.com/search?q=Chicken+meat+%26+bones"
        },
        {
          "amount": 200,
          "name": "Ginger",
          "unit": "g",
          "url": "https://www.google.com/search?q=Ginger"
        },
        {
          "amount": 2,
          "name": "Water",
          "unit": "l",
          "url": "https://www.google.com/search?q=Water"
        }
      ],
      "name": "Ramen",
      "preparationTime": 30,
      "updated": "2023-04-30T11:54:28.315Z"
    }
  }
}
```



Mutation.recipeCreate
Mutation.recipePatch
Query.recipeGetById
Query.recipeGetById_vtl
Query.recipeList

Mutation.recipeCreate2

Mutation.recipeCreate3