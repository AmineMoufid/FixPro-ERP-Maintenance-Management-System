# 🚀 FixPro

**FixPro** est un système de gestion de projets conçu pour les entreprises qui réparent des machines pour leurs clients. Il permet aux administrateurs de gérer efficacement les clients, les machines, les techniciens et les interventions, tandis que les techniciens peuvent suivre et mettre à jour leurs tâches assignées.

---

## 🔹 Fonctionnalités

### **Pour les Administrateurs**

* Ajouter, modifier et gérer les **clients**
* Ajouter, modifier et gérer les **machines**
* Créer et assigner des **interventions** aux techniciens
* Ajouter ou supprimer d'autres **administrateurs** et **techniciens**
* Suivre toutes les interventions et l'état des machines

### **Pour les Techniciens**

* Connexion sécurisée
* Voir les **interventions assignées**
* Mettre à jour l’**état des machines** (ex. en cours, terminé)
* Rédiger des **descriptions des tâches réalisées**
* Recevoir des notifications pour les nouvelles tâches

---

## 🛠️ Stack Technologique

| Couche     | Technologie                                 |
| ---------- | ------------------------------------------- |
| Backend    | Java Spring Boot, JPA/Hibernate, PostgreSQL |
| Frontend   | React (Vite), Axios, SweetAlert2            |
| Sécurité   | JWT / Spring Security                       |
| Outils Dev | Maven, Git                                  |

---

## 📁 Structure du Projet

```
FixPro/
├── backend/        # Backend Spring Boot
│   ├── src/
│   ├── pom.xml
│   ├── application.properties
│   └── .gitignore
├── frontend/       # Frontend React Vite
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
├── README.md       # Documentation du projet
```

---

## 🖥️ Installation & Configuration (Développement Local)

### **1️⃣ Cloner le dépôt**

```bash
git clone https://github.com/AmineMoufid/FixPro.git
cd FixPro
```

### **2️⃣ Configuration de la Base de Données PostgreSQL**

1. Assurez-vous que **PostgreSQL** et **pgAdmin** sont installés.
2. Créez une nouvelle base de données dans pgAdmin, par exemple :

```
Nom de la BD : fixpro_db
Utilisateur : postgres
Mot de passe : votremotdepasse
```

3. Modifiez **backend/src/main/resources/application.properties** :

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/fixpro_db
spring.datasource.username=postgres
spring.datasource.password=votremotdepasse

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

> Assurez-vous que le nom de la base, l'utilisateur et le mot de passe correspondent à votre configuration.

### **3️⃣ Configuration du Backend (Spring Boot)**

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

* Le backend sera accessible sur [http://localhost:8089](http://localhost:8089)

### **4️⃣ Configuration du Frontend (React Vite)**

```bash
cd frontend
npm install
npm run dev
```

* Ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur.

### **5️⃣ Configuration d’Axios dans le Frontend**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8089/api', // URL du backend
});

export default api;
```

### **6️⃣ Initialiser la Base de Données (Optionnel)**

* Ajoutez des clients, machines et techniciens de test via les endpoints du backend ou pgAdmin.

### **7️⃣ Utilisation**

1. L’administrateur se connecte et ajoute clients, machines et techniciens.
2. L’administrateur crée des interventions et les assigne aux techniciens.
3. Les techniciens se connectent, consultent leurs tâches, mettent à jour les statuts et ajoutent des descriptions.
4. L’administrateur suit l’avancement.

### **8️⃣ Dépannage**

* **Erreur de connexion PostgreSQL :** Vérifiez `application.properties`.
* **Frontend ne charge pas :** Assurez-vous que le backend tourne sur `http://localhost:8089`.
* **Conflit de ports :** Modifiez le port du backend dans `application.properties` :

```properties
server.port=8089
```

---


## 👨‍💻 Contribution

1. Forkez le dépôt
2. Créez une branche pour votre fonctionnalité :

```bash
git checkout -b feature/ma-fonctionnalite
```

3. Committez vos modifications :

```bash
git commit -m "Ajout de ma fonctionnalité"
```

4. Pushez votre branche :

```bash
git push origin feature/ma-fonctionnalite
```

5. Ouvrez une **Pull Request**

---
