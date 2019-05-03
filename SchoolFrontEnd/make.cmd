set DOCKER_HOST=amalia-cluster-master.c.ptin.corppt.com:2375
docker build -t amalia-cluster-master:5000/schoolfe:0.1.0 . 
docker push amalia-cluster-master:5000/schoolfe:0.1.0