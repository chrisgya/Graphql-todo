# To calculate test coverage of our code we will use nyc

git init
git add .
git commit -m "Adding part1 changes"

docker exec -it graphql-todo_web_1 bash


docker run -d -p 27017:27017 --name my-mongo mongo:4.1.6