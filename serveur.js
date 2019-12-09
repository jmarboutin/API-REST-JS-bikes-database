//L'application requiert l'utilisation du module Express.
//La variable express nous permettra d'utiliser les fonctionnalités du module Express.
const express = require('express');
// Nous définissons ici les paramètres du serveur.
const hostname = 'localhost';
const port = 3000;

// Nous créons un objet de type Express.
const app = express();

// Nous utiliserons un fichier JSON comme database, et les méthodes readFile et writeFile de nodejs pour lire et écrire sur ce fichier
const fs = require('fs');


// Nous utilisons body parser pour parser le contenu des requetes et récupérer les infos envoyées par le client 
const body_parser = require('body-parser');

app.use(body_parser.json());

//Afin de faciliter le routage (les URL que nous souhaitons prendre en charge dans notre API), nous créons un objet Router.
//C'est à partir de cet objet myRouter, que nous allons implémenter les méthodes.
const myRouter = express.Router();



myRouter.route('/')
// all permet de prendre en charge toutes les méthodes.
.all(function(req,res){
      res.json({message : "Bienvenue sur notre bikes API ", methode : req.method});
});

// notre route principale (/bikesdatabase).
myRouter.route('/bikesdatabase')
// J'implémente ici READ ALL (récupérer la liste de tous les vélos de la base) puis CREATE (ajouter un vélo dans la base)
.get(function(req,res){
      fs.readFile('bikesdatabase.json', 'utf8', function (error, data){
        if (error)
        throw error; // Gestion des erreurs avant de parser le JSON
        let myJson = JSON.parse(data);
        res.json(myJson);
      });
})
.post(function(req,res){
    fs.readFile('bikesdatabase.json', 'utf8', function (error, data){
        if (error)
            throw error; // Gestion des erreurs avant de parser le JSON
        let myJson = JSON.parse(data);
        let newId = {id:Math.random().toString()};// En attendant une génération d'identifiant plus avancée
        let newBikeInfo = req.body; // utilise body-parser pour récupérer les infos envoyées par le client
        let newBike = Object.assign(newId,newBikeInfo); // on crée un objet qui contient le nouvel identifiant créé par le serveur et les infos envoyées par le client 
        myJson.push(newBike);
        let newDataSt = JSON.stringify(myJson,null,'\t'); //option d'ajouter des tabulations avec la fonction Stringify pour lecture humaine plus facile
        fs.writeFile('bikesdatabase.json',newDataSt,function(error){
            if (error)
                throw error; // Gestion des erreurs pendant l'écriture
        });
      });
    res.json({message : "Vous avez posté un nouveau vélo dans la base de donnée"});
});        

// Configuration d'une route pour l'accès à une ressource à partir de son identifiant READ ONE, UPDATE ONE, DELETE ONE 
myRouter.route('/bikesdatabase/:bike_id')
.get(function(req,res) {
      fs.readFile('bikesdatabase.json', 'utf8', function (error, data){
        if (error)
            throw error; // Gestion des erreurs avant de parser le JSON
        let myJson = JSON.parse(data);
        let result = {};
        for (let entry of myJson){
            if (entry.id==req.params.bike_id){
                result = entry;
            }
        }  
        res.json(result);
      });
})
.put(function(req,res){
    let itemId = req.params.bike_id;
    let item = req.body; 
    // ouverture du fichier, boucle sur la liste pour trouver et remplacer un item
    fs.readFile('bikesdatabase.json', 'utf8', function (error, data){
        if (error)
            throw error; // Gestion des erreurs avant de parser le JSON
        let myJson = JSON.parse(data);
        let updatedJson = [];
        myJson.forEach(oldItem => {
            if (oldItem.id === itemId) {
                updatedJson.push(item);
            } else {
                updatedJson.push(oldItem);
            }
        });
   // remplacement du contenu du fichier par la liste mise à jour
        let newDataSt = JSON.stringify(updatedJson,null,'\t');
        fs.writeFile('bikesdatabase.json',newDataSt,function(error){
            if (error)
                throw error; // Gestion des erreurs pendant l'écriture
        });
        res.json({message : "Vous avez modifié les informations du vélo n°" + req.params.bike_id});
    });
})
.delete(function(req,res){
    let itemId = req.params.bike_id;
   // filter list copy, by excluding item to delete
    fs.readFile('bikesdatabase.json', 'utf8', function (error, data){
        if (error)
            throw error; // Gestion des erreurs avant de parser le JSON
        let myJson = JSON.parse(data);
        let updatedJson = myJson.filter(item => item.id !== itemId);

   // remplacement du contenu du fichier par la liste mise à jour
        let newDataSt = JSON.stringify(updatedJson,null,'\t');
        fs.writeFile('bikesdatabase.json',newDataSt,function(error){
            if (error)
                throw error; // Gestion des erreurs pendant l'écriture
        });
	  res.json({message : "Vous avez supprimé le vélo n°" + req.params.bike_id});
    });
});
// Nous demandons à l'application d'utiliser notre routeur
app.use(myRouter);

// Démarrer le serveur
app.listen(port, hostname, function(){
	console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port);
});
