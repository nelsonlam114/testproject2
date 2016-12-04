


var express = require('express');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var mongourl = 'mongodb://localhost:27017/test';
app = express();
var assert = require('assert');
var fileUpload = require('express-fileupload');
var SECRETKEY1 = 'I want to pass COMPS381F';
var SECRETKEY2 = 'Keep this to yourself';
var ObjectId = require('mongodb').ObjectId;






app.set('view engine','ejs');

app.use(session({
  name: 'session',
  keys: [SECRETKEY1,SECRETKEY2]
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(fileUpload()); 



//
app.use(function(req,res,next){
res.locals.session = req.session;
next();
});
//




app.get('/clear', function(req,res) {
		req.session = null;
		res.end();
});

app.get('/',function(req,res) {
	console.log(req.session);
	if (!req.session.authenticated) {
		res.redirect('/login');
	}
	res.redirect('/read');
});

app.get('/register',function(req,res) {
	res.sendFile(__dirname + '/public/register.html');
});

app.get('/login',function(req,res) {
	res.sendFile(__dirname + '/public/login.html');
});

app.get('/read',function(req,res) {
	console.log(req.session);
	if (!req.session.authenticated) {
	res.redirect('/login');
	}
	if (req.query.username != null) {
	criteria['username'] = req.query.username;
	}
	var username = req.session.username;
	
	MongoClient.connect(mongourl, function(err, db) { //listall
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		findNRest(db,function(restaurant){
			
			db.close();
			console.log('Disconnected MongoDB\n');
			res.render('list',{r:restaurant});
			//res.end();
			});



});
});


app.get('/create',function(req,res){
	console.log(req.session);
	if (!req.session.authenticated) {
	res.redirect('/login');
	}
	res.sendFile(__dirname + '/public/create.html');
});



app.get('/delete', function(req,res){
	MongoClient.connect(mongourl, function(err, db) { //delete
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		delrest2(db,function(restaurant){
		db.close();
		console.log('Disconnected MongoDB\n');
		res.render('delete2',{r:restaurant});
		});
	});
});




app.get('/update', function(req,res){
	/*MongoClient.connect(mongourl, function(err, db) { //delete
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		update2(db,function(restaurant){
		db.close();
		console.log('Disconnected MongoDB\n');
		res.render('update2',{r:restaurant});
		});
	});*/
res.sendFile(__dirname + '/public/update2.html');
});

app.post('/update',function(req,res){
	var resname = req.body.resname,
            building = req.body.building,
            street = req.body.street,
			zipcode = req.body.zipcode,
			lon = req.body.lon,
			lat = req.body.lat,
			cuisine = req.body.cuisin;
			//sampleFile = req.body.sampleFile;
   

MongoClient.connect(mongourl,resname,zipcode, function(err, db) {
		assert.equal(err,null);
console.log('Connected to MongoDB\n');
console.log(resname);
console.log(zipcode);
update2(db,resname,cuisine,building,street,zipcode,lon,lat, function(result){
	db.close();
	console.log('Disconnected MongoDB\n');	
	res.writeHead(200, {"Content-Type": "html"});
	res.write('<html><body>');
	res.write('<p>Restaurant update sussesful!</p>');
	res.write('<meta http-equiv="refresh" content="3; url=/read" />');
	res.end('</body></html> ');
	
	});

})});


function update2(db,username,resname,cuisine,street,building,zipcode,lon,lat,bfile,callback) {
  console.log(bfile);
  db.collection('restaurant').update({
    "resname" : resname},
	{
    "building" :building,
    "street" : street,
    "zipcode" : zipcode,
	"lon" : lon,
	"lat" : lat,
	"cuisine" : cuisine,
   // "data" : new Buffer(bfile.data).toString('base64'),
    //"mimetype" : bfile.mimetype,
  }, function(err,result) {
    //assert.equal(err,null);
    if (err) {
      result = err;
      console.log("update error");
    } else {
      console.log("update");
    }
   //callback(result);
  });
};


app.post('/register',function(req,res){
 	var username = req.body.username,
            password = req.body.password,
            repassword = req.body.repassword;
        if (username == "" || password == "" || repassword == "") {
            req.session.error = "请不要留白！";
            return res.redirect('/register');
        }
	
	if (password != repassword) {
            req.session.error = "两次密码输入不一样";
            return res.redirect('/register');
        }

	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
	console.log('Connected to MongoDB\n');
	console.log(username);
	console.log(password);
	register(db,username, password, function(result){
	db.close();
	console.log('Disconnected MongoDB\n');	
	res.writeHead(200, {"Content-Type": "html"});
	res.write('<html><body>');
	res.write('<p>Resgister sussesful!</p>');
	res.write('<meta http-equiv="refresh" content="3; url=/login" />');
	res.end('</body></html> ');
	
	});

})
});

app.post('/login',function(req,res) {
	
	var username = req.body.username,
	password = req.body.password;
		if (username == "" || password == "") {
		console.log('fill in the blank!');
	res.writeHead(200, {"Content-Type": "html"});
	res.write('<html><body>');
	res.write('<p>fill in the blank!</p>');
	res.write('<meta http-equiv="refresh" content="3; url=/login" />');
	res.end('</body></html> ');
	return res.redirect('/login')};

	MongoClient.connect(mongourl, function(err, db) {
	assert.equal(err,null);
	console.log('Connected to MongoDB\n');
	console.log(username);
	console.log(password);

	findUser(db,username, password, function(result){
	db.close();
	console.log('Disconnected MongoDB\n');	
	if (result.username != username){
	res.writeHead(200, {"Content-Type": "html"});
	res.write('<html><body>');
	res.write('<p>login unsuccessful</p>');
	res.write('<meta http-equiv="refresh" content="3; url=/login" />');
	res.end('</body></html> ');}	
		else if(result.password != password){
		res.writeHead(200, {"Content-Type": "html"});
		res.write('<html><body>');
		res.write('<p>login unsuccessful</p>');
		res.write('<meta http-equiv="refresh" content="3; url=/login" />');
		res.end('</body></html> ');
	}		else{
			req.session.authenticated = true;
			req.session.username = result.username;
			res.writeHead(200, {"Content-Type": "html"});
			res.write('<html><body>');
			res.write('<p>login sussesful!!!!</p>');
			res.write('<meta http-equiv="refresh" content="3; url=/read" />');
			res.end('</body></html> ');
	}});

});

});

app.post('/create',function(req,res){
	var sampleFile,
	resname = req.body.resname,
	cuisine = req.body.cuisine,
	street = req.body.street,
	building = req.body.building,
	zipcode = req.body.zipcode,
	lon = req.body.lon,
	lat = req.body.lat,
	username = req.session.username;
		if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }
	MongoClient.connect(mongourl, function(err, db) {
	assert.equal(err,null);
	console.log('Connected to MongoDB\n');
	console.log(username);
	console.log(resname);
	console.log(cuisine);
	console.log(street);
	console.log(building);
	console.log(zipcode);
	console.log(lon);
	console.log(lat);
	create(db,username,resname,cuisine,street,building,zipcode,lon,lat,req.files.sampleFile, function(result){
	db.close();
	console.log('Disconnected MongoDB\n');	
	res.writeHead(200, {"Content-Type": "html"});
	res.write('<html><body>');
	res.write('<p>create sussesful!</p>');
	res.write('<meta http-equiv="refresh" content="2; url=/read" />');
	res.end('</body></html> ');
	
	});

});
});


