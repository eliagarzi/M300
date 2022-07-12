# LB2 - Applikation Containerisieren

- [LB2 - Applikation Containerisieren](#lb2---applikation-containerisieren)
  - [Informieren](#informieren)
    - [Ziel](#ziel)
  - [Docker](#docker)
  - [Azure](#azure)
    - [Wie kann ich Azure nutzen?](#wie-kann-ich-azure-nutzen)
    - [Wie viel wird mich Azure kosten?](#wie-viel-wird-mich-azure-kosten)
    - [Zugriff auf Azure](#zugriff-auf-azure)
    - [Azure Kubernetes Service](#azure-kubernetes-service)
    - [Azure Container Registry](#azure-container-registry)
  - [Kubernetes](#kubernetes)
  - [Terraform](#terraform)
  - [Planen](#planen)
  - [Umsetzung](#umsetzung)
    - [Vorbereitung der Applikation](#vorbereitung-der-applikation)
    - [Dockerimages erstellen](#dockerimages-erstellen)
    - [Deklaratives Aufsetzen von Kubernetes auf Azure](#deklaratives-aufsetzen-von-kubernetes-auf-azure)
    - [Erstellen eines Kubernetes Deployments](#erstellen-eines-kubernetes-deployments)
  - [Testing](#testing)
  - [Abschluss](#abschluss)

## Informieren

---

### Ziel

- Eine Applikation als Containeranwendung bereitstellen

## Docker
Als erstes haben wir die Arbeit in drei Bereiche aufgeteilt. In Frontend, Backend und Datenbank. 
Wir haben als erstes die Docker-images erstllt. Um dies zu tun war der erste command: (Frontend)
    docker pull nginx
Nun konnten wir das nginx als basis für unser Frontend nutzen.  
FROM nginx
    COPY frontend /usr/share/nginx/html
    RUN rm /etc/nginx/nginx.conf
    RUN rm -r /etc/nginx/conf.d/
    COPY nginx.conf /etc/nginx/
    EXPOSE 80
---



## Azure

---

### Wie kann ich Azure nutzen?

### Wie viel wird mich Azure kosten?

### Zugriff auf Azure

### Azure Kubernetes Service

### Azure Container Registry

## Kubernetes

---

## Terraform

---

<https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs>

## Planen

## Umsetzung

---

### Vorbereitung der Applikation

1. Umgebungsvariablen

### Dockerimages erstellen

1. Images erstellen
2. Azure Registry erstellen & Hochladen

### Deklaratives Aufsetzen von Kubernetes auf Azure

1. Terraform File erstellen und Ressource definieren

### Erstellen eines Kubernetes Deployments

1. YAML-File aufbauen

## Testing

---

1. Testing aller funktionen
2. Erreichbarkeit prüfen
3. Verfügbarkeit prüfen

## Abschluss

---

- Reflexion
