var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var rand = require('csprng');
var multer  = require('multer');
var AWS = require('aws-sdk');
var fs = require('fs');

/*var dbConfig = {
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'logistica',
    charset: 'utf8',
    timezone: 'utc-5'
  }
};*/

var dbConfig = {};
var knex;
var bookshelf;

/*var knex = require('knex')(dbConfig);
var bookshelf = require('bookshelf')(knex);*/

var awsconfig ={
	"accessKeyId": "xxxxxx",
	"secretAccessKey": "xxxxxx",
	"region": "us-west-2"
};

AWS.config.update(awsconfig);

/*var fileBucket = new AWS.S3({params: {Bucket: 'logisticastarkmbaas'}});*/

var fileBucket;

router.post('/filter/:object', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
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
					    	knex.destroy();
					      	res.send(c);
					    }).catch(function(error) {
					    	knex.destroy();
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
					    	knex.destroy();
					      	res.send(c);
					    }).catch(function(error) {
					    	knex.destroy();
					      	console.log(error);
					      	res.send('An error occured');
					    });
					});
				};
			}catch(err){
				knex.destroy();
				console.log(err);
			}
    	} else {
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.post('/filterrelatedsearch/:object', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
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
			var filters = data.filters;
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
						.where(filters)
						.fetchAll({withRelated: related, require: true})
						.then(function(content) {
						    var c = {};
					    	c.data = content.toJSON();
					    	c.dataInfo = {count: count.toJSON().cantidad};
					    	knex.destroy();
					      	res.send(c);
						}).catch(function(error) {
							knex.destroy();
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
						.where(filters)
						.fetchAll({withRelated: related, require: true})
						.then(function(content) {
						    var c = {};
					    	c.data = content.toJSON();
					    	c.dataInfo = {count: count.toJSON().cantidad};
					    	knex.destroy();
					      	res.send(c);
						}).catch(function(error) {
							knex.destroy();
					      	console.log(error);
					      	res.send('An error occured');
					    });
					});
					/*  END Final */
				}
			}catch(err){
				knex.destroy();
				console.log(err);
			}
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.post('/object/:object', [validateRestTenant, RestEnsureAuthorized, multer(), uploadFiles, uploadBase64Files], function(req, res) {
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
				    	knex.destroy();
				      	res.send(content.toJSON());
				    }).catch(function(error) {
				    	knex.destroy();
				      	res.json(error);
				    });
				}).catch(function(err){
					knex.destroy();
					res.json(err);
				});
			} else {
				knex.destroy();
				res.json({'response':"No se encontraron datos en su request",'res':false, 'status': 403});
			}
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.post('/objectsearch/:object', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
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
						var resdata = {};
						resdata.res = true;
						resdata.data = model.toJSON();
						resdata.status = 200;
						knex.destroy();
						res.send(resdata);
					}else{
						knex.destroy();
						res.json({'response':"No hay datos para su consulta", 'res':false, 'status': 200});
					}
				}).catch(function(err){
					knex.destroy();
					res.json(err);
				});
			} else {
				knex.destroy();
				res.json({'response':"No se encontraron datos en su request",'res':false, 'status': 403});
			}
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.get('/objectsearch/:object', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
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
						var resdata = {};
						resdata.res = true;
						resdata.data = model.toJSON();
						resdata.status = 200;
						knex.destroy();
						res.send(resdata);
					}else{
						knex.destroy();
						res.json({'response':"No hay datos para su consulta", 'res':false, 'status': 200});
					}
				}).catch(function(err){
					knex.destroy();
					res.json(err);
				});
			} else {
				knex.destroy();
				res.json({'response':"No se encontraron datos en su request",'res':false, 'status': 403});
			}
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.get('/object/:object', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
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
		    	knex.destroy();
		      	res.send(content.toJSON());
		    }).catch(function(error) {
		    	knex.destroy();
		      	console.log(error);
		      	res.send('An error occured');
		    });
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.post('/objectrelated/:object', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
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
						knex.destroy();
						res.send(result);
					});
				} else{
					var object = bookshelf.Model.extend({
						tableName: table
					});
					new object({id: id}).fetch()
				    .then(function(content) {
				    	knex.destroy();
				      	res.send(content.toJSON());
				    }).catch(function(error) {
				    	knex.destroy();
				      	console.log(error);
				      	res.send('An error occured');
				    });
				}
			}catch(err){
				knex.destroy();
				console.log(err);
			}
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.post('/objectmasterdetail/:master/:detail', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
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
				knex.destroy();
				res.json(masterobj.attributes);
			}).catch(function(err){
				knex.destroy();
				res.json(err);
			});
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.get('/object/:object/:id/:related', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
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
		        	knex.destroy();
		          	res.send(model);
		        });
			}catch(err){
				knex.destroy();
				console.log(err);
			}
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.get('/objectrans/:object/:id/:related', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
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
		        	knex.destroy();
		          	res.send(model);
		        });
			}catch(err){
				knex.destroy();
				console.log(err);
			}
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.get('/objectrelated/:object/:id/:related', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
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
		        	knex.destroy();
		          	res.send(model);
		        });
			}catch(err){
				knex.destroy();
				console.log(err);
			}
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.get('/objectin/:object/:id/:related', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
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
			    		knex.destroy();
			    		res.send(response);
			    	});
			    }).catch(function(error) {
			    	knex.destroy();
			      	console.log(error);
			      	res.send('An error occured');
			    });
			}catch(err){
				knex.destroy();
				console.log(err);
			}
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.get('/object/:object/:id', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
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
		    	knex.destroy();
		      	res.send(content.toJSON());
		    }).catch(function(error) {
		    	knex.destroy();
		      	console.log(error);
		      	res.send('An error occured');
		    });
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.put('/object/:object/:id', [validateRestTenant, RestEnsureAuthorized, multer(), uploadFiles, uploadBase64Files], function(req, res) {
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
					knex.destroy();
			  		res.json(model.attributes);
				});
			}catch(err){
				knex.destroy();
				console.log(err);
				res.send('An error occured, please validate data and RECORD ID');
			}
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.delete('/object/:object/:id', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
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
					knex.destroy();
					res.json({message: table.capitalize() + ' successfully deleted', status: 200});
				})
				.catch(function (err) {
					knex.destroy();
					res.status(500).json({error: true, data: {message: err.message}});
				});
			});
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

