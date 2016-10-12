const http = require('http')
const qs = require('querystring')
const db = require('sqlite')
const program = require('commander')
const inquirer = require('inquirer')

db.open('avions.db').then(() => {
	return db.run("CREATE TABLE IF NOT EXISTS avions (id, name, description, year, price)")
}).then(() => {
	return db.run("CREATE TABLE IF NOT EXISTS avionsAdd (planeId, name, price)")
}).then(() => {
	console.log('bdd ready')
	db.get("SELECT * FROM avions").then((test) => {
		if(test === undefined) insertIntoBdd()
		start()
	})
})

function start(){
	program
		.version('1.0.1')
		.option('-s, --start', 'Start the server')
		.option('-i, --insert', 'Insert into db')
		.option('-f, --flush', 'Flush the db')
		.option('-n, --new [name]', 'Create new Table')
		.option('-c, --champ [Nbr]', 'Argument for -n')

	program.parse(process.argv)

	if(program.start){
		http.createServer((req, res) => {
		var url = req.url.split("/")
		console.log(url)
		switch(url[1]){
			case "getAvions":
				console.log("getAvions")
				db.all("SELECT * FROM avions").then((data) => {
					encodeData(data).then((datas) => {
						res.write(datas)
						res.end()
					})
				})
				break
			case "getOnePlane":
				console.log("getOnePlane")
				var request = `SELECT * 
								FROM avions 
								WHERE name = '` + url[2] + `'`
				db.all(request).then((data) => {
					encodeData(data).then((datas) => {
						res.write(datas)
						res.end()
					})
				})
				break
			case "getEquipement":
				console.log("getEquipement")
				var request = `SELECT * FROM avions AS P JOIN avionsAdd AS A ON  A.planeId = P.id WHERE P.name = '` + url[2] + "'" 
				db.all(request).then((data) => {
					encodeData(data).then((datas) => {
						res.write(datas)
						res.end()
					})
				}).catch((err) => {
					console.log("ERREUR : " + err)
				})
			}
		}).listen(8081)
	}
	if(program.insert){
		inquirer.prompt([
			{
				type:'list',
				message:'Dans quelle table souhaitez vous écrire ?',
				name:'table',
				choices: ['Avions',
						'Options pour avions']
			}
		]).then((answer) => {
				UserInsertBdd(answer)
		})
	}
	if(program.flush){
		inquirer.prompt([
		{
			type:'confirm',
			message:'Etes vous sur de vouloir formater la bdd ?',
			name:'answer'
		}.then((answer) => {
			flushDB()
		})
		])
	}
	if(program.new){
		let answers = []
		if(program.champ){
			askChampDb(program.champ).then((result) => {
				createListChamp(result).then((listChamp) => {
					// db.run("CREATE TABLE IF NOT EXISTS " + program.new + " " + listChamp)				
				}).catch((err) => {
					console.log("ERR> " + err)
				})
			})
		}else{
			console.log("nop")
		}
	}
}
function askChampDb(champTt){
	let prompt = []
	return new Promise((resolve, reject) => {
		for(let i = 0; i < champTt; i++){
			let champ = "champ_" + (i+1)
			prompt.push({type:'input',message:'Entrez le nom du '+champ,name:champ})
			if(i >= champTt-1){
				// console.log(prompt)
				resolve(prompt)
			}
		}
	}).then((answers) => {
		return new Promise((resolve, reject) => {
			inquirer.prompt(answers).then((answer) => {
				resolve(answer)
			})
		})
	})
}

function createListChamp(champArray){
	return new Promise((resolve, reject) => {
		// var request = "("
		// console.log(champArray.champ_1)
		// for(champ in champArray){
			// console.log(champ)
			
			// if(i = champArray.length) resolve()
		// }
	reject('Suite en développement')
	})
}
function insertIntoBdd(){
	db.run("INSERT INTO avions VALUES (?,?,?,?,?)", "1", "Falcon_2000", "Premier avion d'affaires biréacteur construit sans maquette physique", "1993", "50")
	db.run("INSERT INTO avions VALUES (?,?,?,?,?)", "2", "Rafale_F3-R", "Evolution du standart F3 qui s'inscrit dans la démarche d'amélioration continue de l'avion nourrie par les retours d'expérience", "2013", "210")
	db.run("INSERT INTO avions VALUES (?,?,?,?,?)", "3", "nEUROn", "Premier démonstrateur technologique européen d'avion de combat furtif sans pilote à bord", "2012", "250")

	db.run("INSERT INTO avionsAdd VALUES (?,?,?)", "1", "Siege cuir", "1")
	db.run("INSERT INTO avionsAdd VALUES (?,?,?)", "1", "Peinture Chrome", "5")
	db.run("INSERT INTO avionsAdd VALUES (?,?,?)", "1", "Mini-bar", "2")
	db.run("INSERT INTO avionsAdd VALUES (?,?,?)", "2", "Missile supplementaire", "10")
	db.run("INSERT INTO avionsAdd VALUES (?,?,?)", "2", "Modification moteur", "2")
	db.run("INSERT INTO avionsAdd VALUES (?,?,?)", "2", "Siege ejectable", "30")
	db.run("INSERT INTO avionsAdd VALUES (?,?,?)", "3", "Ajouter un pilote", "150")
	db.run("INSERT INTO avionsAdd VALUES (?,?,?)", "3", "Ajout de moteur non furtif", "50")
	db.run("INSERT INTO avionsAdd VALUES (?,?,?)", "3", "Radar", "6")
}
function encodeData(data){
	let datas = ""
	return new Promise((resolve, reject) => {
		for(var i = 0; i < data.length; i++){
			// console.log(data[i].id)
			datas += data[i].name + "," + data[i].description + "," + data[i].year + "," + data[i].price + "/"
		}
		datas = datas.substr(0, datas.length-1)
		resolve(datas)
	})
}
function UserInsertBdd(previousAnswer){
	
}
function flushDB(){
	
}
