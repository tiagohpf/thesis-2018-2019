export DOCKER_HOST="amalia-cluster-master.c.ptin.corppt.com:2375"
docker build -t amalia-cluster-master:5000/schoolfe . 
docker push amalia-cluster-master:5000/schoolfe
