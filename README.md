# Installation instructions:
- Install Node.js
- Install mySQL
- Clone repo
- Run `npm install`
- Run `mysql -u root -p < dbinit.sql`
- Use proper names and passwords in the connection-setup

# Push to deploy 
Push to deploy will allow you to push any new commits directly to the server running at: http://37.139.11.204/

- While in the repo folder run: `git remote add live "ssh://root@37.139.11.204/var/repo/site.git"`
- This will add the server as a new remote.
- To push any new commints to the server run `git push live master` to push the changes to the master branch on the server.
