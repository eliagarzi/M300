# M300 Platformübergreifende Dienste

## Inhalt

Hier findet man die Dokumentationen zum Modul M300

* [1 - LB1 Themen, Vagrant und Docker]()
* [2 - LB2 Themen, Applikation Containerisieren]()

## LB1 

Für die LB1 wurden sich die Themen Vagrant und Docker angeschaut. Vagrant ist ein Tool, mit welchem sich Virtuelle Maschinen deklarativ aufsetzen lassen. Docker ist ein Container Runtime, auf welchem man Applikationen in Containern betreiben kann. 

## LB2 

Für die LB2 möchte ich meine eigene Arduino API Containerisieren und anschliessend auf der Azure Kubernetes Service in Betrieb nehmen. Diese besteht aus drei Bestandteilen / Containern:

- **NGINX Frontend** 

Durch das NGINX Frontend werden die Frontenddaten ausgeliefert. Dies betrifft die einzelnen HTML-Dateien, JavaScript und CSS Dateien. Der Frontendcontainer muss aus dem Internet erreichbar sein.

- **Node.js Backend**

Das Backend der API läuft auf Node.js. Auch das Backend muss aus dem Internet erreichbar sein und mit dem Redis Datenbankserver kommunizieren können.

- **Redis Datenbankserver**

Redis speichert die Daten der API. 