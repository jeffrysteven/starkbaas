var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var rand = require('csprng');

var dbConfig = {
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: 'stk_root*/.',
    database: 'logistica',
    charset: 'utf8'
  }
};
var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);

router.post('/filter/:object', RestEnsureAuthorized, function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
			var data = req.body;
			var sort_predicate = data.sortField;
			var sort_order = data.sortDirection ? 'ASC' : 'DESC';
			var offset = parseInt(data.start);
			var limit = parseInt(data.number);
			var filter = data.filter;
			var object = bookshelf.Model.extend({
				tableName: table
			});
			try {
				if (filter !== "") {
					new object().query(function(obj){
						obj.count('* as cantidad');
					}).fetch().then(function (count) {
						new object().query(function(ob){
							if (data.sortField) {
								ob.orderBy(sort_predicate, sort_order);
							}else{
								ob.orderBy('id', 'DESC');
							}
						}).fetchAll()
					    .then(function(content) {
					    	var c = {};
					    	c.data = content.toJSON();
					    	c.dataInfo = {count: count.toJSON().cantidad};
					      res.send(c);
					    }).catch(function(error) {
					      console.log(error);
					      res.send('An error occured');
					    });
					});
				}else{
					new object().query(function(obj){
						obj.count('* as cantidad');
					}).fetch().then(function (count) {
						new object().query(function(ob){
							ob.limit(limit).offset(offset);
							if (data.sortField) {
								ob.orderBy(sort_predicate, sort_order);
							}else{
								ob.orderBy('id', 'DESC');
							}
						}).fetchAll()
					    .then(function(content) {
					    	var c = {};
					    	c.data = content.toJSON();
					    	c.dataInfo = {count: count.toJSON().cantidad};
					      res.send(c);
					    }).catch(function(error) {
					      console.log(error);
					      res.send('An error occured');
					    });
					});
				};
			}catch(err){
				console.log(err);
			}
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

router.post('/object/:object', RestEnsureAuthorized, function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
			var data = req.body;
			var objModel = {tableName: table};
			var object = bookshelf.Model.extend(objModel);
			if(Object.keys(data).length > 0){
				new object(data).save().then(function(model) {
			  		new object({id:model.attributes.id}).fetch()
				    .then(function(content) {
				      res.send(content.toJSON());
				    }).catch(function(error) {
				      res.json(error);
				    });
				}).catch(function(err){
					res.json(err);
				});
			} else {
				res.json({'response':"No se encontraron datos en su request",'res':false, 'status': 403});
			}
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

router.post('/objectsearch/:object', RestEnsureAuthorized, function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
			var data = req.body;
			var objModel = {tableName: table};
			var object = bookshelf.Model.extend(objModel);
			if(Object.keys(data).length > 0){
				new object().where(data).fetchAll().then(function(model) {
					if (model.toJSON().length > 0) {
						res.send(model.toJSON());
					}else{
						res.json({'response':"No hay datos para su consulta", 'res':false, 'status': 200});
					}
				}).catch(function(err){
					res.json(err);
				});
			} else {
				res.json({'response':"No se encontraron datos en su request",'res':false, 'status': 403});
			}
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

router.get('/objectsearch/:object', RestEnsureAuthorized, function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
			var data = req.query;
			var objModel = {tableName: table};
			var object = bookshelf.Model.extend(objModel);
			if(Object.keys(data).length > 0){
				new object().where(data).fetchAll().then(function(model) {
					if (model.toJSON().length > 0) {
						res.send(model.toJSON());
					}else{
						res.json({'response':"No hay datos para su consulta", 'res':false, 'status': 200});
					}
				}).catch(function(err){
					res.json(err);
				});
			} else {
				res.json({'response':"No se encontraron datos en su request",'res':false, 'status': 403});
			}
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

router.get('/object/:object', RestEnsureAuthorized, function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
			var object = bookshelf.Model.extend({
				tableName: table
			});
			new object().fetchAll()
		    .then(function(content) {
		      res.send(content.toJSON());
		    }).catch(function(error) {
		      console.log(error);
		      res.send('An error occured');
		    });
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

router.post('/objectrelated/:object', RestEnsureAuthorized, function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
			try{
				var data = req.body;
				var id = data.id;
				var related = [];
				var object = bookshelf.Model.extend({
					tableName: table
				});
				if (data.hasOwnProperty('related')) {
					related = data.related;
				};
				if (related.length > 0) {
					var objfinal = {};
					objfinal[table] = new object({id: id}).fetch();
					for (var i = 0; i < related.length; i++) {
						var obj = bookshelf.Model.extend({
		  					tableName: related[i]
						});
						objfinal[related[i]] = new obj().fetchAll();
					};
					Promise.props(objfinal).then(function(result) {
						res.send(result);
					});
				} else{
					var object = bookshelf.Model.extend({
						tableName: table
					});
					new object({id: id}).fetch()
				    .then(function(content) {
				      res.send(content.toJSON());
				    }).catch(function(error) {
				      console.log(error);
				      res.send('An error occured');
				    });
				}
			}catch(err){
				console.log(err);
			}
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

router.post('/objectmasterdetail/:master/:detail', RestEnsureAuthorized, function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var data = req.body.master;
			var datad = req.body.detail;
			var master = req.params.master;
			var detail = req.params.detail;
			var object = bookshelf.Model.extend({
				tableName: master
			});
			var objectdetail = bookshelf.Model.extend({
				tableName: detail
			});
			new object(data).save().then(function(masterobj) {
				datad.forEach(function(element){
					element[master+"_id"] = masterobj.id;
					new objectdetail(element).save();
				});
				res.json(masterobj.attributes);
			}).catch(function(err){
				res.json(err);
			});
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

router.get('/object/:object/:id/:related', RestEnsureAuthorized, function(req, res) {


	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
			var id = req.params.id;
			var related = req.params.related;
			try{
				var objs = [];
				var json = {};
				json['tableName'] = table;
				json[related+"s"] = function() {
			        return this.belongsToMany(objs[1]).through(objs[2]);
			    };
				objs[0] = bookshelf.Model.extend(json);
				json['tableName'] = related;
				json[table+"s"] = function() {
			        return this.belongsToMany(objs[0])
			          .through(objs[2])
			    };
			    objs[1] = bookshelf.Model.extend(json);
			    objs[2] = bookshelf.Model.extend({
			      tableName: table+related.capitalize()
			    });
			    new objs[0]()
		        .query({where: {id: id}})
		        .fetch({withRelated: [related+"s"], require: true})
		        .then(function(model) {
		          res.send(model);
		        });
			}catch(err){
				console.log(err);
			}
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

router.get('/objectrans/:object/:id/:related', RestEnsureAuthorized, function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
			var id = req.params.id;
			var related = req.params.related;
			try{

				var objs = [];
				var json = {};
				json['tableName'] = table;
				json[related+"s"] = function() {
			        return this.belongsToMany(objs[1]).through(objs[2]);
			    };
				objs[0] = bookshelf.Model.extend(json);
				json['tableName'] = related;
				json[table+"s"] = function() {
			        return this.belongsToMany(objs[0])
			          .through(objs[2])
			    };
			    objs[1] = bookshelf.Model.extend(json);
			    objs[2] = bookshelf.Model.extend({
			      tableName: related+table.capitalize()
			    });
			    new objs[0]()
		        .query({where: {id: id}})
		        .fetch({withRelated: [related+"s"], require: true})
		        .then(function(model) {
		          res.send(model);
		        });
			}catch(err){
				console.log(err);
			}
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

router.get('/objectrelated/:object/:id/:related', RestEnsureAuthorized, function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
			var id = req.params.id;
			var related = req.params.related;
			try{
				var objs = [];
				var json = {};
				json['tableName'] = table;
				json[related+"s"] = function() {
			        return this.belongsToMany(objs[1]).through(objs[2]);
			    };
				objs[0] = bookshelf.Model.extend(json);
				json['tableName'] = related;
				json[table+"s"] = function() {
			        return this.belongsToMany(objs[0])
			          .through(objs[2])
			    };
			    objs[1] = bookshelf.Model.extend(json);
			    objs[2] = bookshelf.Model.extend({
			      tableName: table
			    });
			    new objs[0]()
		        .query({where: {id: id}})
		        .fetch({withRelated: [related+"s"], require: true})
		        .then(function(model) {
		          res.send(model);
		        });
			}catch(err){
				console.log(err);
			}
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

router.get('/objectin/:object/:id/:related', RestEnsureAuthorized, function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
			var id = req.params.id;
			try{
				var table = req.params.object;
				var related = req.params.related;
				var objClass = bookshelf.Model.extend({
					tableName: table
				});
				var relatedObject = bookshelf.Model.extend({
					tableName: related
				});
				var json = {};
				json['tableName'] = table;
				json[related] = function() {
			        return this.hasMany(relatedObject);
			    };
			    var object = bookshelf.Model.extend(json);
				new object({id:id}).related(related).fetch()
			    .then(function(content) {
			    	new objClass({id:id}).fetch().then(function (master){
			    		var response = {};
			    		response[table] = master.toJSON();
			    		response[related] = content.toJSON();
			    		res.send(response);
			    	});
			    }).catch(function(error) {
			      console.log(error);
			      res.send('An error occured');
			    });
			}catch(err){
				console.log(err);
			}
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

router.get('/object/:object/:id', RestEnsureAuthorized, function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
			var object = bookshelf.Model.extend({
				tableName: table
			});
			new object({id:req.params.id}).fetch()
		    .then(function(content) {
		      res.send(content.toJSON());
		    }).catch(function(error) {
		      console.log(error);
		      res.send('An error occured');
		    });
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

router.put('/object/:object/:id', RestEnsureAuthorized, function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
			var id = req.params.id;
			var data = req.body;
			var object = bookshelf.Model.extend({
				tableName: table
			});
			try{
				new object({id: id}).save(data, {patch: true}).then(function(model) {
			  		res.json(model.attributes);
				});
			}catch(err){
				console.log(err);
			}
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

router.delete('/object/:object/:id', RestEnsureAuthorized, function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
			var id = req.params.id;
			var object = bookshelf.Model.extend({
				tableName: table
			});
			new object({id: id}).fetch({require: true}).then(function(model) {
				model.destroy()
				.then(function () {
					res.json({message: table.capitalize() + ' successfully deleted', status: 200});
				})
				.otherwise(function (err) {
					res.status(500).json({error: true, data: {message: err.message}});
				});
			});
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

router.post('/user/login', function(req, res) {
	var data = req.body;
	var email = data.email;
	var password = data.password;
	var object = bookshelf.Model.extend({
		tableName: "user"
	});
	new object({email: email}).fetch()
    .then(function(user) {
    	if (user) {
    		var the_user = user.attributes;
	    	var salt = the_user.salt;
	    	var hash_db = the_user.password;
	    	var token_db = the_user.token;
	    	var newpass = salt + password;
	    	var hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");
	    	if(hash_db == hashed_password){
	    		res.json({'status':200, 'name': the_user.name, 'lastname': the_user.lastname, 'email': the_user.email, 'role': the_user.role_id, 'res': true, 'message': 'Bienvenido de nuevo '+ the_user.name + ' ' + the_user.lastname, 'token': token_db});
			}else{
				res.json({'response':"Invalid Password",'res':false, 'status': 600});
			}
    	}else{
    		res.json({'response':"El usuario no existe",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured');
    });
});


router.post('/user/register', function(req, res) {
	var data = req.body;
	var email = data.email;
	var password = data.password;
	var name = data.name;
	var lastname = data.lastname;
	var role = data.role;
	try{
	if (!(email.indexOf("@")==email.length)) {
		if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/) && password.length > 4 && password.match(/[0-9]/) && password.match(/.[!,@,#,$,%,^,&,*,?,_,~]/)) {
			var temp =rand(160, 36);
			var newpass = temp + password;
			var hashed_password = crypto.createHash('sha512').update(newpass).digest("hex");
			var salt = temp;
			var user = {
				email: email,
				password: hashed_password,
				name: name,
				lastname: lastname,
				salt: salt,
				role_id: role
			};
			var object = bookshelf.Model.extend({tableName: "user"});
			new object(user).save().then(function(user) {
		  		if (user) {
		  			var the_token = jwt.sign(user, user.attributes.salt);
		  			new object({id: user.attributes.id}).save({token: the_token}, {patch: true}).then(function(model) {
	  					res.json(model.attributes);
					});
		  		};
			}).catch(function(err){
				console.log("the error ==== ");
				console.log(err.code);
				if (err.code === "ER_DUP_ENTRY") {
					res.json({"error": err.code, "status": 500, "message": "Su correo electrónico ya esta registrado en nuestra base de datos"});
				};
				console.log("the error end ====");
			});
		}else{
			res.json({"error": "Password_Weak", "status": 500, "message": "Password Inseguro"});
		}
	}else{
		res.json({"error": "Invalid_Email", "status": 500, "message": "Error no válido"});
	}
	}catch(err){
		res.json({"error": "Generic", "status": 500, "message": "Error genérico"});
	}
});


router.post('/filterrelated/:object', RestEnsureAuthorized, function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
			var data = req.body;
			var sort_predicate = data.sortField;
			var sort_order = data.sortDirection ? 'ASC' : 'DESC';
			var offset = parseInt(data.start);
			var limit = parseInt(data.number);
			var filter = data.filter;
			var object = bookshelf.Model.extend({
				tableName: table
			});
			var related = data.related;
			try {
				if (filter !== "") {
					/* BEGIN Final */
					new object().query(function(obj){
						obj.count('* as cantidad');
					}).fetch().then(function (count) {
						var objs = [];
						json = {};
						if (related.length > 1) {
							for (var i = 0; i < related.length; i++) {
								json['tableName'] = related[i];
							    objs[i+1] = bookshelf.Model.extend(json);
							};
						}else{
							json['tableName'] = related[0];
							objs[1] = bookshelf.Model.extend(json);
						}
						var json = {};
						json['tableName'] = table;
						if (related.length > 1) {
							for (var i = 0; i < related.length; i++) {
								json[related[i]] = function() {
									return this.belongsTo(objs[i+1]);
						    	};
							};
						} else{
							json[related[0]] = function() {
								return this.belongsTo(objs[1]);
						    };
						}
						objs[0] = bookshelf.Model.extend(json);
						new objs[0]()
						.query(function(ob){
							if (data.sortField) {
								ob.orderBy(sort_predicate, sort_order);
							}else{
								ob.orderBy('id', 'DESC');
							}
						})
						.fetchAll({withRelated: related, require: true})
						.then(function(content) {
						    var c = {};
					    	c.data = content.toJSON();
					    	c.dataInfo = {count: count.toJSON().cantidad};
					      	res.send(c);
						}).catch(function(error) {
					      console.log(error);
					      res.send('An error occured');
					    });
					});
					/*  END Final */
				}else{
					/* BEGIN Final */
					new object().query(function(obj){
						obj.count('* as cantidad');
					}).fetch().then(function (count) {
						var objs = [];
						json = {};
						if (related.length > 1) {
							for (var i = 0; i < related.length; i++) {
								json['tableName'] = related[i];
							    objs[i+1] = bookshelf.Model.extend(json);
							};
						}else{
							json['tableName'] = related[0];
							objs[1] = bookshelf.Model.extend(json);
						}
						var json = {};
						json['tableName'] = table;
						if (related.length > 1) {
							for (var i = 0; i < related.length; i++) {
								json[related[i]] = function() {
									return this.belongsTo(objs[i+1]);
						    	};
							};
						} else{
							json[related[0]] = function() {
								return this.belongsTo(objs[1]);
						    };
						}
						objs[0] = bookshelf.Model.extend(json);
						new objs[0]()
						.query(function(ob){
							ob.limit(limit).offset(offset);
							if (data.sortField) {
								ob.orderBy(sort_predicate, sort_order);
							}else{
								ob.orderBy('id', 'DESC');
							}
						})
						.fetchAll({withRelated: related, require: true})
						.then(function(content) {
						    var c = {};
					    	c.data = content.toJSON();
					    	c.dataInfo = {count: count.toJSON().cantidad};
					      	res.send(c);
						}).catch(function(error) {
					      console.log(error);
					      res.send('An error occured');
					    });
					});
					/*  END Final */
				}
			}catch(err){
				console.log(err);
			}
    	}else{
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured'+error);
    });
});

/* GET home page. */
router.get('/', FrontEnsureAuthorized, function(req, res) {
	var object = bookshelf.Model.extend({
		tableName: 'user'
	});
	new object({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		res.render('index.html', {title: 'Stark Backend', userdata: user.toJSON()});
    	}else{
    		res.json({'response':"El usuario no existe",'res':false, 'status': 403});
    	}
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured');
    });
  	//res.render('index.html', {title: 'Stark Backend'});
});

router.get('/apps', function(req, res) {
  res.render('apps');
});

router.get('/login', function(req, res) {
  res.render('login.html', {title: 'Login Stark Backend'});
});

router.get('/partials/:module/:name', FrontEnsureAuthorized, function(req, res) {
	var module = req.params.module;
	var name = req.params.name;
  	res.render(module + '/' + name + ".html");
});

router.get('/partialsfree/:module/:name', function(req, res) {
	var module = req.params.module;
	var name = req.params.name;
  	res.render(module + '/' + name + ".html");
  	//res.render("login.html");
});

function setQuery (table, TableJSONobject, data) {
	var query = "INSERT INTO "+table+" ('',";
	var k = 0;
	for (var i in TableJSONobject) {
		if (k>0) {
			console.log(i);
			if (TableJSONobject[i]['type'] === "int") {
				query+=data[i]+",";
			}else if (TableJSONobject[i]['type'] === "varchar") {
				query+="'"+data[i]+"',";
			};
		   /*for (var j in JSONobject[i]) {
		   		var attr = JSONobject[i][j];
		   		console.log(i+"-"+j);
			}*/
		}
		k++;
	}
	query+=")";
	console.log(query);
}

function FrontEnsureAuthorized(req, res, next) {
	var bearerToken;
    var bearerHeader = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        bearerToken = bearerHeader;
        req.token = bearerToken;
        next();
    } else {
    	//res.redirect('login');
    	res.render('index.html', {title: 'Stark Backend - Authentication', isLogged: false});
    	//res.status(403).send({'response':"Token not found",'res':false, 'status': 403});
    }
}

function RestEnsureAuthorized(req, res, next) {
	var bearerToken;
	var bearerHeader = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        bearerToken = bearerHeader;
        req.token = bearerToken;
        next();
    } else {
    	res.status(403).send({'response':"Token not found",'res':false, 'status': 403});
        //res.send(403);
    }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = router;