app.post('/delete',function(req,res){
	var id= req.query.id;

  MongoClient.connect(mongourl, function(err, db) {
   	assert.equal(err,null);
    console.log('Connected to MongoDB\n');
      deleterest(db, function(result){
        db.close();
        console.log('Disconnected MongoDB\n');	
        	res.writeHead(200, {"Content-Type": "html"});
        	res.write('<html><body>');
	        res.write('<p>Delete sussesful!</p>');
        	res.write('<meta http-equiv="refresh" content="2; url=/login" />');
        	res.end('</body></html> ');
    });
  });
      
});














function findUser(db, username, password, callback){

	db.collection('users').findOne({ username: username}, function(err, result) {
	console.log('user found');
	
	if (err)  {
	console.log('user not found');}

	 if (result.password == password){
		console.log('User and passowrd is correct');
	
	} else if (result.password != password) {
		console.log("username and password is not correct");
	
		}
	callback(result);
	});


}

function register(db,username, password,callback) {

	db.collection('users').insertOne({
	"username": username,
	"password": password,

	}, function(err,result) {

	if (err){
	result = err;
	console.log(JSON.stringify(err));
	}else{

	console.log("insertOne() was successful _id = " + result.insertedId);

}
	callback(result);
});
}





function create(db,username,resname,cuisine,street,building,zipcode,lon,lat,bfile,callback) {
console.log(bfile);
db.collection('restaurant').insertOne({
"username": username,
"resname": resname,
"cuisine": cuisine,
"street": street,
"building": building,
"zipcode": zipcode,
"lon": lon,
"lat": lat,
"data" : new Buffer(bfile.data).toString('base64'),
"mimetype" : bfile.mimetype,
}, function(err,result) {

if (err){
result = err;
console.log(JSON.stringify(err));
}else{

console.log("insertOne() was successful _id = " + result.insertedId);

}
callback(result);
});
}