router.post('/user/login', validateRestTenant, function(req, res) {
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
	    		//res.json({'status':200, 'name': the_user.name, 'lastname': the_user.lastname, 'email': the_user.email, 'role': the_user.role_id, 'res': true, 'message': 'Bienvenido de nuevo '+ the_user.name + ' ' + the_user.lastname, 'token': token_db});
	    		delete the_user.password;
				delete the_user.salt;
				delete the_user.temp_str;
				delete the_user.deviceId;
				the_user.status = 200;
				the_user.res = true;
				the_user.message = "Bienvenido de nuevo "+the_user.name+ " " + the_user.lastname;
				the_user.role = the_user.role_id;
				delete the_user.role_id;
				knex.destroy();
	    		res.json(the_user);
			}else{
				knex.destroy();
				res.json({'response':"Invalid Password",'res':false, 'status': 600});
			}
    	}else{
    		knex.destroy();
    		res.json({'response':"El usuario no existe",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured');
    });
});


router.post('/user/register', validateRestTenant, function(req, res) {
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
		  				knex.destroy();
	  					res.json(model.attributes);
					});
		  		};
			}).catch(function(err){
				knex.destroy();
				if (err.code === "ER_DUP_ENTRY") {
					res.json({"error": err.code, "status": 500, "message": "Su correo electrónico ya esta registrado en nuestra base de datos"});
				};
			});
		}else{
			res.json({"error": "Password_Weak", "status": 500, "message": "Password Inseguro"});
		}
	}else{
		res.json({"error": "Invalid_Email", "status": 500, "message": "Error no válido"});
	}
	}catch(err){
		res.json({"error": "Generic", "status": 500, "message": "Error genérico "+err});
	}
});


router.post('/filterrelated/:object', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
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
					    	knex.destroy();
					      	res.send(c);
						}).catch(function(error) {
							knex.destroy();
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
					    	knex.destroy();
					      	res.send(c);
						}).catch(function(error) {
							knex.destroy();
					      	console.log(error);
					      	res.send('An error occured');
					    });
					});
					/*  END Final */
				}
			}catch(err){
				knex.destroy();
				console.log(err);
			}
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
});

/* GET home page. */
router.get('/', [validateTenant, FrontEnsureAuthorized], function(req, res) {
	var object = bookshelf.Model.extend({
		tableName: 'user'
	});
	new object({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		knex.destroy();
    		res.render('index.html', {title: 'StarkBaas', userdata: user.toJSON()});
    	}else{
    		knex.destroy();
    		res.json({'response':"El usuario no existe",'res':false, 'status': 403});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	res.send('An error occured');
    });
});

router.get('/apps', validateTenant, function(req, res) {
	knex.destroy();
  	res.render('apps');
});

router.get('/login', validateTenant, function(req, res) {
	knex.destroy();
  	res.render('login.html', {title: 'Login StarkBaas'});
});

router.get('/partials/:module/:name', [validateTenant, FrontEnsureAuthorized], function(req, res) {
	var module = req.params.module;
	var name = req.params.name;
	knex.destroy();
  	res.render(module + '/' + name + ".html");
});

