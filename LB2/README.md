# LB2 - Applikation Containerisieren

Für die LB2 haben wir eine Applikation die aus drei Bestandteilen besteht mit Hilfe von Docker und Kubernetes auf Azure bereitgestellt.

- [LB2 - Applikation Containerisieren](#lb2---applikation-containerisieren)
  - [Informieren](#informieren)
    - [Was installiert wird](#was-installiert-wird)
    - [Ziele](#ziele)
  - [Azure](#azure)
    - [Wie kann ich Azure nutzen?](#wie-kann-ich-azure-nutzen)
    - [Wie viel wird mich Azure kosten?](#wie-viel-wird-mich-azure-kosten)
    - [Zugriff auf Azure](#zugriff-auf-azure)
    - [Azure Kubernetes Service](#azure-kubernetes-service)
    - [Azure Container Registry](#azure-container-registry)
  - [Kubernetes](#kubernetes)
  - [Komponenten](#komponenten)
    - [Cluster](#cluster)
    - [Architektur](#architektur)
      - [Master Node](#master-node)
      - [Worker Node](#worker-node)
    - [Weitere Bestandtiele](#weitere-bestandtiele)
      - [Pod](#pod)
      - [ConfigMaps & Secrets](#configmaps--secrets)
      - [Service](#service)
      - [Ingress](#ingress)
      - [Deployment](#deployment)
      - [Kubectl](#kubectl)
  - [Terraform](#terraform)
    - [Terraform Befehle](#terraform-befehle)
  - [Planen](#planen)
  - [Umsetzung](#umsetzung)
    - [Vorbereitung der Applikation](#vorbereitung-der-applikation)
    - [Dockerimages erstellen](#dockerimages-erstellen)
      - [Nginx Image erstellen](#nginx-image-erstellen)
    - [Node.js Image erstellen](#nodejs-image-erstellen)
    - [Redis erstellen](#redis-erstellen)
    - [Docker-Compose File](#docker-compose-file)
    - [Deklaratives Aufsetzen von Kubernetes auf Azure](#deklaratives-aufsetzen-von-kubernetes-auf-azure)
    - [Azure](#azure-1)
      - [Hochladen der Images auf Azure](#hochladen-der-images-auf-azure)
    - [Kubernetes Cluster vorbereiten](#kubernetes-cluster-vorbereiten)
    - [Workload auf Kubernetes Deployen](#workload-auf-kubernetes-deployen)
  - [## Abschluss](#-abschluss)

## Informieren

### Was installiert wird

Installiert wird die Arduino API, welche im Modul "Mikroprozessoranwendungen" von Elia Garzi programmiert wurde. Diese ist eine Node.js Applikation, die mit einem Redis-Datenbankserver kommuniziert. Das Frontend wird durch einen Nginx Server ausgeliefert.

### Ziele

- Eine Applikation in drei Containern bereistellen. Darunter einen Nginx Server, einem Redis-Datenbankserver und einem Nodejs-Server. Zwischen der Datenbank und Nodejs-Server soll eine Kommunikation stattfinden können.
- Ein Kubernetes Cluster und eine Image Registry mit Hilfe von Terraform deklarativ auf Microsoft Azure bereitstellen
- Den Service aus dem Internet auf Azure erreichbar machen

## Azure

---

### Wie kann ich Azure nutzen?

Azure ist die Cloud-Computing-Platvorm von Microsoft. Diese bietet alles von IaaS, PaaS und SaaS.
Die Platform kann für Entwicklung, Betrieb und Verwaltung von Anwendungen genutzt werden. Bereitstllung von Servicen, Speicherrecourcen und vieles mehr. Weitere Vorteile von Azue sind einfache Skallierbarkeit und Redundanzen für wichtige Anwendungen und Dienstleistungen wie zum Beispiel Webseiten oder Webapplickationen wie unsere Applikation.

### Wie viel wird mich Azure kosten?

Die Schüler der TBZ haben die Möglichkeit einen Student credit bei Azure ein zu lösen. Dieser beträgt 100$ und kann frei nach Wahl eingesetzt werden. Diesen kann man beziehen wenn man seine Kreditkarten Informationen auf Azure hinterlegt.

### Zugriff auf Azure

Der Zugriff auf Azure erfolgt per Browser, per Azure CLI, Azure PowerShell oder per Azure Cloud Shell.

### Azure Kubernetes Service

Der Azure Kubernetes Service ist Platform as a Service. Er bietet einem die Möglichkeit mit Kubernetes zu arbeiten, ohne das Cluster installieren zu müssen oder gross zu warten.

### Azure Container Registry

Die Azure Container Registry ermöglicht das Speichern von Containerimages in der Cloud. Dies wird dafür gebraucht, dass wird die Images, welche wir lokale erstellen und bauen in der Cloud speichern können und dass das Kubernetes Cluster auf dieses aus dem Internet zugängliche Repository auch abrufen kann.

## Kubernetes 

---

Für dieses Modul wollen wir mit Kubernetes arbeiten. Im Folgenden eine kleine Zusammenfassung zu Kubernetes.

## Komponenten

### Cluster

Kubernetes arbeitet mit Clustern. Ein Cluster besteht immer aus Master und Worker Nodes. Der Master ist zuständig für die Steuerung und die Worker Nodes sind für die Workloads zuständig.

### Architektur

![](./Images/2022-06-17-09-18-03.png)

#### Master Node

Steuert das Cluster

Bestandteile 

**API-Server**

Kommunikation mit dem Master und den Worker Nodes

Der API-Server ist die Schnittstelle in das Kubernetes Cluster. Die Kubernetes-API ermöglicht, die Erstellung von Deyploments, Replicasets oder Pods über eine REST-API Schnittstelle auf Basis von HTTP. 

Der API-Server nimmt HTTP-Anfragen an, kontrolliert, ob diese Richtig sind und führt sie aus. Der Zugriff auf die Kubernetes API funktioniert über das Kommandotool kubectl oder kubeadm. Es gibt auch GUIs für Kubernetes, wie z.B. das offizielle Kubernetes Dashboard.

Der API-Server kommuniziert mit den Worker Nodes mit Kubelet.

**Kube-Scheduler**

Steuerung der Worker Nodes

Der Kube-Scheduler übernimmt die Steuerung der Container. Er erkennt, wann mehr Container gebraucht werden. Auf welche Node ein Pod deployed werden soll, bestimmt er über die Auslastung. 

**Kube-Control-Manager**

KCM steuert verschiedene Controller. Darunter den Replication Controler, Entpoint Configuration, Namespace Controller oder Serviceaccount Controller.

KCM schaut, das der "Current State" im Cluster zum "Desired State" wird.

"In robotics and automation, a control loop is a non-terminal loop that regulates the state of a system."

Beispiel:

Wenn man am Thermostat die Temperatur auf 22° C setzt, dann ist die aktuelle Temperatur der "Current State" (Bspw. 18° C). Die 22° C sind der "Desired State". 

**etcd**

etcd ist ein konsitenter, hochverfügbarer und dezentraler Speicher. etcd ist kein Produkt von Kubernetes, sondern eine eigenständige Software. 

Alle Daten zum Cluster, also Konfigurationen und Statusinformationen, werden auf einer Schlüsseldatenbank gespeichert. Auf 

https://www.redhat.com/de/topics/containers/what-is-etcd

#### Worker Node

Kubernetes setzt Container in Pods und betreibt diese auf Worker Nodes. In jedem Kubernetes Cluster sollte es mehrere Worker Nodes geben. Worker Nodes können auch geografisch dezentralisiert sein, um die Verfügbarkeit zu erhöhen. 

Folgendes muss auf jeder Node installiert werden:

**Kubelet**

Kubelet steuert die Nodes. Es ist der primäre Node Agent. Er kommuniziert mit der Control Plane. Kubelet führt die Befehle aus, welche vom Control Plane kommen.

**Kubeproxy**

Der Kubeproxy wird auf jeder Worker Node ausgeführt. Der Kubeproxy funktioniert mit Kubernetes Services. Er leitet Anfragen weiter oder verteilt diese.

**Container Runtime** 

Das Container Runtime wird gebraucht, damit Container ausgeführt werden können. Docker, Containerd.

### Weitere Bestandtiele

**Persistent Storage**

Persistenter Storage für Kubernetes ist unabhängig von der darunterliegenden physischen Infrastruktur. Für viele Pods wird ein Persistener Speicher gebraucht, welcher die Daten behaltet.

**Container Registry**

Eine Container Registry speichert Images von Containern. Diese Images werden vom Kubernetes Cluster gebraucht, um neue Container zu erstellen. Ein Container Image ist wie das Baumaterial bei einem Haus. Aus dem Material (Image) wird ein funktionierendes Haus (Container)

#### Pod

Ein Pod ist die kleinmögliche Einheit im Kubernetes Environment. Ein Pod besteht aus mindestens einem Container. Pods ermöglichen die abstraktion zwischen Kubernetes und dem Containeranbieter. Z.b. Docker oder Containerd.

#### ConfigMaps & Secrets

ConfigMaps ermöglichen die Speicherung von Konfigurationen ausserhalb des Pods. Z.B. Datenbank URLS oder API URL.

Secrets speichern Informationen, die geheim bleiben sollen. Z.B. Datenbankpasswörter oder Verschlüsselungskeys.

#### Service

- Services steuern den Netzwerkzugriff auf einen Pod
- Eine permanente IP-Adresse, die an einen Pod gehängt wird
- Es gibt external Service und Internal Service
- Ein Service ist nicht an einen Pod gebunden und bleibt auch nach der Löschung des Pods bestehen

#### Ingress

Damit man mit Domainnamen arbeiten kann, stellt Kubernetes Ingress bereit. Dieser Dienst leitet anfragen einer Domain auf den internen Service weiter

#### Deployment

Ein Deployment beschreibt ein deklaratives Update für Pods oder ReplicaSets. Im Deployment beschreibt man den "desired state". Daraufhin ändert der Kube-Control-Manager, genauer der Deployment Controller, den current state im Cluster zum beschriebenen desired state.

#### Kubectl

Kubectl ist ein Interface, welches genutzt werden kann, um mit Kubernetes zu komunizieren. Es ist ein CLI-Tool. 


## Terraform

---

Terraform ist ein Infrastructure as Code Tool. Es kann dazu genutzt werden, um Ressourcen deklarativ aufzusetzen. Das heisst, man bestimmt, wie die Lösung aussehen soll und nicht, wie man zu der Lösung kommt. Mit einem HCL (Terraform) Script definiere ich nur die Ressourcen, die ich brauche. Es geht also um das WAS. Mit einem PowerShell Script könnte ich manuell ressourcen erstellen, man spricht von imperativ. Es geht also darum, WIE eine Ressource erstellt werden soll.

Im folgenden wird Terraform Grundlegend besprochen. Die Dokumentation zum Azure Terraform Provider findet man auf der offiziellen Terraform Seite.

<https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs>

**Terraform Provider:**

Ein Terraform Provider ist ein Plugin, welches die Kommunikation zwischen Terraform und der Plattform (Azure, GCP, AWS) ermöglicht. Ein Terraform Provider definiert, welche Ressourcentypen von Terraform gemanaged werden können. Terraform Provider werden entweder von HashiCorp selbst, von Plattformen oder von selbstständigen Developern entwickelt. Über <https://registry.terraform.io/browse/providers> kann man sich alle Provider und deren Dokumentation anschauen.

In jedem Konfigurationsfile von Terraform muss ein Provider angegeben werden:

    terraform {
      required_providers {
        azurerm = {
          source  = "hashicorp/azurerm"
          version = "=3.0.0"
        }
      }
    }

    provider "azurerm" {
      features {}
    }

**Terraform State File:**

Wenn man mit Terraform Ressourcen erstellt, speichert Terraform die Informationen darüber im JSON-Format in .tfstate Files. Dieser State wird auch gebraucht, um die vorhandende Infrastruktur mit der geplanten Infrastruktur abzugleichen. Es ist nicht empfohlen, die .tfstate Files manuell zu ändern.

**HasiCorp Configuration Language**

HCL ist eine deklarative Sprache, die für Terraform Konfigurationen gebraucht wird. Die Syntax von HCL ist sehr einfach. 

**Blöcke und Identifier**

Ressourcen werden in Blöcken dargestellt und haben immer einen Namen, der nur von Terraform abgerufen werden kann. Dieser Name kann von anderen Ressourcen referenziert werden. In Terraform heissen diese "Identifier". Um auf die Ressource im Beispiel unten zu referenzieren, wäre das azurerm_linux_virtual_machine.svhzh1mail.

- Eine Ressource wird immer durch einen Block dargestellt
- Blöcke können auch verschachtelt werden. Siehe den Block network_interface {} im Block resource google_compute_instance {}.

    resource "azurerm_linux_virtual_machine" "svhzh1mail" {
      name                = "test"
      resource_group_name = "azure-vms"
      location            = "Switzerland North"
      size                = "Standard_F2"
      admin_username      = "adminuser"
    }

**Argumente**

- In jedem Block arbeitet man mit Argumenten. Diese Argumente beschreiben die Ressource. Argumente haben immer einen Schlüssel und einen Wert. 
- Dabei können Argumente einfache Key/Value Paare sein, es gibt aber auch Key/Array. Also dass ein Schlüssel mehrere Werte haben kann.

Key/Value

        network_ip = "10.60.0.10"

Key/Array

        tags         = ["production", "http-server", "replication-server"]

**Input Variablen**

Viele Werte wiederholen sich in Terraform. Um dies zu vereinfachen, gibt es in Terraform auch Variablen. Es gibt dabei viele verschiedene Variablentypen.

Variablen werden mit einem Variablen Block bestimmt. 

      variable "availability_zone_names" {
        type    = list(string)
        default = ["europe-west6-a"]
      }

**Depends_on**

Der Depends_on Block beschreibt Abhängigkeiten im Terraform Konfigurationsfile. Er kann also dazu gebraucht werden, dass z.B. bei der Erstellung einer virtuellen Maschine, welche das Netzwerk "management-zh1" braucht, zuerst gewartet wird, bis dieses Netzwerk erstellt ist.

        depends_on = [
            azurerm_resource_group.kubernetes_group,
            azurerm_container_registry.registry-zh1,
            azurerm_virtual_network.management-zh1
        ]

### Terraform Befehle

**init**

Mit terraform init bereit man ein Verzeichnis auf das Arbeiten mit Terraform vor. Bevor man init ausführt, sollte im Verzeichnis bereit in .tf Konfigurationsfile liegen. Während init installiert Terraform die benötigten Provider Plugins und bereitet das Backend vor.

**destroy**

Löscht jegliche Infrastruktur, die per Terraform Konfiguration verwaltet wird

**plan**

Mit plan erstellt Terraform ein Plan davon, welche Änderungen Terraform plant durchzuführen. Dabei gleicht Terraform ab, ob die aktuelle Infrastruktur korrekt im aktuellen state erfasst ist. Anschliessend vergleicht Terraform die unterschiedlichen States und schlägt die Änderungen vor, welche es beim apply machen würde.

**apply**

Mit apply wird die Konfiguration die im .tf File angegeben ist ausgeführt und erstellt. Dabei geht Terraform folgendermassen vor: 

- Ressourcen die im aktuellen State gespeichert sind aber nicht in der neuen Konfiguration werden gelöscht.

## Planen

1. Die Appliktaion für die Nutzung als Containeranwendung bereitmachen
2. Die einzelnen Dockerimages erstellen
3. Testing der Images auf einem lokalen Computer mit Docker Compose
4. Deklaratives aufsetzen der Azure Ressourcen
5. Hochladen der Images auf Azure
6. Deployments auf Azure Kubernetes Service bereitstellen

## Umsetzung

---

### Vorbereitung der Applikation

Die Applikation nutzt verschiedene Umgebungsvariablen. Diese müssen auch in den Containern entsprechend konfiguriert werden können. 

### Dockerimages erstellen

#### Nginx Image erstellen

Wir haben die Arbeit in drei Bereiche aufgeteilt. In Frontend, Backend und Datenbank. 

Zuerst haben wir die Fronend Dateien der Applikation heruntergeladen. Diese hatten wir vom letzten Modul bereits parat. Man musste sie nur noch aus dem Github Repository herunterladen.
Als zweites haben wir das base-img von Nginx heruntergeladen, welches von den offiziellen Entwicklern von Nginx bereitgestellt wird.

    docker pull nginx

Bevor wir nun das Fertige Image erstellen konnten mussten wir noch das nginx.conf File anpassen. Damit die richtigen Frontend Dateien geladen werden.

    user nginx;
    worker_processes auto;
    error_log /var/log/nginx/error.log;
    pid /run/nginx.pid;
    include /usr/share/nginx/modules/*.conf;
    events {
        worker_connections 1024;
    }
    http {
        log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                          '$status $body_bytes_sent "$http_referer" '
                          '"$http_user_agent" "$http_x_forwarded_for"';
        access_log  /var/log/nginx/access.log  main;
        sendfile            on;
        tcp_nopush          on;
        tcp_nodelay         on;
        keepalive_timeout   65;
        types_hash_max_size 2048;
        include             /etc/nginx/mime.types;
        default_type        application/octet-stream;
        server {
            listen       80;
            server_name  127.0.0.1;
            root /usr/share/nginx/html;
            index index.html;
            location / {}  
        }
    }

Nun konnten wir das Nginx Image als basis für unser Frontend Docker-Image nutzen. So sah das Dockerfile aus:

1. Zuerst wird das Nginx Image als Baseimage gewählt
2. Daraufhin wird der Frontend Ordner in das Webverzeichnis vom Nginx-Server kopiert
3. Nun wird die Hauptkonfiguration von Nginx zusammen mit dem Konfigurationsordner gelöscht
4. Die neue Konfiuration mit unseren Anpassungen wird in das Image kopiert
5. Standardmässig wird der Container auf Port 80 geöffnet
   
    FROM nginx
    COPY frontend /usr/share/nginx/html
    RUN rm /etc/nginx/nginx.conf
    RUN rm -r /etc/nginx/conf.d/
    COPY nginx.conf /etc/nginx/
    EXPOSE 80

### Node.js Image erstellen

Node.js ist ein Runtime für JavaScript und kann dafür genutzt werden, JavaScript ausserhalb vom Browser zu betreiben. 

**Node.js Dockerfile**

1. Als Baseimage wird Node 16 genutzt, ein offizielles Image der Nginx Entwickler. Hier ist Node.js und NPM bereits installiert
2. Als "Workdir" geben wir /app/ an, dass heisst, alle folgenden Befehle werden in dieses Verzeichnis ausegeführt
3. Anschliessend wird die Paketliste geupdatet, da noch NPM Packages installiert werden müssen
4. Nun werden die beiden package.json Files in das /app/ Verzeichnis kopiert. In diesen stehen die Abhängigkeiten der Node.js Applikation
5. Nun installieren wir alle Packages, die in den .json Files definiert sind
6. Mit Copy . . kopiert man alle Serverdateien in das /app/ Verzeichnis
7. Anschliessend werden zwei Standardwerte für Umgebungsvariablen definiert, diese können später jederzeit überschrieben werden
8. Mit Expose definieren wird, dass der Container immer auf den Ports 3001 und 3000 geöffnet werden söll
9. Zuletzt wird die Node.js Applikation, die im Verzeichnis /app/ liegt, gestartet

      FROM node:16 
      WORKDIR /app/
      RUN apt update 
      COPY . /app/
      COPY package*.json .
      RUN npm install
      COPY . .
      ENV API_PORT=3001
      ENV SOCKETIO_SERVER_PORT=3000
      EXPOSE 3001
      EXPOSE 3000
      CMD [ "npm", "start"]

**YAML-Deployment**

Im YAML-Deployment ist es vor allem speziell, dass der Node.js Server viele Umgebungsvariablen braucht, die man auch im YAML-File definieren muss.

        env:
            - name: CORS_SOURCE_PORT
              value: "5501"
            - name: CORS_SOURCE_DOMAIN
              value: "localhost"
            - name: CORS_SOURCE_PROTOCOL
              value: "http"
            - name: "REDIS_IP"
              value: arduino-redis-service
            - name: REDIS_PORT
              value: "6379"
            - name: SOCKETIO_SERVER_PORT
              value: "3000"
            - name: API_PORT
              value: "3001"

### Redis erstellen

Wir brauchen auch noch einen Redis-Datenbankserver. Diese läuft ebenfalls in einem Container. Für Redis müssen wir allerdings kein eigenes Image erstellen, da das Baseimage bereit funktioniert.

Im YAML-File definieren wir zuerst wieder das Deployment an sich und daraufhin einen Service, welchen den Port 6379 auf den Port des Containerhosts forwarded.

      apiVersion: apps/v1   
      kind: Deployment
      metadata:
        name: arduino-redis-deployment
        labels:
          app: arduino-redis
      spec:
        replicas: 1
        selector:
          matchLabels:
            app: arduino-redis
        template:
          metadata:
            labels:
              app: arduino-redis
          spec:
            containers:
            - name: arduino-redis-container
              image: redis
              ports:
              - containerPort: 6379
      ---
      apiVersion: v1
      kind: Service
      metadata:
        name: arduino-redis-service
      spec:
        type: LoadBalancer
        selector:
          app: arduino-redis
        ports:
          - protocol: TCP
            name: tcp-6379
            port: 6379
            targetPort: 6379

### Docker-Compose File 

Docker Compose ermöglicht das Betreiben von mehreren Containern und dies über ein einziges Docker-Compose File.

      version: "3.8"
      services:
        nginx-container:
          container_name: nginx-container
          image: garseb/m300nginx
          hostname: nginx-container
          restart: always
          ports:
            - 80:80

        redis-container:
          container_name: redis-server
          image: redis
          hostname: redis-container
          restart: always
          ports:
            - 6379:6379

        api-server:
          container_name: api-server
          depends_on: # Mit depends_on kann man festlegen, dass die Erstellung vom Nodejs-Server erst beginnen soll, wenn der Redisserver fertig ist
            - redis-container
          image: garseb/m300node
          restart: always
          ports: # Unter Ports definiert man die einzelnen Ports, welche auf dem Container geöffnet werden sollen
            - 3001:3001
            - 3000:3000
          environment: #Umgebungsvariablen, die später im Container genutzt werdn können
            API_PORT: 3001
            SOCKETIO_SERVER_PORT: 3000
            REDIS_IP: redis-container
            REDIS_PORT: 6379
            CORS_SOURCE_PROTOCOL: http
            CORS_SOURCE_DOMAIN: 127.0.0.1
            CORS_SOURCE_PORT: 80

### Deklaratives Aufsetzen von Kubernetes auf Azure

Ein weiteres Ziel von uns war es, Azure Kubernetes Service deklarativ aufzusetzen. Ich (Elia) habe bereits Erfahrung mit Terraform auf der Google Cloud Platform. 

Im ersten Teil des Terraform Scripts definieren wir eine Azure Container Registry Ressource. Diese wird später dafür gebraucht, um die Images für das Kubernetes Cluster zu speichern.

      resource "azurerm_container_registry" "garseb" {
        name                = "garseb"
        resource_group_name = azurerm_resource_group.kubernetes_group.name
        location            = azurerm_resource_group.kubernetes_group.location
        sku                 = "Basic"
      }

Anschliessend wird im Terraform das Kubernetes Cluster selbst definiert.

      resource "azurerm_kubernetes_cluster" "kubernetes_cluster" {
        depends_on = [
          azurerm_resource_group.kubernetes_group,
          azurerm_container_registry.registry-zh1
        ]

        name                = "kubernetes-zh1"
        location            = azurerm_resource_group.kubernetes_group.location
        resource_group_name = azurerm_resource_group.kubernetes_group.name
        dns_prefix          = "kubernetes-zh1"

        default_node_pool {
          name       = "knodepool"
          node_count = 1
          vm_size    = "Standard_D2_v2"
        }

        identity {
          type = "SystemAssigned"
        }    
      }

### Azure

#### Hochladen der Images auf Azure

Zuerst muss man die Module für Azure in PowerShell installieren, damit man Azure Befehle in PowerShell nutzen kann.

        Install-module az

Anschliessend kann man sich bei Azure authentifizieren. 

        connect-azaccount

![](2022-07-11-17-55-02.png)

Um nun anschliessend ein Image ein Image hochzuladen, muss man sich mit dieser Registry noch verbinden:

        Connect-AzContainerRegistry -Name garseb

Nun muss man die einzelnen Images vorbereiten, dafür muss man diese mit einem entsprechenden Tag versehen.

        docker tag garseb/m300nginx garseb.azurecr.io/garseb/m300nginx

Anschliessend kann man das Image auf die Registry pushen

        docker push garseb.azurecr.io/garseb/m300ninx

Über das Azure GUI lassen sich die Images nun auch anschauen.

![](2022-07-12-08-24-46.png)

### Kubernetes Cluster vorbereiten

Das Kubernetes Cluster wurde per Terraform Script erstellt. Anschliessend muss man für das Cluster noch Verbindung zu einer Container Registry herstellen.

        az aks update -n kubernetes-zh1 -g kubernetes-group --attach-acr garseb

Daraufhin kann das Kubernetes Cluster auf Images aus der Container Registry laden.

### Workload auf Kubernetes Deployen

Um ein Workload auf dem Kubernetes Cluster zu deployen, kann man dies entweder über das Azure GUI machen oder über die Cloud Console. 

Im Webgui wählt man unter dem Cluster > Workloads > Create with YAML aus. Hierhin können wir unsere YAML-Files kopieren und die entsprechenden Deployments werden erstellt. Diese YAML-Files werden mit wichtigen Informationen von Kubernetes selbst erweitert und auf dem dezentralen Clusterspeicher etcd gespeichert.

**Änderungen an Deployments vornehmen**

Kubernetes nutzt den Kubecontrol Manager, um die Konfigurationsdateien, die auf dem etcd gespeichert sind mit der Konfiguration der laufenden Deployments abzugleichen. Im Azure GUI kann man also auf das Deployment gehen und unter YAML, dieses jederzeit bearbeiten.

![](2022-07-12-08-33-08.png)

## Abschluss
---

**Sebastian**

Mit Hilfe dieses Projekts konnte ich die Grundlagen von Docker festigen. Es war mir möglich noch einmal die wichtigsten Basics zu repetieren und zu verstehen. Ich konnte auch neues lernen, z.B. wie das mit den nginx.conf Files funktioniert. Ebenfalls konnte ich mich auch mit dem Thema Kbernetis beschäftigen auch wenn die Zeit am Schluss nicht mehr gereicht hat um dies auf der Technischen Ebene nachhaltig zu verstehen. Klar ist Cloud wird die Zukunft sein, resp. ist sie schon. Ebenfalls wurde verstehe ich das Konzept hinter der Technologie und warum diese so genial ist. Aus meiner sich ist das am wichtigsten.

**Elia**

Dieses Modul war sehr spannend. Ich habe während dem Modul das IaC Tool Terraform durch Herr Calisto kennengelernt und damit viel auf GCP herumexperimentiert. Dadurch habe ich auch das Potenzial dieses Tools erkannt. Mit Docker habe ich bereits im Modul M239 viel Erfahrung gesammelt. Auch mit Kubernetes habe ich die ersten Dinge gemacht. Dafür habe ich einen 4-Stündigen Kurs auf YouTube geschaut.