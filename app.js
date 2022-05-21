const express = require('express');
const app = express();
const bodyParser = require("body-parser");

const port = 5000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Library app is running on port ${port}.`);
});

const api = require('./api');

app.get('/library/', api.getCatalog);

app.get('/library/title', api.getItemTitle);

app.get('/library/author', api.getItemAuthor);

app.get('/library/genre', api.getItemGenre);

app.post('/library/checkout/:id', api.checkout);

app.put('/library/renew/:id', api.renew);

app.put('/library/checkin', api.checkin);

app.get('/library/active/', api.lookupActive);

app.get('/library/overdue/', api.lookupOverdue);

app.post('/library/addItem', api.addItem);

app.delete('/library/deleteItem/', api.deleteItem);

app.post('/library/addpatron', api.addPatron);

app.put('/library/updatepatron', api.updatePatron);