router.get('/partialsfree/:module/:name', validateTenant, function(req, res) {
	var module = req.params.module;
	var name = req.params.name;
	knex.destroy();
  	res.render(module + '/' + name + ".html");
  	//res.render("login.html");
});

router.get('/app/:object', [validateRestTenant, RestEnsureAuthorized], function(req, res) {
	var objSec = bookshelf.Model.extend({
		tableName: 'user'
	});
	new objSec({token: req.token}).fetch()
    .then(function(user) {
    	if (user) {
    		var table = req.params.object;
    		var role = user.attributes.role_id;
			var objModel = {tableName: table};
			var object = bookshelf.Model.extend(objModel);
    			new object().where({role_id:role, menu: 1}).fetchAll().then(function(model) {
					if (model.toJSON().length > 0) {
							var userData = user.toJSON();
							var modelData = model.toJSON();
							delete userData.token;
							delete userData.password;
							delete userData.salt;
							delete userData.temp_str;
							delete userData.deviceId;
							var resdata = {};
							resdata.res = true;
							resdata.data = {};
							resdata.data.user = userData;
							resdata.data.permissions = modelData;
							resdata.status = 200;
							knex.destroy();
							res.send(resdata);
					}else{
						knex.destroy();
						res.json({'response':"No permissions", 'res':false, 'status': 200});
					}
				}).catch(function(err){
					knex.destroy();
					res.json(err);
				});
    	}else{
    		knex.destroy();
    		res.json({'response':"Token not valid",'res':false, 'status': 600});
    	}
    }).catch(function(error) {
    	knex.destroy();
      	console.log(error);
      	res.send('An error occured'+error);
    });
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


/* subdomains */


function validateRestTenant(req, res, next) {
	var domain = req.get('host').match(/\w+/);
	var subdomain = "";
	if (domain) {
		subdomain = domain[0];
		validateDB(subdomain, function (bool){
			if(bool){
				dbConfig = {
				  client: 'mysql',
				  connection: {
				    host: 'localhost',
				    user: 'root',
				    password: 'root',
				    database: subdomain,
				    charset: 'utf8',
				    timezone: 'utc-5'
				  },
				  pool: {
				  	min: 0,
				  	max: 500
				  }
				};
				knex = require('knex')(dbConfig);
				bookshelf = require('bookshelf')(knex);
				// change s3 bucket from db client credentials
				fileBucket = new AWS.S3({params: {Bucket: 'logisticastarkmbaas'}});
				next();
			} else {
				res.status(403).send({'response':"App resource not found, please specify your app",'res':false, 'status': 403});
			}
		});
	} else {
		res.status(403).send({'response':"App resource not found, please specify your app",'res':false, 'status': 403});
	}
}

function validateTenant(req, res, next) {
	var domain = req.get('host').match(/\w+/);
	var subdomain = "";
	if (domain) {
		subdomain = domain[0];
		validateDB(subdomain, function (bool){
			if(bool){
				dbConfig = {
				  client: 'mysql',
				  connection: {
				    host: 'localhost',
				    user: 'root',
				    password: 'root',
				    database: subdomain,
				    charset: 'utf8',
				    timezone: 'utc-5'
				  },
				  pool: {
				  	min: 0,
				  	max: 500
				  }
				};
				knex = require('knex')(dbConfig);
				bookshelf = require('bookshelf')(knex);
				// change s3 bucket from db client credentials
				fileBucket = new AWS.S3({params: {Bucket: 'logisticastarkmbaas'}});
				next();
			} else {
				res.render('index.html', {title: 'StarkBaas - ', isLogged: false});
			}
		});
	} else {
		res.render('index.html', {title: 'StarkBaas - ', isLogged: false});
	}
}

function validateDB(db, callback){
	var mysql = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'root',
	  password : 'root'
	});
	var query = "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = " + connection.escape(db);
	connection.query(query, function(err, rows) {
		var exists = false;
		if (err){
			console.log(err);
			exists = false;
		} else {
			if (rows.length > 0) {
				exists = true;
			} else {
				exists = false;
			}
		}
		connection.destroy();
		callback(exists);
	});
}

/* subdomains end */

