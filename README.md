# wassup_docker
## Pré-requis
https://runnable.com/docker/install-docker-on-macos

## Step 1 
### Créer un environnement node Express
### Créer un Dockerfile
  * FROM, this is us selecting an OS image from Docker Hub. Docker Hub is a global repository that contains images that we can pull down locally. In our case we are choosing an image based on Ubuntu that has Node.js installed, it’s called node. We also specify that we want the latest version of it, by using the following tag :latest
  * WORKDIR, this simply means we set a working directory. This is a way to set up for what is to happen later, in the next command below
  * COPY, here we copy the files from the directory we are standing into the directory specified by our WORKDIR command
  * RUN, this runs a command in the terminal, in our case we are installing all the libraries we need to build our Node.js express application
  * EXPOSE, this means we are opening up a port, it is through this port that we communicate with our container
  * ENTRYPOINT, this is where we should state how we start up our application, the commands need to be specified as an array so the array [“node”, “app.js”] will be translated to the node app.js in the terminal

### Créer une image
```
docker build -t uxrepublic/node:latest .
```
Cette ligne de commande créé une image. Le "." indique à Docker où se trouve le Dockerfile (ici le répertoire actuel). Si vous n'avez l'image de l'OS du FROM (dans Dockerfile) elle sera téléchargée depuis le Docker Hub. Ensuite votre image sera créée.

Dans le terminal vous pouvez observer que l'image de l'OS (node:latest) est téléchargée depuis le Docker Hub. Ensuite chacune des commandes du Dockerfile sont executées (WORKDIR, RUN...)

```
docker images
```
Permet de voir l'image que l'on vient de créer
### Créer un container
```
docker run uxrepublic/node
```
On a besoin de mapper le port interne de l'app à un port externe sur la machine qui le lance. On a besoin de rajouter :
```
-p [external port]:[internal port]
```
----------------------------------------------------------------------
NB: Pour stopper un docker run -> ouvrir un nouvel onglet de terminal. Les 3 premiers charactères du l'id suffisent
```
docker ps
docker stop <idContainer>
```
----------------------------------------------------------------------

Pour accéder à son docker on lance donc la commande suivante et on se connecte au localhost:8000
```
docker run -p 8000:3000 uxrepublic/node
```

### Ajouter des variables d'environnement

On a ajouté une variable d'environnement dans le Dockerfile pour le PORT. On utilise le $ pour appeler une variable dans ce fichier.

### Lire les variables d'environnement dans App.js

Depuis Node, on peut lire les variables d'environnement grâce à process.env.PORT

### Gestion du container
  * Mode Deamon - Rajouter -d au docker run pour voir l'id du container lancé. C'est plus simple s'il faut l'arrêter. Avec ce mode, le container est lancé en arrière-plan et aucun output n'apparait dans la console.
  * Mode Interactif - Ce mode permet de 'rentrer' dans le container qui fonctionne et effectuer des commandes bash par exemple. Pour cela il faut lancer la commande suivante.
 ```
docker exec -it <id> bash
```
On peut lancer une commande (node par exemple) dans le container avec la ligne de commande suivante
```
docker exec <id> node app.js
```

----------------------------------------------------------------------
NB : Docker Stop Vs Docker Kill

Docker stop lance les commandes SIGTERM puis SIGKILL. Ca permet de stoper Docker plus proprement en sauvegardant l'état.
Docker kill lance seulement SIGKILL. L'état n'est pas nécessairement sauvegardé.
En prod il vaut mieux lancer Docker stop.

----------------------------------------------------------------------

Pour nettoyer Docker de tous les containers qui peuvent tourner en arrière plan :
```
docker rm <id>
```

## Step 2 
### Mise à jour de l'app
  * Stopper le container
  * Retirer le container
  * Recréer l'image
  * Lancer le container à nouveau


Après une mise à jour de l'app, les changements ne sont pas reportés sur le container. Les commandes ci-dessus permettent de le mettre à jour.

Tout d'abord pour ne plus s'embêter à récupérer l'id du container, nous allons lui donner un nom avec la balise --name

```
docker run -d -p 8000:3000 --name my-container uxrepublic/node
```

