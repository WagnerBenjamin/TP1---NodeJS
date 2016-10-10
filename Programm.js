#!/usr/bin/env node
const program = require('commander')
const inquirer = require('inquirer')
const fs = require('fs')
const http = require("http")

var choosenPlane = ""
var URL = 'http://localhost:8081/'
start()

function start(){
	callAPI('getAvions').then((datas) => {
		let choice = []
		for(let i = 0; i < datas.length; i++){
			choice[i] = datas[i][0]
		}
		inquirer.prompt([
		{
			type:'list',
			message:'Quelle avion souhaitez vous regardez ?',
			name:'plane',
			choices: choice
		}
		]).then((answer) => {
			saveAnswer(answer.plane)
			chooseWhatToDo(answer.plane)
		})
	})
}

function saveAnswer(plane){
	callAPI('getOnePlane/' + plane).then((result) => {
		choosenPlane = result[0]
		// console.log(choosenPlane[1])
	})
}

function callAPI(param){
	let result
	let urlComposed = URL + param
	return new Promise((resolve, reject) => {
		http.get(urlComposed, function(res) {
			var data = ""
			res.on('data', function (chunk) {
				data += chunk
			})
			return new Promise((resolve, reject) => {
				res.on("end", () => {
					let datas = decodeData(data)
					resolve(datas)
				})
			}).then((datas) => {
				resolve(datas)
			})
		})
	})
}

function decodeData(data){
	return new Promise((resolve, reject) => {
		let tmp = data.split("/")
		let datas = []
		for(var i = 0; i < tmp.length; i++){
			datas[i] = tmp[i].split(",")
		}
		resolve(datas)
	})
}

function showDescription(plane){
	console.log("\nNom : " + choosenPlane[0] + 
				"\nAnnée : " + choosenPlane[2] + 
				"\nDescription : " + choosenPlane[1] + 
				"\nPrix : $" + choosenPlane[3] + "m\n")
	chooseWhatToDo(choosenPlane[0])
}

function showEquipements(plane){
	callAPI("getEquipement/" + plane).then((result) => {
		console.log("\nNom : " + result[0][0] + 
					"\nPrix : $" + result[0][3] + "m\n" +
					"\nNom : " + result[1][0] + 
					"\nPrix : $" + result[1][3] + "m\n" +
					"\nNom : " + result[2][0] + 
					"\nPrix : $" + result[2][3] + "m\n")
		chooseWhatToDo(choosenPlane[0])
	})
}

function orderPlane(plane){
	callAPI("getEquipement/" + plane).then((result) => {
		let choice = []
		var price = parseInt(choosenPlane[3])
		for(let i = 0; i < result.length; i++){
			choice[i] = result[i][0] + " ($" + result[i][3] + "m)"
		}
		inquirer.prompt([
			{
				type:'checkbox',
				message:'Souhaitez vous ajouter des options à votre ' + plane + ' ?',
				name:'options',
				choices: choice
			}
		]).then((answer) => {
			console.log(answer)
			var text = 'Dassault Aviation vous remercie pour cette achat\r\nVous avez acheter ' + plane + ' pour $' + choosenPlane[3] + 'm\r\n\r\n'
			// console.log(answer.options)
			if(answer.options != ""){
				text += 'Vous avez également ajouté ces options :\r\n'
				for(let i = 0; i < answer.options.length; i++){
					let optionData = answer.options[i].split("(")
					optionData[0] = optionData[0].substr(0, optionData[0].length-1)
					optionData[1] = optionData[1].substr(1, optionData[1].length-3)
					price += parseInt(optionData[1])
					text += " - " + optionData[0] + " pour $" + optionData[1] + "m\r\n"
				}
			} else {
				text += "Vous n'avez ajouté aucune options"
			}
			text += "\r\nNous vous remercions pour votre confiance et esperons vous revoir bientot chez nous\r\n\r\nBon Vol !
			fs.writeFile('order.txt', text, (err) => {
				if(err) throw err
				console.log('fichier écrit')
			})
		})
	})
}

function chooseWhatToDo(previousAnswer){
	inquirer.prompt([
	{
		type:'list',
		message:'Que shouhaitez vous faire ?',
		name:'choice',
		choices:[
			'Regarder la Description',
			'Regarder les equipements',
			'commander',
			'retour'
		]
	}
	]).then((answer) => {
		switch(answer.choice){
			case 'Regarder la Description':
				showDescription(previousAnswer)
				break
			case 'Regarder les equipements':
				showEquipements(previousAnswer)
				break
			case 'commander':
				orderPlane(previousAnswer)
				break
			case 'retour':
				start()
				break
		}
	})
}


