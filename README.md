# M300 Platformübergreifende Dienste

- [M300 Platformübergreifende Dienste](#m300-platformübergreifende-dienste)
  - [## Docker](#-docker)
    - [Was ist Docker?](#was-ist-docker)
    - [Docker auf Windows](#docker-auf-windows)
    - [Docker Architektur](#docker-architektur)
    - [Docker Workflow](#docker-workflow)
    - [1. Dockerfile](#1-dockerfile)
    - [2. Dockerimage](#2-dockerimage)
    - [3. Dockercontainer](#3-dockercontainer)
    - [Docker Volumes](#docker-volumes)
    - [Docker Networking](#docker-networking)
      - [Container exportieren](#container-exportieren)
    - [Docker Umgebung deklarativ aufsetzen](#docker-umgebung-deklarativ-aufsetzen)
    - [Docker Authentifizierung](#docker-authentifizierung)
  - [## Vagrant](#-vagrant)
    - [Vagrant Box](#vagrant-box)
    - [Vagrantfile](#vagrantfile)
    - [Vorbereitung](#vorbereitung)
    - [VM stoppen, starten und neustarten](#vm-stoppen-starten-und-neustarten)
    - [Idee](#idee)
    - [Provision Script](#provision-script)
    - [Vagrant Synced Folders](#vagrant-synced-folders)

## Docker
------------------

### Was ist Docker? 

Docker ist eine Möglichkeit um Container auf Linux zu betreiben. Um Docker zu verstehen, schaut man sich am besten den Vergleich mit Virtuellen Maschine an.

### Docker auf Windows

Docker ist für Linux entwickelt, kann aber auch auf Windows laufen. Dazu nutzt Docker WSL2 - Windows Subsystem for Linux. WSL2 funktioniert über ein heruntergebrochenes Hyper-V (Virtualisierungssoftware von Microsoft). Auf Hyper-V läuft ein Linux Kernel, welcher auch von Docker genutzt wird. 

Über Docker Desktop kann es auch per GUI genutzt werden. 

### Docker Architektur

**Docker Deamon**

- Erstellen, Ausführen und Überwachen der Container
- Bauen und speichern der Images

**Docker CLI**

- Schnittstelle zum Docker Deamon 

### Docker Workflow

**Erstellung eines eigenen Dockercontainers**

Der Grundlegende Workflow für die Erstellung eines eigenen Dockercontainers sieht so aus: 

1. Dockerfile -> 2. Dockerimage -> 3. Dockercontainer

1. Zuerst erstellt man ein Dockerfile
2. Anschliessend erstellt ("baut") man aus dem Dockerfile ein Image
3. Aus dem Image lassen sich nun beliebig viele Container erstellen

**Container Registry**

Container Registrys speichern Containerimages. Solch eine Registry kann sowohl On Premise, aber auch in der Cloud betrieben werden. Beispiele wären die Google Cloud Artifacs Registry oder die Azure Container Registry  Es gibt auch öffentliche Registrys wie hub.docker.com. 

Im normalfall werden Dockerimgages zusammen mit einer Versionsverwaltung wie Git entwickelt. Häufig konfiguriert man dies so, dass bei einem neuen Git commit, das neu gebaute Image auf eine Registry hochgeladen wird. Auf einem Containerhost kann nun das Image heruntergeladen und anschliessend daraus ein Container erstellt werden. 

Eigene Registrys können über den offiziellen Docker Registry Container aufgebaut werden: https://hub.docker.com/_/registry.

### 1. Dockerfile

Im Dockerfile wird definiert, wie ein Container aussehen soll. 

**Beispiel**

Im folgenden der Aufbau eines Dockerfile:

      FROM nginx

      RUN rm /etc/nginx/nginx.conf /etc/nginx/conf.d/default.conf

      COPY api /usr/share/nginx/html/api

      COPY start /usr/share/nginx/html/

      COPY nginx.conf /etc/nginx/nginx.conf

1. FROM: Als Baseimage wird Nginx genommen. Dies gibt uns einen funktionierenden Nginx Server.
2. RUN: Die Standardkonfiguration vom Nginx Server wird gelöscht
3. COPY: Kopiert den api Ordner in das Verzeichnis /usr/share/nginx/html/api
4. COPY: Kopiert den start Ordner in das Verzeichnis /usr/share/nginx/html/start
5. COPY: Kopiert meine nginx.conf in das /etc/nginx/ Verzeichnis

Anschliessend muss man im selben Verzeichnis wie das Dockerfile sein. Mit dem Befehl

        docker build -t zuericloudwebsitecontainer

### 2. Dockerimage

Ein Dockerimage ist das fertige Produkt nach dem Docker build aus einem Dockerfile. Ein Dockerimage ist jeweils für eine Systemarchitektur verfügbar. Sprich für einen x86 Computer wird ein anderes Image benötigt wie für einen ARM-basierten Computer. 

Das Dockerimage wird genutzt, um daraus anschliessend ein Container zu bauen. 

**Layer**

Dockerimages werden in Layer aufgetrennt. Jeder Layer stellt einen Teil des Codes dar. Aus diesem Code wird ein Hashwert berechnet. Der Hashwert ändert sich also, sobald sich auch der Code im dazugehörigen Layer ändert. 

Die Vorteile von Layers:

- Viele Containerimages überschneiden sich in ihren Abhängigkeiten, durch Layers wird überprüft, welche Layers bereits auf dem lokalen Host verfügbar sind. 
- Es werden so nur die Sachen neu heruntergeladen, die effektiv gebraucht werden
- Es verringert den Load auf Imageregistrys und ist gleichzeitig schneller

**Tags**

- Dockerimages können mit Tags gekennzeichnet werden. Der Standardtag ist :latest. Er definiert immer das neuste Image.
- Gibt man beim download vom Container nicht an, wird immer das latest Image heruntergeladen. 

### 3. Dockercontainer

docker run -p hostport:containerport -d imagename

### Docker Volumes

Die Daten in Dockercontainern sind nicht persistent. Wenn der Container also gelöscht wird, sind auch alle Daten darin weg. Bei Docker geht es aber darum, dass man das Runtime wie ein DBMS wie MySQL unabhängig und isoliert von der Hardware betreibt, die Daten soll dies aber nicht betreffen.

Hierfür gibt es Docker Volumes. Volumes bilden einen echten Pfad auf dem Host dar. Dieser Pfad wird anschliessend in den Docker Container gemounted.

Zuerst erstellt man ein Docker volume:

        docker volume create test

Um zu sehen, wo der Pfad auf dem Host gespeichert ist, kann man den Inspect command nutzen.

        docker volume inspect test

Um ein Volume in einen Container zu mounten, muss man dies beim Erstellen angeben. Die Syntax lautet -v volumename:/directory/auf/container

        docker run -d -v test:/usr/share/nginx/html

Wichtig ist auch, dass Docker Volumes nicht beim löschen des Containers mitgelöscht werden. Um ungenutze Volumes zu löschen, kann man den Befehl:

        docker volume prune

### Docker Networking

**Standardnetzwerk**

* `docker logs`
    * Gibt die "Logs" für einen Container aus. Dabei handelt es sich einfach um alles, was innerhalb des Containers nach STDERR oder STDOUT geschrieben wurde.

#### Container exportieren

Teilweise muss man ein Image auf einen Server verschieben, der kein Internetzugang hat oder mit keiner lokalen Container Registry verbunden ist. 

Docker erlaubt es, ein Image als tar-Archiv zu exportieren und anschliessend wieder zu importieren. 

                import      Import the contents from a tarball to create a filesystem image
                save        Save one or more images to a tar archive 


### Docker Umgebung deklarativ aufsetzen

Auch Docker kann deklarativ in Betrieb genommen werden. Folgende Tools können dazu genutzt werden:

- Docker Compose (Läuft Lokal auf Host)
- Terraform (Nutzt Docker API)
- Ansbile (Nutzt Docker API)

### Docker Authentifizierung


## Vagrant
----------

### Vagrant Box 

Boxen sind ein Packetformat für Vagrant Umgebungen. Diese Boxen sind also wie Dockerimages. Sie können unabhängig von der Plattform betrieben werden. Die einzige Vorraussetzung ist, dass Vagrant installiert ist.

**Quelle: https://www.vagrantup.com/docs/boxes**

### Vagrantfile

Im Vagrantfile wird definiert, welche Box als Grundlage genutzt wird und weitere Parameter, welche die VM definieren. 

### Vorbereitung 

        mkdir nginx 

        cd nginx

        vagrant init hashicorp/precise32 

        vi Vagrantfile

        Vagrant up

        vargrant ssh

        exit

Aktuell laufende Vagrant VMs sehen

        vboxmanage list runningvms 

### VM stoppen, starten und neustarten

VM "vorsichtig" stoppen:

        vagrant halt

VM starten:

        vagrant up 

VM neustarten: 

        vagrant reload

VM anhalten

        vagrant suspend

VM weiterlaufen lassen

        vagrant resume 


### Idee

- www Ordner soll persistent gespeichert sein
- Serverkonfiguration soll ebenfalls persistent gespeichert sein

### Provision Script

Im Provisionscript passiert folgendes: 

      1. Paketlisten updaten
      2. Nginx installieren
      3. sites-enabled/ directory löschen
      4. Symlink in sites-enabled/ für /vagrant/sites-enabled/ erstellen
      5. nginx starten
      6. nginx service Konfiguration neu laden

Script:

        sudo apt-get update -y

        sudo apt-get -y install nginx

        rm -r /etc/nginx/sites-enabled/

        sudo ln -s /vagrant/sites-enabled/ /etc/nginx/

        service nginx start

        sudo nginx -s reload

### Vagrant Synced Folders

Um Dateien zwischen dem Host und der Virtuellen Maschine zu sharen, kann man diese in den Ordner kopieren, in welcher das Vagrantfile liegt. Die Dateien sind 

Die Shared Folder werden mit dem Parameter config.vm.synced_folder im Vagrantfile definiert. 

        config.vm.synced_folder "./", "vagrant", disabled: true
        config.vm.synced_folder "www", "/vagrant/www"
        config.vm.synced_folder "sites-enabled", "/vagrant/sites-enabled"