Ensuite nous allons chainer les commandes pour mettre à jour notre container

```
docker stop my-container && docker rm my-container && docker build -t uxrepublic/node . && docker run -d -p 8000:3000 --name my-container uxrepublic/node
```

C'est bien mais pas top, Ca fait beaucoup de commandes pour mettre à jour le container. On peut faire mieux...avec un volume. 

### Créer et gérer un Volume

```
docker volume create [nom du volume]
```

Pour vérifier que le volume a bien été créé :

```
docker volume ls
```

Vous aurez l'occasion de créer un certain nombre de volumes. Pour supprimé tous ceux non utilisés :

```
docker volume prune
```

Pour en retirer un seul connu il suffit de lancer la commande suivante :

```
docker volume rm [nom du volume]
```

Pour voir davantage d'infos sur un volume, notamment où il place les fichiers persistés, lancer la commande ci-dessous. Le champs Mountpoint permet de connaître le placement de ces fichiers.

```
docker inspect [nom du volume]
```

### Monter un volume

Pour monter un volume, nous avons deux possibilités : avec --mount ou --volume (-v). Leur syntax ci-dessous:

```
-v [name of volume]:[directory in the container]
-mount source=[name of volume],target=[directory in container]
```

On test la commande en lancant notre container

```
docker run -d -p 8000:3000 --name my-container --volume monVol:/monVol uxrepublic/node
```

En faisant un docker inspect my-container on obtient un JSON. Notre volume a bien été monté dans le container, on peut le vérifier dans la propriété "Mounts"

On peut vérifier où est le volume dans notre container.

```
docker exec -it my-container bash
```

Le volume se trouve ici : ../monVol/

Dorénavant, si nous stoppons le container, tout ce que nous avons créé dans notre volume sera persisté, le reste sera supprimé. 

### Monter un sous-répertoire en tant que volume

On peut utiliser un répertoire en tant que volume avec Docker. Pour cela nous allons créer un fichier dans un nouveau repertoire : /test/logs.txt que l'on initialize avec un texte.

```
docker run -d -p 8000:3000 --name my-other-container --volume $(pwd)/test:/logs uxrepublic/node
```

Ici $(pwd)/test indique que l'on va utiliser ce repertoire en tant que source pour le volume et que l'on va retrouver son contenu dans /logs dans le volume. Autrement dit, on monte le repertoire test de notre dossier actuel dans un repertoire qui s'appelle logs dans le volume.

En lancant une commande bash sur le container on peut retrouver ce que l'on avait mis dans logs.txt.
Si on modifie le fichier sur notre ordinateur, il s'en retrouve modifié dans le volume.

### Considérer une app comme un volume

Pour commencer on kill et supprime le container que l'on vient de faire. Puis on relance le container avec un volume différent : --volume $(pwd):/app : 

```
docker run -d -p 8000:3000 --name my-container --volume $(pwd):/app uxrepublic/node
```

Dorénavant, lorsque quelque chose sera modifié dans l'app, les changements seront reportés sur le container.

Ajouter une route dans express puis tester.

Ça ne fonctionne pas. Ici le problème ne vient pas de docker mais de node, celui-ci a besoin d'être relancer pour que ces changements soient effectifs. 

Installer nodemon dans l'app et mettre à jour le package.json

Pour que Docker prenne en compte ce nouveau mode de lancement de node, il faut modifier le Dockerfile.

```
ENTRYPOINT ["npm", "start"]
```

Rebuild le container et relance le. La route faite tout à l'heure doit fonctionner, mais nous avons relancé docker donc ca ne veut pas dire que ce qu'on vient de faire fonctionne. Créé une autre route et teste là. Bingo !

## Step 3 db
### Installer et connecter Mysql

Sur mac (pour les autres os : télécharger un exec) : 
```
brew install mysql
```

mysql -uroot ne fonctionne pas ? lancer la commande suivante :

```
brew services start mysql
```

Réessayer de se connecter à mysql. Créer une table (préférablemet dans un fichier sql). Si vous avez fais un fichier sql un simple : source [fichier.sql] devrait suffire. 

```
show tables;
```

Votre table a bien été créée. Passons à la suite.

