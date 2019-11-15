#### Run 

This install the node packages the project need
```
npm install
```

This create/revert a empty database with the projects structure
```
npm run database:refresh
```

This imports the teams information from the api into the DB
```
npm run import:teams
```

This imports the matches information from the api into the DB
```
npm run import:matches
```

_Import must be split because javascripts is asynchronous_