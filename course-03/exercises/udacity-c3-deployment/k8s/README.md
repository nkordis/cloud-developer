# Udagram Image Filtering Microservice

Udagram is a simple cloud application developed alongside the Udacity Cloud Engineering Nanodegree. It allows users to register and log into a web client, post photos to the feed, and process photos using an image filtering microservice.

### To run the project in a kunernetes cluster

1. Start a kubernetes cluster on AWS with kubeone https://github.com/kubermatic/kubeone
2. Configure the application. In the terminal within project directory run:
    kubectl apply -f aws-secret.yaml
    kubectl apply -f env-secret.yaml
    kubectl apply -f env-configmap.yaml
3. Create the deployments. Open a new terminal within the project directory and run:
     kubectl apply -f reverseproxy-deployment.yaml
     kubectl apply -f frontend-deployment.yaml
     kubectl apply -f backend-feed-deployment.yaml
     kubectl apply -f backend-user-deployment.yaml
4. Create the services. In the terminal within project directory run:
    kubectl apply -f reverseproxy-service.yaml
    kubectl apply -f frontend-service.yaml
    kubectl apply -f backend-user-service.yaml
    kubectl apply -f backend-feed-service.yaml
5. Port-forward the services. 
    Open a new terminal windows and run:
    kubectl port-forward service/reverseproxy 8080:8080

    Open a new terminal windows and run: 
    kubectl port-forward service/frontend 8100:8100
6. See the app.
  Open a browser window at http://localhost:8100
    

