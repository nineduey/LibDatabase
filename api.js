const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'employee',
  host: 'localhost',
  database: 'library',
  password: 'books',
  port: 5432
});




const getCatalog = async (request, response) => {
    pool.query('SELECT Title, Author, Pubdate, Description FROM Catalog ORDER BY title', (error, results) => {
        response.status(200).json(results.rows);
    });
};




const getItemTitle = (request, response) => {
    const id = request.query.title;
    pool.query('SELECT * FROM Catalog WHERE title ILike $1', [id], (error, results) => {
        response.status(200).json(results.rows);
    });;
};





const getItemAuthor = (request, response) => {
	const id = request.query.author;

    pool.query('SELECT * FROM Catalog WHERE author ILike $1', [id], (error, results) => {
        response.status(200).json(results.rows);
    });
};






const getItemGenre = (request, response) => {
    const id = request.query.genre;
    pool.query('SELECT * FROM Catalog JOIN GenreType ON (Catalog.genretype = GenreType.ID) WHERE GenreType.genre = $1', [id], (error, results) => {
        response.status(200).json(results.rows);
    });
};






const checkout = async (request, response) => {
	console.log(request.body);
	const title = request.body.title;
	const employeeid = request.body.employeeid;
    const id = parseInt(request.params.id);
	
	pool.query("INSERT INTO TransOrder (employeeid, patronlibid, transdate, duedate, status) VALUES ( $1, $2, now(), now() + interval '2 week', 'A')",[ employeeid, id], (error, results)=> {
		if (error) throw error;
		pool.query('INSERT INTO Cart (transorderid, itemid) VALUES ((SELECT Transorder.id FROM TransOrder WHERE Transorder.patronlibid = $1 ), (SELECT id FROM Catalog WHERE title ILike $2))', [id, title], (error, results) => {
		 if (error) throw error;
		response.status(200).send(`Checkout completed for patron id ${id}, title: ${title}, employeeid ${employeeid}.`);
	});
	});
	
};




const renew = (request, response) => {
	const {duedate} = request.body;
	console.log(duedate);
  
	const id = parseInt(request.params.id);
	//const { duedate } = request.body;
	//const moretime = `now() + interval '2 week'`;

    pool.query('UPDATE TransOrder SET Duedate = $1 WHERE Patronlibid = $2', [duedate, id], (error, results) => {
        response.status(200).send(`Book(s) renewed for patron id ${id}. New due date: ${duedate}`);
	});
};





const checkin = (request, response) => {
  const title = request.body.title;
  const id = request.body.id;
  console.log(title);
  //const id = parseInt(request.params.id);

    pool.query('UPDATE Cart SET CheckInDate = now() WHERE TransOrderID = ( SELECT ID FROM TransOrder JOIN Cart ON (TransOrder.ID = Cart.transorderid) WHERE Transorder.Patronlibid =  $2 AND cart.itemid = ( SELECT Item.id FROM Item JOIN Catalog ON (Item.catalogid = Catalog.id) WHERE title ILike $1 ) ) AND ItemId = ( SELECT Item.id FROM Item JOIN Catalog ON (Item.catalogid = Catalog.id) WHERE title ILike $1)', [title, id], (error, results) => {
       if (error) throw error;
		response.status(200).send(`Book title checked in for patronid: ${id}.`);

	});
};





const lookupActive = async (request, response) => {
    pool.query("SELECT Transorder.id as transorderid, Catalogid, Transorder.Patronlibid, Catalog.Title, Catalog.Author, Transorder.transdate::date From ITEM JOIN Catalog ON (item.catalogid = catalog.id) JOIN Cart ON(Cart.ItemID = Item.ID) JOIN TransOrder ON(TransOrder.ID = Cart.TransOrderID) WHERE Status = 'A'", (error, results) => {
        response.status(200).json(results.rows);
    });
};





const lookupOverdue = async (request, response) => {
    pool.query('SELECT Catalogid, Patronlibid, Title, Author, transdate, duedate From ITEM JOIN Catalog ON (item.catalogid = catalog.id) JOIN Cart ON(Cart.ItemID = Item.ID) JOIN TransOrder ON(TransOrder.ID = Cart.TransOrderID) WHERE Transorder.duedate < now()', (error, results) => {
        response.status(200).json(results.rows);
    });
};




const addItem = async (request, response) => {
    //const ID = request.body.ID;
    const dewynum = request.body.dewynum;
    const itemtype = request.body.itemtype;
    const genretype = request.body.genretype;
    const isbn = request.body.isbn;
    const title = request.body.title;
    const title2 = request.body.title;
    const author = request.body.author;
    const pubdate = request.body.pubdate;
    const barcode = request.body.barcode;

    pool.query('Insert into catalog (dewynum, itemtype, genretype, isbn, title, author, pubdate) Values ( $1,  $2, $3, $4, $5, $6, $7)', 
    [dewynum, itemtype, genretype, isbn, title, author, pubdate], (error, results) => {
        //if (error) throw error;
        //response.status(201).send(`Catalog added successfully.`);

        pool.query('Insert into item (bar_code, catalogid) VALUES ($2, (SELECT ID FROM catalog Where title = $1))',  [title2, barcode], (error, results) => {
            console.log("is it this error");
            if (error) throw error;
            response.status(201).send(`Catalog added successfully.`);
        });
    });
};




const deleteItem = (request, response) => {
  const title = request.body.title;
  console.log(title);
	pool.query('DELETE FROM item WHERE id = (SELECT Item.ID FROM ITEM JOIN Catalog ON (Item.Catalogid = Catalog.id) WHERE title ILike $1)', [title], (error, results) => {
		if (error) throw error;
		response.status(200).send(`Item with title: ${title} deleted.`);
  });
};






const addPatron = async (request, response) => {
    console.log(request.body);
    const libraryid = request.body.libraryid;
    const firstname = request.body.firstname;
    const lastname = request.body.lastname;
    const streetaddress = request.body.streetaddress;
    const city = request.body.city;
    const state = request.body.state;
    const phone = request.body.phone;
    const email = request.body.email;
    const contactpref = request.body.contactpref;

    pool.query('INSERT INTO Patron (libraryid, firstName, lastname, streetaddress, city, state, phone, email, contactpref) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', 
    [libraryid, firstname, lastname, streetaddress, city, state, phone, email, contactpref], (error, results) => {
        if (error) throw error;
        response.status(201).send(`Patron added successfully.`);
    });
};
 
 
 
 
const updatePatron = (request, response) => {
	const libraryid = request.body.libraryid;
    const firstname = request.body.firstname;
    const lastname = request.body.lastname;
    const streetaddress = request.body.streetaddress;
    const city = request.body.city;
    const state = request.body.state;
    const phone = request.body.phone;
    const email = request.body.email;
    const contactpref = request.body.contactpref;
    //console.log(request.body);
  pool.query(
    'UPDATE patron SET firstname = COALESCE($2, firstname), lastname = COALESCE($3, lastname), streetaddress = COALESCE($4, streetaddress), city = COALESCE($5, city), state = COALESCE($6, state), phone = COALESCE($7, phone), email = COALESCE($8, email), contactpref = COALESCE($9, contactpref)   WHERE libraryid = $1',
   [libraryid, firstname, lastname, streetaddress, city, state, phone, email, contactpref], (error, result) => {
    if (error) throw error;

    response.send('User updated successfully.');
  });
};

module.exports = {
  getCatalog,
  getItemTitle,
  getItemAuthor,
  getItemGenre,
  checkout,
  renew,
  checkin,
  lookupActive,
  lookupOverdue,
  addItem,
  deleteItem,
  addPatron,
  updatePatron
};