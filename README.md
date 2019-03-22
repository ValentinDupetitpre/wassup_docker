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
*Instructions : monter un volume que l'on nommera monVol. Inspecter le container et observer la propriété "Mounts". Se connecter dans le container et trouver le volume. [Plus d'infos ici](https://docs.docker.com/engine/reference/commandline/run/)*

[suivant](https://github.com/ValentinDupetitpre/wassup_docker/tree/Step2-4-SubdirAsVolume#monter-un-volume)
