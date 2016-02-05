This was my first experience with Symfony2. I tried to develop a server that made requests to the Github and Packagist APIs to get the relation between 2 users who own a package and who contributed to those packages.

---

I am pretty sure that something on the server isn't well placed

---

How it works
* The Symfony server works only as a proxy between the APIs and the frontend (the frontend uses Dijkstra's algorithm to calculate path)
* The usernames input are searched to see if they have any package in Packagist (as vendor), after all the users who contributed to that project are retrieved from Github
  * This is a recursive step, so the same thing is done for the new users found (which means the path is made by people who contribute to projects who have created at least one project of their own)
* Symfony is not doing anything async, but it should. For the Github requests I made my own function with curl, for the Packagist request I used a package to navigate it's API
* The recursive step is taken by the frontend, that keeps making new requests (for this to work the Graph object with all the nodes is kept in an anonymous session)

---

##### Limitations
* There is no validation on the forms
* It only finds paths made by the contributors to the projects the initial users have, not the projects that those users contributed to
* It has not been fully tested in any way (I need to learn how to do better testing)
* It is slow and heavy!!!!!