### Mysql en Image Docker 

2 possibilités pour intégrer mysql à docker. Soit dans l'app, soit dans un container différent. En fonction de votre besoin vous choisirez l'une ou l'autre de ces solutions. 

Nous allons commencer avec la solution où Mysql est seul dans un container. 

```
docker run --name=mysql-db mysql
```

Oups, des erreurs : la bdd n'est pas initialisée, nous avons oublié d'indiquer l'option password.

```
docker run --name mysql-db -e MYSQL_ROOT_PASSWORD=complexpassword -d -p 8000:3306 mysql
```

Avec un docker ps on voit que l'on peut accéder à la base de donnée via 0.0.0.0:8001

```
mysql -uroot -pcomplexpassword -h 0.0.0.0 -P 8001
```

C'est connecté. Bravo. Mais..peut-on atteindre un container depuis un autre ? Pour ce faire on a besoin de lier les deux. Nous verrons ça plus tard.

### Connecter Node a Mysql

Maintenant essayons de connecter node à un container mysql. 

```
npm install mysql
```

Puis ajouter dans le fichier app.js :

```
const mysql = require('mysql');
const con = mysql.createConnection({
    host: "localhost",
    port: 8001,
    user: "root",
    password: "complexpassword",
    database: 'Customer'
});

con.connect(function (err) {

if (err) throw err;
 console.log("Connected!");
});
```

Si on lance 

```
node app.js
```

