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
*Instructions : pour créer le container on va lancer l'image. Bien penser à mapper les ports (interne à Docker avec le port externe sur la machine hôte). [Aide ici](https://docs.docker.com/engine/reference/commandline/run/)*

*docker ps vous permettra de vérifier si votre container est lancé.*

[suivant](https://github.com/ValentinDupetitpre/wassup_docker/tree/Step1-5-AddEnvVar)