function findNRest(db,callback) {
		var restaurant = [];
	db.collection('restaurant').find(function(err,result) {
		assert.equal(err,null);
		result.each(function(err,doc) {
		if (doc !=null){
			restaurant.push(doc);
		}else{
			callback(restaurant);
			}
});
});
//db.collection('restaurant').find().toArray(function(err,result) {
//	assert.equal(err,null);
//	callback(result);

//});		
};
/*
app.get("/showonmap", function(req,res) {
    MongoClient.connect(mongourl, function(err, db) {
	    assert.equal(err,null);
	    console.log('Connected to MongoDB\n');
	var id = req.query.id;
	   // var criteria = {"_id": ObjectId(req.query.id)};
	var criteria = {'id': id};
	    find1restaurant(db,criteria,function(restaurant) {
	      db.close();
	      console.log('Disconnected MongoDB\n');
        res.render('details',{r:restaurant,zoom:18});
        res.end();
	    });
	  });


	


});

*/
app.get("/showonmap", function(req,res) {
    MongoClient.connect(mongourl, function(err, db) {
	    assert.equal(err,null);
	    console.log('Connected to MongoDB\n');
	//var criteria = {"_id": ObjectId(req.query.id)};
	    var criteria = {'id':req.query.id};
	    find1restaurant(db,criteria,function(restaurant) {
	      db.close();
	      console.log('Disconnected MongoDB\n');
        res.render('details',{r:restaurant,_id : criteria});
        res.end();
	    });
	  });
});
function find1restaurant(db,criteria,callback) {
    db.collection('restaurant').findOne(criteria,function(err,result) {
        assert.equal(err,null);
        callback(result);
    });
}


/*
function find1restaurant(db,criteria,callback) {
	console.log(criteria);
    db.collection('restaurant').findOne(criteria,function(err,result) {
        assert.equal(err,null);
        callback(result);
    });
}
*/

function delrest2(db,id,callback) {
var MongoClient = require('mongodb').MongoClient 
  , assert = require('assert');

var ObjectID = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/test';

MongoClient.connect(url, function (err, db) { 
    assert.equal(null, err); 
    console.log("Connected correctly to server"); 
    var restaurant = db.collection("restaurant");     
    
    restaurant.remove({ "_id" : ObjectID}, 
        function (err, result) { 
        if (err) { 
            db.close(); 
            return console.error(err); 
        } 
	console.log("deleted restaurant!"); 
        return db.close(); 
	callback(result);
	
    }); 
});
};







app.get('/logout',function(req,res) {
	req.session = null;
	res.redirect('/');
});

app.listen(process.env.PORT || 8099);