function FrontEnsureAuthorized(req, res, next) {
	var bearerToken;
    var bearerHeader = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        bearerToken = bearerHeader;
        req.token = bearerToken;
        next();
    } else {
    	//res.redirect('login');
    	res.render('dashboard.html', {title: 'StarkBaas', isLogged: false});
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

function uploadBase64Files(req, res, next){
	var datos = req.body;
	var regex = /[0-9a-zA-Z\+/=]{20,}/;
	var regexurl = /^(http(?:s)?\:\/\/[a-zA-Z0-9]+(?:(?:\.|\-)[a-zA-Z0-9]+)+(?:\:\d+)?(?:\/[\w\-]+)*(?:\/?|\/\w+\.[a-zA-Z]{2,4}(?:\?[\w]+\=[\w\-]+)?)?(?:\&[\w]+\=[\w\-]+)*)$/;
	var filesArr = [];
	var fileNamesArr = [];
	var theFile = [];
	var url = "";
	var nameFile = "";
	var nameArr = [];
	var pos = 0;
	var i = 1;
	var k = 1;
	if (Object.keys(datos).length > 0) {
		var countFiles = 0;
		for(var data in datos) {
			if (!regexurl.test(datos[data])) {
				if (regex.test(datos[data])) {
					countFiles++;
				}
			}
		}
		if (countFiles > 0) {
			for(var data in datos) {
				if (!regexurl.test(datos[data])) {
					if (regex.test(datos[data])) {
						var theFile = datos[data];
						filesArr[k] = data;
						var s3filename = rand(160, 36)+Date.now();
						fileNamesArr[k] = s3filename+getExtensionFromMime(guessFileMime(datos[data]));
						uploadBase64ToS3(new Buffer(datos[data], 'base64'), datos[data], s3filename, function (err, data) {
							if (err) {
					            console.error(err);
					            res.status(500).send('failed to upload to s3').end();
			        		}else{
			        			url = data.Location;
					        	nameArr = url.split("/");
					        	nameFile = nameArr[(nameArr.length)-1];
					        	pos = fileNamesArr.indexOf(nameFile);
					        	req.body[filesArr[pos]] = data.Location;
			        			if (countFiles == i) {
			        				next();
			        			};
			        			i++;
			        		}
						});
						k++;
					}
				}
			}
		} else {
			next();
		}
	}
}

function uploadFiles (req, res, next) {
	var files = req.files;
	if (Object.keys(files).length > 0) {
		var countFiles = Object.keys(files).length;
		var i = 1;
		var k = 1;
		var filesArr = [];
		var fileNamesArr = [];
		var filePathsArr = [];
		var theFile = [];
		var url = "";
		var nameFile = "";
		var nameArr = [];
		var pos = 0;
		for(var file in files) {
			var theFile = files[file];
			filesArr[k] = file;
			fileNamesArr[k] = theFile.name;
			filePathsArr[k] = theFile.path;
			uploadToS3(theFile, theFile.name, theFile.extension, function (err, data) {
		        if (err) {
		            console.error(err);
		            res.status(500).send('failed to upload to s3').end();
		        }else{
		        	url = data.Location;
		        	nameArr = url.split("/");
		        	nameFile = nameArr[(nameArr.length)-1];
		        	pos = fileNamesArr.indexOf(nameFile);
		        	req.body[filesArr[pos]] = data.Location;
		        	fs.unlink(filePathsArr[pos], function (err) {
			    		if (err) {
			    			res.status(600).send(err);
			    		}
	    			});
		        	if (countFiles == i) {
		        		next();
		        	};
		        	i++;
		        }
	    	});
	    	k++;
		}
	} else {
		next();
	}
}

function uploadToS3(file, destFileName, extension, callback) {
    fileBucket.upload({
            ACL: 'public-read',
            Body: fs.createReadStream(file.path),
            Key: destFileName.toString(),
            ContentType: validateContentType(extension)
        }).send(callback);
}

function uploadBase64ToS3(file, base64, destFileName, callback) {
	var mime = guessFileMime(base64);
  	fileBucket.upload({
  		ACL: 'public-read',
  		Body: file,
  		Key: destFileName.toString()+getExtensionFromMime(mime),
  		ContentType: mime
  	}).send(callback);
}

function validateContentType(ext){
	var images = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tiff'];
	var sounds = ['mp3'];
	if (images.indexOf(ext) !== -1) {
		if (ext == 'jpg') {
			ext = 'jpeg';
		};
		return 'image/'+images[images.indexOf(ext)];
	} else if (sounds.indexOf(ext) !== -1) {
		return 'audio/'+sounds[sounds.indexOf(ext)];
	} else{
		return 'application/octet-stream';
	}
}

function guessFileMime(data){
  if(data.charAt(0)=='/'){
    return "image/jpeg";
  }else if(data.charAt(0)=='R'){
    return "image/gif";
  }else if(data.charAt(0)=='i'){
    return "image/png";
  } else if(data.charAt(0)=='S'){
  	return "audio/mpeg";
  } else{
  	return 'application/octet-stream';
  }
}

function getExtensionFromMime(data){
  if(data == "image/jpeg"){
    return ".jpg";
  }else if(data == "image/gif"){
    return ".gif";
  }else if(data == "image/png"){
    return ".png";
  }else if(data == "audio/mpeg"){
    return "audio/mp3";
  }else{
  	return "";
  }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = router;