Erreur :( C'est parce que caching_sha2_password arrive dans Mysql 8.0 et la version de node n'implémente pas encore ce qu'il faut pour s'authentifier. On peut passer outre ce problème avec ces lignes de commandes :

```
mysql -uroot -pcomplexpassword -h 0.0.0.0 -P 8001
```

```
mysql> ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'complexpassword';
mysql> FLUSH PRIVILEGES;
```

Si on réessaye de lancer node app.js, plus de problèmes, ça fonctionne ! 

Mysql possède un plugin mysql_native_password qui implémente une authentification en natif, c'est-à-dire l'authentification basée sur la méthode de hachage de mots de passe utilisée avant l'introduction d'authentification pluggable. 

La bibliothèque mysql de node est en retard sur Mysql 8 qui est passée à un nouveau système d'authentification pluggable. Donc soit vous choisissez de pull une version antérieure de MySql soit de revenir à l'authentification native.

### Connecter des Containers

Pour commencer il faut tuer et supprimer le container my-container sur lequel on a travaillé jusqu'ici. Ensuite on modifie le fichier app.js 

```
const con = mysql.createConnection({
    host: "mysql",
    user: "root",
    password: "complexpassword",
    database: 'Customer'
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to mysql!");
});
```
Il faut builder à nouveau notre container puis lancer la commande suivante :

```
docker run -d -p 8000:3000 --name my-container --link mysql-db:mysql uxrepublic/node
```

Que fait-on ? 

On créé un container qui s'appelle 'my-container'. 

Avec --link nous lions notre container my-container avec le container mysql-db. 

L'alias mysql dans la deuxieme partie du --link est le nom que nous retrouvons comme host dans notre base de données de app.js

De plus, nous avons modifié l'host pour matcher avec la commande link et supprimé la partie port dans notre conf de bdd. La liaison entre les deux containers gère le port elle-même.

Vérifions si les deux containers sont bien connectés : 

```
docker logs my-container
```

Si vous voyez apparaitre "Connected to mysql!" C'est que c'est bon. C'est le console log dans le callback de connexion de la bdd. Bravo

### Connecter des Containers différemment

Nous venons de lier des containers avec de l'héritage. On peut le faire d'une autre manière, en créant des réseaux ou des 'custom bridge network' entre les containers. Il s'agit de créer un réseau auquel font partie des containers. 

NB : Un container peut faire partie de plusieurs réseaux

```
docker network create --driver bridge isolated_network

docker run -d -p 8000:3000 --net isolated_network --name my-container uxrepublic/node

docker run -p 8001:3306 --net isolated_network --name mysql-db -e MYSQL_ROOT_PASSWORD=complexpassword -d mysql
```

Comme vous pouvez le voir, il suffit de rajouter le tag --net [name of network] pour intégrer le container au réseau. 

### Gestion de la base de données

  * Le fichier de structure de la base de données doit être lancé à un moment donné. Soit on se connecte avec le client mysql et on indique l'emplacement du fichier sur l'ordinateur hôte. Soit on place ce fichier dans l'app et on laisse le Dockerfile l'ajouter au container. Sinon il peut être intéressant d'utiliser les bibliothèques Sequelize ou Knex qui supportent bien les migrations et spécifier la structure de la base de données.
  * Le fichier de jeu de données de la base de données peut être traité de la même manière que le fichier de structure. Il doit être appelé une fois la structure appliquée et ne doit être appelé qu'une fois. Il est souvent recommendé de rajouter des données à la main, en se connectant à mysql et appelant le fichier de jeu de données.

## Step 4 Docker compose

### Pourquoi Docker compose

Docker compose va être utilisé lorsque nous aurons besoin de gérer des micro-services.
Une architecture en micro-services c'est :
* **À couplage faible** : chaque service n'est pas dépendant d'un autre. Les données dont ils ont besoin sont disponibles et ils peuvent communiquer entre eux en appelant leur API.
* **Déployable indépendamment** : on peut lancer, stopper, rebuilder un service sans affecter les autres. 
* **Fortement maintenable et testable** : les services sont petits et donc peu compliqués. Comme ils ne dépendent pas d'autres services, ceux-ci sont plus facilement testables.
* **Organisés autour de problématiques métier** : les services sont organisés autour de thèmes.

Cette architecture est flexible car sans (ou peu d') inter-dépendances. Il est intéressant d'utiliser les microservices plutôt qu'une architecture "monolithique" dans ces différents cas :
* l'utilisation de différentes stack ou des pocs sur des technos nouvelles. 
* la réutilisation de certains micro-services pour plusieurs projets différents par exemple.
* Impact minimal suite à un micro-service down. Les autres micro-services restent fonctionnels, contrairement à une application monolithique.

Docker va être une très bonne solution pour une architecture en micro-service on containerisant chaque micro-service. Docker compose va nous simplifier les choses car il nous permettra de gérer plusieurs containers. Sinon les lignes de commandes vont devenir très longues pour gérer de nombreux containers.

### Fonctionnalités de Docker compose

Avec Docker compose, on peut facilement builder plusieurs images d'un coup, lancer plusieurs containers... Ces fonctionnalités sont les suivantes :
* Gérer le cycle de vie de l'application
* Lancer, stopper et rebuilder les services
* Voir le status des différents services lancés
* Suivre les logs des services lancés
* Executer une commande unique sur un service

### Quand Docker seul n'est plus suffisant

Avec dockeriser quelque chose avec Docker il faut :
* Définir un Dockerfile qui contient l'image OS dont on a besoin, les bibliothèque que l'on veut installer, les variables d'environnement dont on a besoin, les ports que l'on a besoin d'ouvrir et comment lancer notre service.
* Builder une image ou puller une image existente de Docker Hub.
* Créer et lancer un container.

Pour un service on lancera au moins ces deux commandes : 

```
docker build -t some-image-name .
docker run -d -p 8000:3000 --name some-container-name some-image-name
```
Pour trois services ça donne 6 commandes à lancer. Ca peut vite devenir très lourd.

**Avec Docker Compose** on a toujours besoin du Dockerfile mais il va gérer lui-même le build des images et la gestion des containers.

Tout va se passer dans le docker-compose.yaml, on y définit tous les services d'un projet. On peut y configurer tout cela :
* **Build**, on peut spécifier le contexte du build et le nom du Dockerfile
* **Environnement**, on peut définir et dnner des valeurs à des variables d'environnement
* **Image**, au lieu de créer les images 'from-scratch', on peut définir des images préparées que l'on veut puller du Docker Hub.
* **Networks**, on peut créer des réseaux, ponts et nous pouvons également indiquer pour chaque service, à quel réseau il appartient.
* **Ports**, on peut définir le port quel port externe doit matcher quel port interne au container.
* **Volumes**, on peut définir des volumes.

### Docker compose en pratique
