# How to run

1. Install all dependencies 
npm install

2. Download postgres

3. In package.json add - "type": "module"

4. In dbconfig/knexfile.js uncomment line 12

5. Run knex migrate:latest --knexfile ./dbconfig/knexfile.js

6. Comment again line 12 in dbconfig/knexfile

7. Remove "type": "module" from package.json

8. Run npm start
